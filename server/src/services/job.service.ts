// 定时任务服务
import cron from 'node-cron';
import prisma from '../utils/prisma.js';

// 存储运行中的任务
const runningTasks = new Map<string, cron.ScheduledTask>();

// 任务处理函数映射
const taskHandlers: Record<string, (params?: any) => Promise<void>> = {
  'system:operlog:clean': cleanOperLogs,
  'system:loginlog:clean': cleanLoginLogs,
  'system:notice:send': sendNotice,
};

// 清理操作日志（保留30天）
async function cleanOperLogs(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.sysOperLog.deleteMany({
      where: {
        operTime: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`[定时任务] 清理操作日志完成，删除 ${result.count} 条记录`);
  } catch (error) {
    console.error('[定时任务] 清理操作日志失败:', error);
    throw error;
  }
}

// 清理登录日志（保留30天）
async function cleanLoginLogs(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.sysLoginLog.deleteMany({
      where: {
        loginTime: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`[定时任务] 清理登录日志完成，删除 ${result.count} 条记录`);
  } catch (error) {
    console.error('[定时任务] 清理登录日志失败:', error);
    throw error;
  }
}

// 发送通知（示例）
async function sendNotice(): Promise<void> {
  console.log('[定时任务] 发送通知任务执行');
}

// 启动单个任务
export async function startJob(jobId: number): Promise<void> {
  const job = await prisma.sysJob.findUnique({
    where: { id: jobId },
  });

  if (!job || job.status !== 0) {
    return;
  }

  // 如果任务已运行，先停止
  stopJob(jobId);

  const taskKey = `job_${jobId}`;

  try {
    const task = cron.schedule(job.cronExpression, async () => {
      const startTime = new Date();
      let status = 0;
      let jobMessage = '';
      let exceptionInfo = '';

      try {
        const handler = taskHandlers[job.invokeTarget];
        if (handler) {
          await handler();
          jobMessage = `执行成功`;
        } else {
          jobMessage = `未找到处理函数: ${job.invokeTarget}`;
          status = 1;
        }
      } catch (error: any) {
        status = 1;
        jobMessage = '执行失败';
        exceptionInfo = error.message || String(error);
      }

      // 记录任务日志
      try {
        await prisma.sysJobLog.create({
          data: {
            jobId: job.id,
            jobName: job.name,
            invokeTarget: job.invokeTarget,
            jobMessage,
            status,
            exceptionInfo: exceptionInfo || undefined,
            startTime,
            stopTime: new Date(),
          },
        });
      } catch (logError) {
        console.error('[定时任务] 记录日志失败:', logError);
      }
    });

    runningTasks.set(taskKey, task);
    console.log(`[定时任务] 启动任务: ${job.name} (${job.cronExpression})`);
  } catch (error) {
    console.error(`[定时任务] 启动任务失败: ${job.name}`, error);
  }
}

// 停止单个任务
export function stopJob(jobId: number): void {
  const taskKey = `job_${jobId}`;
  const task = runningTasks.get(taskKey);

  if (task) {
    task.stop();
    runningTasks.delete(taskKey);
    console.log(`[定时任务] 停止任务: ${taskKey}`);
  }
}

// 立即执行任务
export async function runJobNow(jobId: number): Promise<{ success: boolean; message: string }> {
  const job = await prisma.sysJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    return { success: false, message: '任务不存在' };
  }

  const startTime = new Date();
  let status = 0;
  let jobMessage = '';
  let exceptionInfo = '';

  try {
    const handler = taskHandlers[job.invokeTarget];
    if (handler) {
      await handler();
      jobMessage = '执行成功';
    } else {
      jobMessage = `未找到处理函数: ${job.invokeTarget}`;
      status = 1;
    }
  } catch (error: any) {
    status = 1;
    jobMessage = '执行失败';
    exceptionInfo = error.message || String(error);
  }

  // 记录任务日志
  await prisma.sysJobLog.create({
    data: {
      jobId: job.id,
      jobName: job.name,
      invokeTarget: job.invokeTarget,
      jobMessage,
      status,
      exceptionInfo: exceptionInfo || undefined,
      startTime,
      stopTime: new Date(),
    },
  });

  return {
    success: status === 0,
    message: jobMessage,
  };
}

// 初始化所有任务
export async function initJobs(): Promise<void> {
  try {
    const jobs = await prisma.sysJob.findMany({
      where: { status: 0 },
    });

    for (const job of jobs) {
      await startJob(job.id);
    }

    console.log(`[定时任务] 初始化完成，共 ${jobs.length} 个任务`);
  } catch (error) {
    console.error('[定时任务] 初始化失败:', error);
  }
}

// 获取任务处理函数列表
export function getTaskHandlers(): string[] {
  return Object.keys(taskHandlers);
}

export default {
  startJob,
  stopJob,
  runJobNow,
  initJobs,
  getTaskHandlers,
};
