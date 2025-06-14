const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DoctorSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty',required: true }],
    position: { type: String },
    qualification: { type: String, required: true },
    experience: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('Doctor', DoctorSchema);