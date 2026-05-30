# Admin Pro - Vue 2 前端

基于 Vue 2 + Element UI 的后台管理系统前端，适用于简单项目或需要兼容旧浏览器的场景。

## 技术栈

- **Vue 2** - 渐进式 JavaScript 框架
- **Element UI** - UI 组件库
- **Vue Router 3** - 路由管理
- **Vuex 3** - 状态管理
- **Axios** - HTTP 请求
- **Vue CLI** - 构建工具

## 项目结构

```
vue2-admin/
├── public/
│   ├── index.html
│   └── logo.svg
├── src/
│   ├── api/                   # API 请求封装
│   │   ├── auth.js            # 认证 API
│   │   └── system.js          # 系统管理 API
│   ├── assets/                # 静态资源
│   ├── components/            # 公共组件
│   ├── config/                # 配置文件
│   │   └── app.js             # 应用配置（标题、Logo）
│   ├── layouts/               # 布局组件
│   │   ├── index.vue          # 主布局
│   │   └── components/
│   │       ├── SidebarItem.vue
│   │       └── Breadcrumb.vue
│   ├── router/                # 路由配置
│   │   └── index.js
│   ├── store/                 # 状态管理
│   │   └── index.js
│   ├── styles/                # 样式
│   │   └── index.scss
│   ├── utils/                 # 工具函数
│   │   ├── auth.js            # Token 管理
│   │   └── request.js         # Axios 封装
│   ├── views/                 # 页面组件
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── error/
│   │   └── system/
│   │       ├── user/
│   │       ├── role/
│   │       ├── menu/
│   │       ├── dept/
│   │       ├── post/
│   │       ├── dict/
│   │       ├── config/
│   │       └── notice/
│   ├── App.vue
│   └── main.js
├── babel.config.js
├── vue.config.js
└── package.json
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:5174

## 常用命令

```bash
pnpm dev        # 启动开发服务器
pnpm build      # 生产打包
pnpm lint       # ESLint 检查
```

## 功能特性

- 登录认证
- 动态菜单
- 权限控制
- 用户管理
- 角色管理
- 菜单管理
- 部门管理
- 岗位管理
- 字典管理
- 参数管理
- 通知公告
- 折叠/展开侧边栏

## 配置说明

修改 `src/config/app.js` 可自定义系统标题、Logo 等：

```js
export const appConfig = {
  title: 'Admin Pro',
  shortTitle: 'AP',
  logo: '/logo.svg',
}
```

## 浏览器支持

- Chrome >= 49
- Firefox >= 52
- Safari >= 10
- Edge >= 12
- IE >= 11
