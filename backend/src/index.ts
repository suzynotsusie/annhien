import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration — cho phép frontend kết nối và đính kèm credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// =========================================
// Health Check Endpoint
// =========================================
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'An Nhiên API Server đang hoạt động 🌿',
    timestamp: new Date().toISOString(),
  });
});

// =========================================
// Start Server
// =========================================
app.listen(PORT, () => {
  console.log(`🚀 An Nhiên Backend đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
