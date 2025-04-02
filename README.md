# Foodly Backend

Foodly 是一个在线食品订购平台的后端服务。

## 功能特点

- 用户认证和授权
- 餐厅管理
- 订单处理
- 实时通知（WebSocket）
- 支付集成

## 技术栈

- Node.js
- Express.js
- MongoDB
- WebSocket
- JWT 认证

## 环境要求

- Node.js >= 18.0.0
- MongoDB

## 安装

1. 克隆仓库

```bash
git clone https://github.com/你的用户名/backend_foodly.git
cd backend_foodly
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量
   创建`.env`文件并添加以下变量：

```
PORT=6013
MONGODB_URI=你的MongoDB连接字符串
JWT_SECRET=你的JWT密钥
```

4. 启动开发服务器

```bash
npm run dev
```

## 部署

项目已配置为可在 Vercel 上部署。部署步骤：

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## API 文档

主要 API 端点：

- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- GET /api/restaurants - 获取餐厅列表
- POST /api/orders/new-order - 创建新订单
- WebSocket ws://your-domain?restaurantId=xxx - 实时通知

## 许可证

ISC
