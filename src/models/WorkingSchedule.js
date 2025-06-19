const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const WorkingScheduleScheme = new Schema(
  {
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    workDate: { type: Date, required: true },
    startTime: { type: String, required: true },  // VD: "08:00"
    endTime: { type: String, required: true },
    // Số phút cho mỗi ca (slot), ví dụ: 15, 30, 60
    shiftDuration: { type: Number, required: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('WorkingSchedule', WorkingScheduleScheme);