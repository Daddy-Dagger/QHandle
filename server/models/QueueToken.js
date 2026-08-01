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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const QueueToken = mongoose.model('QueueToken', queueTokenSchema);

export default QueueToken;
