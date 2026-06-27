import 'dotenv/config';
import 'express-async-errors';
import cors from 'cors';
import express from 'express';
import aiRoutes from './routes/ai.routes';
import authRoutes from './routes/auth.routes';
import conversationsRoutes from './routes/conversations.routes';
import journalsRoutes from './routes/journals.routes';
import messagesRoutes from './routes/messages.routes';
import postsRoutes from './routes/posts.routes';
import videosRoutes from './routes/videos.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { logInfo } from './utils/logger';

const app = express();
const PORT = Number(process.env.PORT || 3001);

/**
 * @returns List of frontend origins allowed to call the API in local and deployed environments.
 */
function getAllowedOrigins(): string[] {
  const configuredOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set([...configuredOrigins, 'http://localhost:3000', 'http://localhost:5173'])];
}

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS blocked for this origin'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'An Nhien API Server dang hoat dong',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/journals', journalsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/conversations', conversationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/ai', aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  logInfo(`An Nhien Backend dang chay tai port ${PORT}`);
  logInfo(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
