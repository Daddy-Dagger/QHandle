import mongoose from 'mongoose';

const queueTokenSchema = new mongoose.Schema({
  tokenNumber: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  counter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counter',
    required: true,
  },
  status: {
    type: String,
    enum: ['Waiting', 'Serving', 'Completed', 'Cancelled'],
    default: 'Waiting',
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  studentName: {
    type: String,
    trim: true,
    default: 'Guest Student',
  },
  studentId: {
    type: String,
    trim: true,
    default: 'N/A',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

queueTokenSchema.index({ department: 1, tokenNumber: 1, date: 1 }, { unique: true });

const QueueToken = mongoose.model('QueueToken', queueTokenSchema);

export default QueueToken;
