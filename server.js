const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Order = require("./models/Order");
const CategoryRoute = require("./routes/category");
const RestaurantRoute = require("./routes/restaurant");
const FoodsRoute = require("./routes/food");
const RatingsRoute = require("./routes/rating");
const AuthRoute = require("./routes/auth");
const UserRoute = require("./routes/user");
const AddressRoute = require("./routes/address");
const CartRoute = require("./routes/cart");
const OrderRoute = require("./routes/order");
const setupWebSocket = require("./utils/websocket");
const WebSocket = require("ws");

dotenv.config();

// 创建 HTTP 服务器
const server = require("http").createServer(app);

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// CORS 配置
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 移除 CSP 限制
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 根路由
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "欢迎访问 Foodly API",
    version: "1.0.0",
    endpoints: {
      test: "/api/test",
      auth: "/api/auth",
      users: "/api/users",
      restaurants: "/api/restaurant",
      foods: "/api/food",
      categories: "/api/category",
      ratings: "/api/rating",
      addresses: "/api/address",
      cart: "/api/cart",
      orders: "/api/orders",
    },
  });
});

// 测试路由
app.get("/api/test", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Test API is working",
    timestamp: new Date().toISOString(),
  });
});

// 设置 WebSocket
const wss = setupWebSocket(server, app);

// 数据库连接
mongoose
  .connect(
    process.env.MONGOURL ||
      "mongodb+srv://foodly:mcQsSBqbnEi4qmwr@foodly.8brkl.mongodb.net/?retryWrites=true&w=majority&appName=foodly",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  )
  .then(() => {
    console.log("Foodly Database Connected");
  })
  .catch((err) => {
    console.error("数据库连接错误:", err);
  });

// 路由配置
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/restaurant", RestaurantRoute);
app.use("/api/food", FoodsRoute);
app.use("/api/rating", RatingsRoute);
app.use("/api/address", AddressRoute);
app.use("/api/cart", CartRoute);
app.use("/api/orders", OrderRoute);

// 订单支付成功通知路由
app.post("/api/orders/payment-success", async (req, res) => {
  console.log("收到支付成功通知请求");
  console.log("请求体:", req.body);

  try {
    const { orderId, orderDetails, paymentStatus } = req.body;
    console.log(`处理订单 ${orderId} 的支付成功通知`);

    // 1. 更新订单状态
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "Completed",
    });

    // 2. 获取订单对应的商家ID
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`未找到订单: ${orderId}`);
      return res.status(404).json({ error: "Order not found" });
    }

    const restaurantId = order.restaurantId;
    console.log(`订单对应的餐厅ID: ${restaurantId}`);

    // 3. 获取对应商家的WebSocket连接
    const restaurantWs = wss.clients.get(restaurantId);

    if (restaurantWs && restaurantWs.readyState === WebSocket.OPEN) {
      // 4. 只向对应的商家发送通知
      const wsMessage = {
        type: "order_paid",
        orderId: orderId,
        orderDetails: orderDetails,
        timestamp: new Date().toISOString(),
      };
      restaurantWs.send(JSON.stringify(wsMessage));
      console.log(`已发送订单支付通知到餐厅 ${restaurantId}`);
    } else {
      console.log(`餐厅 ${restaurantId} 不在线，无法发送通知`);
    }

    res.status(200).json({
      message: "Order updated successfully",
      orderId: orderId,
      restaurantId: restaurantId,
    });
  } catch (error) {
    console.error("处理支付成功通知时出错:", error);
    res.status(500).json({ error: "Failed to process payment success" });
  }
});

// 404处理
app.use((req, res) => {
  console.log(`404 - 未找到路由: ${req.url}`);
  res.status(404).json({
    status: "error",
    message: "未找到请求的资源",
    path: req.url,
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).json({
    status: "error",
    message: "服务器内部错误",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 仅在直接运行时启动服务器
if (require.main === module) {
  const PORT = process.env.PORT || 6013;
  server.listen(PORT, () => {
    console.log(`Foodly Backend is running on port ${PORT}!`);
    console.log(`API文档: http://localhost:${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
