const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DoctorSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    specialty: { type: String, required: true },
    description: { type: String, required: true },
    
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('Doctor', DoctorSchema);