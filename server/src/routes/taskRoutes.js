import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

// Get tasks
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'Super Admin') {
      query.$or = [{ assignedTo: req.user._id }, { assignedToName: req.user.name }];
    }
    const tasks = await Task.find(query).sort({ dueDate: 1 });
    res.status(200).json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, priority, assignedTo, assignedToName, dueDate, deliverableUrl } = req.body;
    let targetAssigneeId = assignedTo || req.user._id;
    let targetAssigneeName = assignedToName;
    if (!targetAssigneeName && targetAssigneeId) {
      const u = await User.findById(targetAssigneeId);
      if (u) targetAssigneeName = u.name;
    }
    if (!targetAssigneeName) {
      targetAssigneeName = req.user.name;
    }
    const task = await Task.create({
      title,
      priority: priority || 'Medium',
      assignedTo: targetAssigneeId,
      assignedToName: targetAssigneeName,
      dueDate: dueDate || new Date(),
      deliverableUrl: deliverableUrl || '',
    });
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update task status
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

