# Admin Pro - 全栈后台管理系统

一套基于 Node.js 的全栈后台管理系统，提供 **Vue 3** 和 **Next.js** 两套前端实现，后端使用 **Express + Prisma + PostgreSQL**。

## 项目结构

```
admin-pro/
├── docker/                      # Docker 配置
│   ├── docker-compose.yml       # PostgreSQL + pgAdmin
│   ├── init.sql                 # 初始化 SQL（表结构 + 种子数据）
│   └── .env                     # 环境变量
├── server/                      # 后端 API 服务
│   ├── prisma/
│   │   └── schema.prisma        # 数据库模型
│   ├── src/
│   │   ├── routes/              # API 路由
│   │   ├── middleware/          # 中间件
│   │   ├── services/            # 业务服务
│   │   ├── utils/               # 工具函数
│   │   └── app.ts               # 入口文件
│   └── package.json
├── vue-admin/                   # Vue 3 前端
│   ├── src/
│   │   ├── api/                 # API 请求
│   │   ├── assets/              # 静态资源
│   │   ├── components/          # 公共组件
│   │   ├── layouts/             # 布局组件
│   │   ├── locales/             # 国际化
│   │   ├── router/              # 路由配置
│   │   ├── stores/              # 状态管理
│   │   ├── styles/              # 样式
│   │   ├── utils/               # 工具函数
│   │   └── views/               # 页面组件
│   └── package.json
├── next-admin/                  # Next.js 前端
│   ├── src/
│   │   ├── app/                 # 页面
│   │   ├── components/          # 组件
│   │   ├── lib/                 # 工具库
│   │   └── stores/              # 状态管理
│   └── package.json
├── .editorconfig                # 编辑器配置
├── .gitignore                   # Git 忽略
├── commitlint.config.js         # 提交规范
├── package.json                 # 根配置
└── README.md                    # 项目说明
```

## 技术栈

| 层级 | 技术 |
|------|------|
| **数据库** | PostgreSQL 16 (Docker) |
| **后端** | Express + Prisma + JWT + node-cron |
| **Vue 前端** | Vue 3 + Element Plus + Pinia + Vue Router + vue-i18n |
| **Next 前端** | Next.js 14 + Tailwind CSS + shadcn/ui + Zustand + next-intl |
| **代码规范** | ESLint + Prettier + Commitlint + Husky |

## 功能特性

### 系统管理
- 用户管理：用户 CRUD、分配角色、重置密码、头像上传
- 角色管理：角色 CRUD、菜单权限分配、数据权限
- 菜单管理：树形结构、拖拽排序、目录/菜单/按钮三种类型
- 部门管理：树形结构、数据权限
- 岗位管理：岗位 CRUD
- 字典管理：字典类型/数据管理
- 参数管理：系统动态配置参数
- 通知公告：发布/维护通知

### 系统监控
- 在线用户：当前活跃用户监控、强退用户
- 服务监控：CPU/内存/磁盘/Node 信息
- 操作日志：记录用户操作
- 登录日志：记录登录信息

### 系统工具
- 定时任务：在线管理定时任务、任务日志
- 代码生成：导入表结构、预览/下载代码

### 其他功能
- 单点登录（OAuth 2.0 预留）
- 头像上传（裁剪 + 预览）
- 主题切换（10+ 预设主题色）
- 暗黑模式（一键切换）
- 国际化（中英文）
- 标签页导航
- 面包屑导航
- 全局搜索

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8
- Docker（可选，用于 PostgreSQL）

### 1. 启动数据库

```bash
# 使用 Docker 一键启动
cd docker
docker compose up -d

# 或使用已有的 PostgreSQL，修改 docker/.env 配置
```

### 2. 启动后端

```bash
cd server

# 安装依赖
pnpm install

# 生成 Prisma Client
pnpm prisma:generate

# 执行数据库迁移（首次）
pnpm prisma:migrate

# 或直接推送表结构
pnpm prisma:push

# 启动开发服务器
pnpm dev
```

后端将运行在 http://localhost:3001

### 3. 启动 Vue 前端

```bash
cd vue-admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

Vue 前端将运行在 http://localhost:5173

### 4. 启动 Next.js 前端

```bash
cd next-admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

Next.js 前端将运行在 http://localhost:3000

### 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 超级管理员 |
| test | test123 | 普通角色 |

## 打包部署

### 后端打包

```bash
cd server
pnpm build
pnpm start
```

### Vue 前端打包

```bash
cd vue-admin
pnpm build
# 产物在 dist/ 目录
```

### Next.js 前端打包

```bash
cd next-admin
pnpm build
pnpm start
```

## 环境变量

### 后端 (.env)

```env
# 数据库
DATABASE_URL="postgresql://admin:admin123@localhost:5432/admin_db"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="2h"
JWT_REFRESH_EXPIRES_IN="7d"

# 服务器
PORT=3001
NODE_ENV=development
```

### Docker (.env)

```env
DB_PORT=5432
DB_NAME=admin_db
DB_USER=admin
DB_PASSWORD=admin123
PGADMIN_PORT=5050
```

## 代码规范

### 提交规范

```bash
# 使用 commitizen 交互式提交
pnpm commit

# 或手动提交
git commit -m "feat(server): 添加用户管理 API"
```

提交类型：
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建/工具

### 代码检查

```bash
# ESLint 检查
pnpm lint

# 自动修复
pnpm lint:fix

# Prettier 格式化
pnpm format
```

## API 文档

启动后端后，访问以下地址查看 API：

- 健康检查：GET http://localhost:3001/api/health
- 登录：POST http://localhost:3001/api/auth/login
- 用户列表：GET http://localhost:3001/api/user/list

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 许可证

MIT License
