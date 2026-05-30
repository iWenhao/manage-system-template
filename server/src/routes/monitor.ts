// 系统监控路由
import { Router, Request, Response } from 'express';
import os from 'os';
import prisma from '../utils/prisma.js';
import { success, fail, notFound } from '../utils/response.js';
import { auth } from '../middleware/auth.js';
import { checkPermission } from '../middleware/permission.js';

const router = Router();

// 获取在线用户
router.get(
  '/online',
  auth,
  checkPermission('monitor:online:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        pageNum = '1',
        pageSize = '10',
        ipaddr,
        username,
      } = req.query;

      const page = parseInt(pageNum as string);
      const size = parseInt(pageSize as string);

      // 获取最近登录的用户（模拟在线用户）
      const where: any = {};
      if (ipaddr) where.loginIp = { contains: ipaddr as string };
      if (username) where.username = { contains: username as string };

      const [users, total] = await Promise.all([
        prisma.sysUser.findMany({
          where: {
            ...where,
            loginDate: { not: null },
          },
          skip: (page - 1) * size,
          take: size,
          orderBy: { loginDate: 'desc' },
          select: {
            id: true,
            username: true,
            nickname: true,
            loginIp: true,
            loginDate: true,
          },
        }),
        prisma.sysUser.count({
          where: {
            ...where,
            loginDate: { not: null },
          },
        }),
      ]);

      const onlineUsers = users.map((user) => ({
        tokenId: `token_${user.id}`,
        userId: user.id,
        username: user.username,
        nickname: user.nickname,
        ipaddr: user.loginIp,
        loginTime: user.loginDate,
      }));

      success(res, {
        list: onlineUsers,
        total,
        pageNum: page,
        pageSize: size,
      });
    } catch (error) {
      console.error('获取在线用户失败:', error);
      fail(res, '获取在线用户失败');
    }
  }
);

// 强退用户
router.delete(
  '/online/:token',
  auth,
  checkPermission('monitor:online:forceLogout'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.params.token;

      // 从token中提取用户ID
      const match = token.match(/^token_(\d+)$/);
      if (!match) {
        fail(res, '无效的Token');
        return;
      }

      const userId = parseInt(match[1]);

      const user = await prisma.sysUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        notFound(res, '用户不存在');
        return;
      }

      // 清除用户的登录信息
      await prisma.sysUser.update({
        where: { id: userId },
        data: {
          loginIp: null,
          loginDate: null,
        },
      });

      success(res, null, '强退成功');
    } catch (error) {
      console.error('强退用户失败:', error);
      fail(res, '强退用户失败');
    }
  }
);

// 获取服务器信息
router.get(
  '/server',
  auth,
  checkPermission('monitor:server:list'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // CPU信息
      const cpus = os.cpus();
      const cpuInfo = {
        cpuNum: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        speed: cpus[0]?.speed || 0,
        usage: 0,
      };

      // 计算CPU使用率
      let totalIdle = 0;
      let totalTick = 0;
      cpus.forEach((cpu) => {
        for (const type in cpu.times) {
          totalTick += (cpu.times as any)[type];
        }
        totalIdle += cpu.times.idle;
      });
      cpuInfo.usage = parseFloat(((1 - totalIdle / totalTick) * 100).toFixed(2));

      // 内存信息
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memInfo = {
        total: formatBytes(totalMem),
        used: formatBytes(usedMem),
        free: formatBytes(freeMem),
        usage: parseFloat(((usedMem / totalMem) * 100).toFixed(2)),
      };

      // 系统信息
      const sysInfo = {
        osName: os.type(),
        osArch: os.arch(),
        computerName: os.hostname(),
        computerIp: getLocalIP(),
        userDir: process.cwd(),
      };

      // Node信息
      const nodeInfo = {
        name: 'Node.js',
        version: process.version,
        home: process.execPath,
        memory: formatBytes(process.memoryUsage().heapUsed),
        uptime: formatUptime(process.uptime()),
      };

      success(res, {
        cpu: cpuInfo,
        mem: memInfo,
        sys: sysInfo,
        node: nodeInfo,
      });
    } catch (error) {
      console.error('获取服务器信息失败:', error);
      fail(res, '获取服务器信息失败');
    }
  }
);

// 格式化字节
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 格式化运行时间
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}小时`);
  if (minutes > 0) parts.push(`${minutes}分钟`);
  parts.push(`${secs}秒`);

  return parts.join('');
}

// 获取本地IP
function getLocalIP(): string {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }
  return '127.0.0.1';
}

export default router;
