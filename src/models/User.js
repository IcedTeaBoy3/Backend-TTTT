const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    name: { type: String, maxLength: 255 },
    email: { type: String, maxLength: 255, required: true,unique: true },
    password: { type: String, maxLength: 255},
    has_password: { type: Boolean, default: true },
    phone: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male','female'] },
    avatar: { type: String },
    address: { type: String },
    ethnic: { type: String },
    idCard: { type: String },
    insuranceCode: { type: String },
    job: { type: String },
    role: { type: String, enum: ['admin', 'patient', 'doctor'], default: 'patient' },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken : { type: String },
    resetPasswordExpire : { type: Date },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model('User', UserSchema);