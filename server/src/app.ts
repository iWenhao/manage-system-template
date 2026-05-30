// Admin Pro 后端入口
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { initJobs } from './services/job.service.js';

// 路由导入
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import roleRoutes from './routes/role.js';
import menuRoutes from './routes/menu.js';
import deptRoutes from './routes/dept.js';
import postRoutes from './routes/post.js';
import dictRoutes from './routes/dict.js';
import configRoutes from './routes/config.js';
import noticeRoutes from './routes/notice.js';
import logRoutes from './routes/log.js';
import monitorRoutes from './routes/monitor.js';
import jobRoutes from './routes/job.js';
import genRoutes from './routes/gen.js';
import uploadRoutes from './routes/upload.js';
import oauthRoutes from './routes/oauth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务（上传文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/dept', deptRoutes);
app.use('/api/post', postRoutes);
app.use('/api/dict', dictRoutes);
app.use('/api/config', configRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/log', logRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/gen', genRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/oauth', oauthRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    code: 200,
    message: 'OK',
    data: {
      status: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
  });
});

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
  });
});

// 启动服务
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   Admin Pro Server                                       ║
║                                                          ║
║   Local:   http://localhost:${PORT}                        ║
║   Health:  http://localhost:${PORT}/api/health              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);

  // 初始化定时任务
  initJobs().catch(console.error);
});

export default app;
