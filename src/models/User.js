const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    name: { type: String, maxLength: 255 },
    email: { type: String, maxLength: 255, required: true,unique: true },
    password: { type: String, maxLength: 255 },
    phone: { type: String },
    avatar: { type: String },
    role: { type: String, enum: ['admin', 'patient', 'doctor'], default: 'patient' },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('User', UserSchema);