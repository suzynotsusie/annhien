import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import aiRoutes from './routes/ai.routes';
import authRoutes from './routes/auth.routes';
import conversationsRoutes from './routes/conversations.routes';
import journalsRoutes from './routes/journals.routes';
import messagesRoutes from './routes/messages.routes';
import postsRoutes from './routes/posts.routes';
import videosRoutes from './routes/videos.routes';
import { errorHandler, notFoundHandler } from './middleware/error';

const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

app.listen(PORT, () => {
  console.log(`An Nhien Backend dang chay tai http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;
