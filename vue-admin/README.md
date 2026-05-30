# Admin Pro - Vue 前端

基于 Vue 3 + Element Plus 的后台管理系统前端。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - UI 组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Vue I18n** - 国际化
- **Axios** - HTTP 请求
- **Vite** - 构建工具
- **TypeScript** - 类型安全

## 项目结构

```
vue-admin/
├── public/
│   └── vite.svg
├── src/
│   ├── api/                   # API 请求封装
│   │   ├── auth.ts            # 认证 API
│   │   └── system.ts          # 系统管理 API
│   ├── assets/                # 静态资源
│   │   └── logo.svg
│   ├── components/            # 公共组件
│   ├── layouts/               # 布局组件
│   │   ├── index.vue          # 主布局
│   │   └── components/
│   │       ├── SidebarItem.vue # 侧边栏菜单项
│   │       ├── Breadcrumb.vue  # 面包屑
│   │       └── TagsView.vue    # 标签页
│   ├── locales/               # 国际化
│   │   ├── index.ts
│   │   ├── zh-CN.json
│   │   └── en-US.json
│   ├── router/                # 路由配置
│   │   └── index.ts
│   ├── stores/                # 状态管理
│   │   ├── user.ts            # 用户状态
│   │   ├── permission.ts      # 权限状态
│   │   ├── app.ts             # 应用状态
│   │   └── tags.ts            # 标签页状态
│   ├── styles/                # 样式
│   │   └── index.scss
│   ├── utils/                 # 工具函数
│   │   ├── request.ts         # Axios 封装
│   │   └── auth.ts            # Token 管理
│   ├── views/                 # 页面组件
│   │   ├── login/             # 登录页
│   │   ├── dashboard/         # 仪表盘
│   │   ├── system/            # 系统管理
│   │   │   ├── user/          # 用户管理
│   │   │   ├── role/          # 角色管理
│   │   │   ├── menu/          # 菜单管理
│   │   │   ├── dept/          # 部门管理
│   │   │   ├── post/          # 岗位管理
│   │   │   ├── dict/          # 字典管理
│   │   │   ├── config/        # 参数管理
│   │   │   └── notice/        # 通知公告
│   │   ├── monitor/           # 系统监控
│   │   ├── tool/              # 系统工具
│   │   └── error/             # 错误页
│   ├── App.vue
│   ├── main.ts
│   └── env.d.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .eslintrc.json
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5173

## 常用命令

```bash
pnpm dev        # 启动开发服务器
pnpm build      # 生产打包
pnpm preview    # 预览生产构建
pnpm lint       # ESLint 检查
pnpm lint:fix   # ESLint 自动修复
pnpm format     # Prettier 格式化
```

## 功能特性

### 布局
- 侧边栏菜单（支持折叠）
- 顶部导航栏
- 面包屑导航
- 标签页导航（KeepAlive）
- 全屏切换

### 主题
- 10+ 预设主题色
- 暗黑模式
- 布局模式切换

### 国际化
- 中文
- 英文

### 权限
- 动态路由
- 按钮权限指令
- 角色权限控制

### 页面
- 登录页
- 仪表盘
- 用户管理
- 角色管理
- 菜单管理（树形表格）
- 部门管理（树形结构）
- 岗位管理
- 字典管理
- 参数管理
- 通知公告
- 404 页面

## 环境变量

在 `vite.config.ts` 中配置代理：

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

## 组件使用

### Element Plus 组件

项目已配置自动导入，直接使用即可：

```vue
<template>
  <el-button type="primary">按钮</el-button>
  <el-table :data="tableData">
    <el-table-column prop="name" label="名称" />
  </el-table>
</template>
```

### 图标使用

```vue
<template>
  <el-icon><Search /></el-icon>
</template>
```

## 状态管理

### 用户状态

```ts
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
await userStore.login({ username: 'admin', password: 'admin123' });
console.log(userStore.userInfo);
console.log(userStore.roles);
console.log(userStore.permissions);
```

### 权限检查

```ts
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

// 检查角色
if (userStore.hasRole('admin')) {
  // 有管理员角色
}

// 检查权限
if (userStore.hasPermission('system:user:add')) {
  // 有新增用户权限
}
```
