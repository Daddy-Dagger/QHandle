import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { seedDatabase } from './config/seed.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'QHandle' });
});

app.use('/api', apiRoutes);

// Connect to MongoDB and start server only after connection succeeds
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    const listen = (port) => {
      const server = app.listen(port, () => {
        console.log(`QHandle backend server listening on port ${port}`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying fallback port ${port + 1}...`);
          listen(port + 1);
        } else {
          console.error('Server error:', err);
        }
      });
    };

    listen(PORT);
  } catch (error) {
    console.error('Database connection failed. Server not started.', error);
    process.exit(1);
  }
};

startServer();
