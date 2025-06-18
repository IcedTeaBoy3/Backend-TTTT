const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SpecialtySchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
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
module.exports = mongoose.model('Specialty', SpecialtySchema);