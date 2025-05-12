const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AppointmentScheme = new Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentTime: { type: Date, required: true },
    reason: { type: String, required: true },
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