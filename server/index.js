import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { seedDatabase } from './config/seed.js';
import Department from './models/Department.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Database connection & initialization middleware (Must be before routes)
app.use(async (req, res, next) => {
  const isApiRoute = req.path.startsWith('/api') || req.url.startsWith('/api');
  if (isApiRoute) {
    try {
      await connectDB();
      // Seed database only if no departments exist yet
      const deptCount = await Department.countDocuments();
      if (deptCount === 0) {
        await seedDatabase();
      }
    } catch (e) {
      console.error('Database connection middleware failed:', e.message);
      return res.status(500).json({
        success: false,
        message: `Database Connection Error: ${e.message}. Please verify your MONGO_URI in Vercel Environment Variables.`,
      });
    }
  }
  next();
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'QHandle',
    env: process.env.NODE_ENV || 'development',
    isVercel: process.env.VERCEL === '1',
  });
});

app.use('/api', apiRoutes);

// Serve static assets in production (when running Express directly)
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    }
  });
}

// Connect to MongoDB and start server only when running directly (not in Vercel serverless mode)
if (process.env.VERCEL !== '1') {
  const startServer = async () => {
    try {
      await connectDB();
      const deptCount = await Department.countDocuments();
      if (deptCount === 0) {
        await seedDatabase();
      }

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
}

export default app;

