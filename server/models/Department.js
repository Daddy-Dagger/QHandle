import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    tokenSequence: {
      type: Number,
      default: 0,
    },
    lastResetDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model('Department', departmentSchema);

export default Department;
