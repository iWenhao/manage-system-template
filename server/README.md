# Admin Pro Server

后端 API 服务，基于 Express + Prisma + PostgreSQL。

## 技术栈

- **Express** - Web 框架
- **Prisma** - ORM
- **PostgreSQL** - 数据库
- **JWT** - 认证
- **node-cron** - 定时任务
- **Zod** - 参数校验
- **TypeScript** - 类型安全

## 项目结构

```
server/
├── prisma/
│   ├── schema.prisma        # 数据库模型
│   └── seed.ts              # 种子数据
├── src/
│   ├── routes/              # API 路由
│   │   ├── auth.ts          # 认证（登录/登出/刷新Token）
│   │   ├── user.ts          # 用户管理
│   │   ├── role.ts          # 角色管理
│   │   ├── menu.ts          # 菜单管理
│   │   ├── dept.ts          # 部门管理
│   │   ├── post.ts          # 岗位管理
│   │   ├── dict.ts          # 字典管理
│   │   ├── config.ts        # 参数管理
│   │   ├── notice.ts        # 通知公告
│   │   ├── log.ts           # 日志管理
│   │   ├── monitor.ts       # 系统监控
│   │   ├── job.ts           # 定时任务
│   │   ├── gen.ts           # 代码生成
│   │   ├── upload.ts        # 文件上传
│   │   └── oauth.ts         # OAuth/SSO
│   ├── middleware/          # 中间件
│   │   ├── auth.ts          # JWT 认证
│   │   ├── permission.ts    # 权限校验
│   │   └── logger.ts        # 操作日志
│   ├── services/            # 业务服务
│   │   ├── job.service.ts   # 定时任务服务
│   │   └── gen.service.ts   # 代码生成服务
│   ├── utils/               # 工具函数
│   │   ├── prisma.ts        # Prisma 客户端
│   │   ├── jwt.ts           # JWT 工具
│   │   ├── password.ts      # 密码加密
│   │   └── response.ts      # 响应工具
│   ├── uploads/             # 上传文件
│   └── app.ts               # 入口文件
├── .env                     # 环境变量
├── .eslintrc.json           # ESLint 配置
├── .prettierrc              # Prettier 配置
├── package.json
└── tsconfig.json
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 生成 Prisma Client
pnpm prisma:generate

# 推送数据库结构
pnpm prisma:push

# 启动开发服务器
pnpm dev
```

## 常用命令

```bash
pnpm dev              # 启动开发服务器（热更新）
pnpm build            # 编译 TypeScript
pnpm start            # 启动生产服务器
pnpm prisma:generate  # 生成 Prisma Client
pnpm prisma:migrate   # 执行数据库迁移
pnpm prisma:push      # 推送数据库结构
pnpm prisma:studio    # 打开 Prisma Studio
pnpm seed             # 执行种子数据
pnpm lint             # ESLint 检查
pnpm lint:fix         # ESLint 自动修复
pnpm format           # Prettier 格式化
```

## API 列表

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/logout | 登出 |
| POST | /api/auth/refresh | 刷新 Token |
| GET | /api/auth/info | 获取用户信息 |

### 用户管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/user/list | 用户列表 |
| GET | /api/user/:id | 用户详情 |
| POST | /api/user | 创建用户 |
| PUT | /api/user/:id | 更新用户 |
| DELETE | /api/user/:id | 删除用户 |
| PUT | /api/user/:id/reset-pwd | 重置密码 |

### 角色管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/role/list | 角色列表 |
| GET | /api/role/all | 所有角色 |
| GET | /api/role/:id | 角色详情 |
| POST | /api/role | 创建角色 |
| PUT | /api/role/:id | 更新角色 |
| DELETE | /api/role/:id | 删除角色 |

### 菜单管理
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/menu/list | 菜单列表（树形） |
| GET | /api/menu/tree | 菜单树 |
| GET | /api/menu/:id | 菜单详情 |
| POST | /api/menu | 创建菜单 |
| PUT | /api/menu/:id | 更新菜单 |
| DELETE | /api/menu/:id | 删除菜单 |
| PUT | /api/menu/sort | 批量排序 |
| GET | /api/menu/user/menus | 用户菜单 |

### 其他模块
- 部门管理：/api/dept/*
- 岗位管理：/api/post/*
- 字典管理：/api/dict/*
- 参数管理：/api/config/*
- 通知公告：/api/notice/*
- 日志管理：/api/log/*
- 系统监控：/api/monitor/*
- 定时任务：/api/job/*
- 代码生成：/api/gen/*
- 文件上传：/api/upload/*
- OAuth：/api/oauth/*

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DATABASE_URL | 数据库连接 | postgresql://admin:admin123@localhost:5432/admin_db |
| JWT_SECRET | JWT 密钥 | admin-pro-jwt-secret-key-2024 |
| JWT_EXPIRES_IN | Token 过期时间 | 2h |
| JWT_REFRESH_EXPIRES_IN | 刷新 Token 过期时间 | 7d |
| PORT | 服务端口 | 3001 |
| NODE_ENV | 运行环境 | development |
