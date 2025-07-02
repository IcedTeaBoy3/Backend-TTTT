const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DoctorSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital'},
    specialties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Specialty',required: true }],
    position: { type: String },
    qualification: { type: String, required: true },
    yearExperience: { type: Number},
    description: { type: String },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('Doctor', DoctorSchema);