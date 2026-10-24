import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    punchIn: {
      type: Date,
      default: null,
    },
    punchOut: {
      type: Date,
      default: null,
    },
    durationHours: {
      type: Number,
      default: null,
    },
    workSummary: {
      type: String,
      default: '',
    },
    leaveReason: {
      type: String,
      default: '',
    },
    leaveType: {
      type: String,
      default: 'Full Day Leave',
    },
    status: {
      type: String,
      enum: ['Present', 'Late', 'Half Day', 'Absent', 'Leave'],
      default: 'Present',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate punch-ins on the same calendar day for a user
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
