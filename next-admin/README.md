# Admin Pro - Next.js 前端

基于 Next.js 14 + Tailwind CSS + shadcn/ui 的后台管理系统前端。

## 技术栈

- **Next.js 14** - React 框架（App Router）
- **Tailwind CSS** - 原子化 CSS
- **shadcn/ui** - UI 组件库
- **Zustand** - 状态管理
- **next-themes** - 主题切换
- **Axios** - HTTP 请求
- **TypeScript** - 类型安全

## 项目结构

```
next-admin/
├── public/
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # 后台页面组
│   │   │   ├── layout.tsx     # 后台布局
│   │   │   ├── dashboard/     # 仪表盘
│   │   │   └── system/        # 系统管理
│   │   │       └── user/      # 用户管理
│   │   ├── login/
│   │   │   └── page.tsx       # 登录页
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 首页（重定向）
│   ├── components/
│   │   └── ui/                # shadcn/ui 组件
│   ├── lib/
│   │   ├── api.ts             # API 封装
│   │   └── utils.ts           # 工具函数
│   ├── stores/
│   │   └── auth.ts            # 认证状态
│   └── types/
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.js
├── package.json
└── tsconfig.json
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:3000

## 常用命令

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 生产打包
pnpm start    # 启动生产服务器
pnpm lint     # ESLint 检查
```

## 功能特性

### 布局
- 响应式侧边栏
- 顶部导航栏
- 深色/浅色主题切换

### 主题
- 系统主题跟随
- 手动切换深色/浅色
- 自定义主题色

### 页面
- 登录页
- 仪表盘
- 用户管理
- 更多页面开发中...

## API 代理

在 `next.config.mjs` 中配置：

```js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'http://localhost:3001/api/:path*',
    },
  ];
},
```

## 状态管理

使用 Zustand：

```ts
import { useAuthStore } from '@/stores/auth';

const { userInfo, setUserInfo, hasRole, hasPermission, logout } = useAuthStore();
```

## 添加 shadcn/ui 组件

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
```

## Tailwind CSS 主题

在 `globals.css` 中定义 CSS 变量：

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

## 部署

### Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```
