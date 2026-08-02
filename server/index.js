import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { seedDatabase } from './config/seed.js';
import apiRoutes from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    }
  });
}

// Middleware to ensure DB connection on requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
      await seedDatabase();
    } catch (e) {
      // Continue if already connected
    }
  }
  next();
});

// Connect to MongoDB and start server only when running directly (not in Vercel serverless mode)
if (process.env.VERCEL !== '1') {
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
}

export default app;
