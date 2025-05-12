const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HospitalSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('Hospital', HospitalSchema);