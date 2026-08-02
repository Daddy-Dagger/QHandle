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
    enum: ['Waiting', 'Serving', 'Completed'],
    default: 'Waiting',
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

const QueueToken = mongoose.model('QueueToken', queueTokenSchema);

export default QueueToken;
