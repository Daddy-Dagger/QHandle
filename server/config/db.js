import mongoose from 'mongoose';
import QueueToken from '../models/QueueToken.js';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState >= 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is missing! Please set MONGO_URI in your Vercel Environment Variables.');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then(async (mongooseInstance) => {
        console.log(`MongoDB Connected: ${mongooseInstance.connection.host}`);
        try {
          await QueueToken.syncIndexes();
        } catch (err) {
          console.warn('Index sync warning:', err.message);
        }
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`Error connecting to MongoDB: ${e.message}`);
    throw e;
  }

  return cached.conn;
};

export default connectDB;

