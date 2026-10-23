import fs from 'fs';
import csvParser from 'csv-parser';
import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

// @desc    Get leads (filtered by role)
// @route   GET /api/leads
export const getLeads = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, count: 0, leads: [] });
    }

    const conditions = [];

    // If not Super Admin, only show assigned leads
    if (req.user.role !== 'Super Admin') {
      conditions.push({
        $or: [
          { assignedTo: req.user._id },
          ...(req.user.name ? [{ assignedToName: req.user.name }] : []),
        ],
      });
    }

    const { status, search, assignedTo } = req.query;

    if (status && status !== 'ALL') {
      conditions.push({ status });
    }

    if (assignedTo && req.user.role === 'Super Admin') {
      if (assignedTo === 'UNASSIGNED') {
        conditions.push({ assignedTo: null });
      } else if (assignedTo !== 'ALL') {
        conditions.push({ assignedTo });
      }
    }

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};
    const leads = await Lead.find(query).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, count: leads.length, leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update lead status & log call activity timeline
// @route   PATCH /api/leads/:id/status
export const updateLeadStatus = async (req, res) => {
  try {
    const { status, note, callbackDate } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Callers can only update their own leads
    if (req.user.role === 'Caller' && String(lead.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this lead' });
    }

    if (status === 'Callback Required' && !callbackDate) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory callback date & time required for Callback Required status',
      });
    }

    const historyEntry = {
      callerName: req.user.name,
      callerId: req.user._id,
      fromStatus: lead.status,
      toStatus: status,
      note: note || `Status updated to ${status}`,
      timestamp: new Date(),
    };

    lead.status = status;
    lead.lastContactedAt = new Date();
    lead.callbackDate = status === 'Callback Required' ? new Date(callbackDate) : null;
    if (note) {
      lead.notes = note;
    }
    lead.history.unshift(historyEntry);

    await lead.save();

    res.status(200).json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Assign single or multiple leads to a caller
