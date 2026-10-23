import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    callerName: { type: String, required: true },
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fromStatus: { type: String, default: null },
    toStatus: { type: String, required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: function () {
        return this.company || 'Client Lead';
      },
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    service: {
      type: String,
      default: 'General CRM Service',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'New',
        'Connected',
        'Interested',
        'Not Interested',
        'Callback Required',
        'Invalid Number',
        'Converted',
      ],
      default: 'New',
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    assignedToName: {
      type: String,
      default: 'Unassigned',
    },
    callbackDate: {
      type: Date,
      default: null,
    },
    lastContactedAt: {
      type: Date,
      default: null,
    },
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model('Lead', leadSchema);
export default Lead;
