# Admin Pro - Angular 前端

基于 Angular 17 + TinyNG（华为）的后台管理系统前端。

## 技术栈

- **Angular 17** - 前端框架
- **TinyNG** - 华为组件库
- **RxJS** - 响应式编程
- **Angular Router** - 路由管理

## 项目结构

```
angular-admin/
├── src/
│   ├── app/
│   │   ├── api/               # API 服务
│   │   ├── config/            # 应用配置
│   │   ├── guards/            # 路由守卫
│   │   ├── layouts/           # 布局组件
│   │   ├── pages/             # 页面组件
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   └── system/
│   │   └── services/          # 服务
│   ├── assets/                # 静态资源
│   └── environments/          # 环境配置
├── angular.json
├── package.json
└── tsconfig.json
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm start
```

访问 http://localhost:5175

## 常用命令

```bash
pnpm start      # 启动开发服务器
pnpm build      # 生产打包
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90
