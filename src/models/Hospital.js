const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HospitalSchema = new Schema(
  {
    doctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
    // Bác sĩ liên kết với bệnh viện
    specialties: [{ type: Schema.Types.ObjectId, ref: 'Specialty' }],
    // Lịch khám liên kết với bệnh viện
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    images: [{ type: String }], 
    type: {
      type: String,
      enum: ['hospital', 'clinic'],
    }
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('Hospital', HospitalSchema);