// @route   POST /api/leads/assign
export const assignLeads = async (req, res) => {
  try {
    const { leadIds, callerId } = req.body;

    if (!leadIds || !leadIds.length) {
      return res.status(400).json({ success: false, message: 'No lead IDs provided' });
    }

    let callerName = 'Unassigned';
    if (callerId) {
      const caller = await User.findById(callerId);
      if (!caller) {
        return res.status(404).json({ success: false, message: 'Caller not found' });
      }
      callerName = caller.name;
    }

    const updateDoc = {
      assignedTo: callerId || null,
      assignedToName: callerName,
    };

    await Lead.updateMany({ _id: { $in: leadIds } }, { $set: updateDoc });

    res.status(200).json({
      success: true,
      message: `Assigned ${leadIds.length} leads to ${callerName}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Auto-distribute leads round-robin among active callers
// @route   POST /api/leads/auto-distribute
export const autoDistributeLeads = async (req, res) => {
  try {
    const { leadIds } = req.body;

    // Fetch active callers
    const callers = await User.find({ role: 'Caller', status: 'Active' });
    if (!callers.length) {
      return res.status(400).json({ success: false, message: 'No active callers available to distribute' });
    }

    // Target leads: either specified or unassigned
    let query = leadIds && leadIds.length ? { _id: { $in: leadIds } } : { assignedTo: null };
    const leadsToDistribute = await Lead.find(query);

    if (!leadsToDistribute.length) {
      return res.status(200).json({ success: true, message: 'No leads found to distribute', count: 0 });
    }

    // Round-robin assignment
    let callerIndex = 0;
    const bulkOps = leadsToDistribute.map((lead) => {
      const assignedCaller = callers[callerIndex % callers.length];
      callerIndex++;

      return {
        updateOne: {
          filter: { _id: lead._id },
          update: {
            $set: {
              assignedTo: assignedCaller._id,
              assignedToName: assignedCaller.name,
            },
            $push: {
              history: {
                callerName: req.user.name,
                callerId: req.user._id,
                fromStatus: lead.status,
                toStatus: lead.status,
                note: `Auto-distributed via Round-Robin to ${assignedCaller.name}`,
                timestamp: new Date(),
              },
            },
          },
        },
      };
    });

    await Lead.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: `Successfully auto-distributed ${leadsToDistribute.length} leads among ${callers.length} callers`,
      count: leadsToDistribute.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Upload CSV leads with auto-split round-robin option
// @route   POST /api/leads/upload-csv
export const uploadCsvLeads = async (req, res) => {
  try {
    const {
      leads: rawLeads,
      autoDistribute,
      assignedTo,
      createTask = true,
      taskTitle,
      taskDueDate,
      taskPriority = 'High',
    } = req.body;

    let leadsArray = rawLeads;

    // If file was uploaded via multipart/form-data
    if (req.file) {
      leadsArray = [];
      await new Promise((resolve, reject) => {
        fs.createReadStream(req.file.path)
          .pipe(csvParser())
          .on('data', (row) => leadsArray.push(row))
          .on('end', resolve)
          .on('error', reject);
      });
      fs.unlinkSync(req.file.path);
    }

    if (!leadsArray || !leadsArray.length) {
      return res.status(400).json({ success: false, message: 'No lead rows found to import' });
    }

    let activeCallers = [];
    let singleCaller = null;

    if (assignedTo && assignedTo !== 'UNASSIGNED' && assignedTo !== 'AUTO_DISTRIBUTE') {
      singleCaller = await User.findById(assignedTo);
    } else if (autoDistribute || assignedTo === 'AUTO_DISTRIBUTE') {
      activeCallers = await User.find({ role: 'Caller', status: 'Active' });
    }

    let callerIdx = 0;
    const leadsToInsert = leadsArray.map((row) => {
      let assignedId = null;
      let assignedName = 'Unassigned';

      if (singleCaller) {
        assignedId = singleCaller._id;
        assignedName = singleCaller.name;
      } else if (activeCallers.length > 0) {
        const caller = activeCallers[callerIdx % activeCallers.length];
        assignedId = caller._id;
        assignedName = caller.name;
        callerIdx++;
      }

      const companyVal = row.company || row.Company || '';
      const phoneVal = String(row.phone || row.Phone || row['Phone Number'] || row['Mobile'] || '').replace(/\s+/g, '');
      const cityVal = row.city || row.City || '';
      const serviceVal = row.services || row.Services || row.service || row.Service || 'Custom IT Solutions';
      const nameVal = row.name || row.Name || companyVal || 'Client Lead';

      return {
        name: nameVal,
        phone: phoneVal,
        email: row.email || row.Email || '',
        company: companyVal,
        city: cityVal,
        service: serviceVal,
        notes: row.notes || row.Notes || '',
        status: 'New',
        assignedTo: assignedId,
        assignedToName: assignedName,
        history: [
          {
            callerName: req.user.name,
            callerId: req.user._id,
            fromStatus: null,
            toStatus: 'New',
            note: assignedName !== 'Unassigned'
              ? `Imported and directly assigned to ${assignedName}`
              : 'Imported via CSV bulk upload',
            timestamp: new Date(),
          },
        ],
      };
    });

    const inserted = await Lead.insertMany(leadsToInsert);

    // Auto-create calling task for assignee(s) so it appears immediately on their screen
    const createdTasks = [];
    if (createTask) {
      const dueDate = taskDueDate ? new Date(taskDueDate) : new Date(Date.now() + 24 * 3600 * 1000);

      if (singleCaller) {
        const t = await Task.create({
          title: taskTitle || `Call & WhatsApp: Batch of ${inserted.length} new assigned leads`,
          priority: taskPriority || 'High',
          status: 'Pending',
          assignedTo: singleCaller._id,
          assignedToName: singleCaller.name,
          dueDate,
        });
        createdTasks.push(t);
      } else if (activeCallers.length > 0) {
        for (const caller of activeCallers) {
          const countForCaller = inserted.filter((l) => String(l.assignedTo) === String(caller._id)).length;
          if (countForCaller > 0) {
            const t = await Task.create({
              title: taskTitle || `Call & WhatsApp: Batch of ${countForCaller} new leads assigned via CSV`,
              priority: taskPriority || 'High',
              status: 'Pending',
              assignedTo: caller._id,
              assignedToName: caller.name,
              dueDate,
            });
            createdTasks.push(t);
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${inserted.length} leads successfully${createdTasks.length ? ' and created calling tasks' : ''}`,
      count: inserted.length,
      autoDistributed: autoDistribute || assignedTo === 'AUTO_DISTRIBUTE',
      assignedTo: singleCaller ? singleCaller.name : null,
      leads: inserted,
      tasks: createdTasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create a single lead
// @route   POST /api/leads
export const createLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      company,
      city,
      service,
      notes,
      assignedTo,
      createTask = false,
      taskTitle,
      taskDueDate,
      taskPriority = 'High',
    } = req.body;

    let assignedToName = 'Unassigned';
    let callerObj = null;
    if (assignedTo) {
      callerObj = await User.findById(assignedTo);
      if (callerObj) assignedToName = callerObj.name;
    }

    const lead = await Lead.create({
      name,
      phone: String(phone || '').replace(/\s+/g, ''),
      email: email || '',
      company: company || '',
      city: city || '',
      service: service || 'Custom Web Development',
      notes: notes || '',
      status: 'New',
      assignedTo: assignedTo || null,
      assignedToName,
      history: [
        {
          callerName: req.user.name,
          callerId: req.user._id,
          fromStatus: null,
          toStatus: 'New',
          note: assignedToName !== 'Unassigned' ? `Lead created and assigned to ${assignedToName}` : 'Lead created manually',
          timestamp: new Date(),
        },
      ],
    });

    let createdTask = null;
    if (createTask && callerObj) {
      createdTask = await Task.create({
        title: taskTitle || `Call & WhatsApp new lead: ${name} (${service || 'IT Inquiry'})`,
        priority: taskPriority,
        status: 'Pending',
        assignedTo: callerObj._id,
        assignedToName: callerObj.name,
        dueDate: taskDueDate ? new Date(taskDueDate) : new Date(Date.now() + 24 * 3600 * 1000),
      });
    }

    res.status(201).json({ success: true, lead, task: createdTask });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add note to a lead
// @route   PATCH /api/leads/:id/note
export const addLeadNote = async (req, res) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes = note.trim();
    lead.history.unshift({
      callerName: req.user.name,
      callerId: req.user._id,
      fromStatus: lead.status,
      toStatus: lead.status,
      note: note.trim(),
      timestamp: new Date(),
    });

    await lead.save();
    res.status(200).json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

