const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");
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
  console.log("\n=== 收到新请求 ===");
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("请求头:", req.headers);
  if (req.method === "POST") {
    console.log("请求体:", JSON.stringify(req.body, null, 2));
  }
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

// 解析 JSON
app.use(
  express.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        console.error("JSON解析错误:", e);
        res.status(400).json({ error: "Invalid JSON" });
        throw new Error("Invalid JSON");
      }
    },
  })
);

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
  .connect(process.env.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    retryReads: true,
    maxPoolSize: 10,
    minPoolSize: 5,
    heartbeatFrequencyMS: 10000,
  })
  .then(() => {
    console.log("Foodly Database Connected Successfully");
  })
  .catch((err) => {
    console.error("MongoDB连接错误:", err);
    if (process.env.NODE_ENV === "development") {
      console.error("详细错误:", err.stack);
    }
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
  console.log("\n=== 收到支付成功通知 ===");
  console.log("时间:", new Date().toISOString());
  console.log("请求头:", req.headers);
  console.log("请求体:", JSON.stringify(req.body, null, 2));

  try {
    const { orderId, orderDetails, paymentStatus } = req.body;

    if (!orderId) {
      console.log("错误: 缺少订单ID");
      return res.status(400).json({ error: "Missing orderId" });
    }

    // 验证订单是否存在
    console.log("正在查找订单:", orderId);
    const existingOrder = await Order.findById(new ObjectId(orderId));
    if (!existingOrder) {
      console.log("错误: 未找到订单");
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("existingOrder", existingOrder);

    const restaurantId = existingOrder.restaurantId;
    console.log("餐厅ID:", restaurantId);

    // 2. 获取对应商家的WebSocket连接
    const restaurantWs = wss.restaurantClients.get(restaurantId);

    if (restaurantWs && restaurantWs.readyState === WebSocket.OPEN) {
      // 3. 向商家发送通知
      const wsMessage = {
        type: "order_paid",
        orderId: orderId,
        orderDetails: orderDetails,
        timestamp: new Date().toISOString(),
      };
      restaurantWs.send(JSON.stringify(wsMessage));
      console.log("已发送WebSocket通知到餐厅");
    } else {
      console.log("餐厅不在线，无法发送WebSocket通知");
    }

    console.log("订单更新成功");
    console.log("=== 处理完成 ===\n");

    res.status(200).json({
      message: "Order updated successfully",
      order: existingOrder,
    });
  } catch (error) {
    console.error("处理支付成功通知时出错:", error);
    console.error("错误堆栈:", error.stack);
    console.log("=== 处理失败 ===\n");
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

// 启动服务器
const PORT = process.env.PORT || 6013;
server.listen(PORT, () => {
  console.log(`Foodly Backend is running on port ${PORT}!`);
  console.log(`API文档: http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});
