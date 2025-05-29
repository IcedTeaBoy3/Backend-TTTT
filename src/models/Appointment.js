const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AppointmentScheme = new Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkingSchedule', required: true },
    timeSlot: { type: String, required: true }, // VD: "09:30"
    reason: { type: String, required: true },
    stt: { type: Number, required: true }, // Số thứ tự của lịch hẹn
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
      default: 'pending' 
    },

  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('Appointment', AppointmentScheme);