const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HospitalSchema = new Schema(
  {
    doctors: [{ type: Schema.Types.ObjectId, ref: 'Doctor' }],
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: String },
    images: [{ type: String }], 
    type: {
      type: String,
      enum: ['hospital', 'clinic'],
    },
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
module.exports = mongoose.model('Hospital', HospitalSchema);