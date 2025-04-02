const express = require("express");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const CategoryRoute = require("./routes/category");
const RestaurantRoute = require("./routes/restaurant");
const FoodsRoute = require("./routes/food");
const RatingsRoute = require("./routes/rating");
const AuthRoute = require("./routes/auth");
const UserRoute = require("./routes/user");
const AddressRoute = require("./routes/address");
const CartRoute = require("./routes/cart");
const OrderRoute = require("./routes/order");
const TestRoute = require("./api/test");
const setupWebSocket = require("./utils/websocket");

dotenv.config();

// 创建 HTTP 服务器
const server = require("http").createServer(app);

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 中间件配置
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置 WebSocket
setupWebSocket(server, app);

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
app.use("/api/test", TestRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/restaurant", RestaurantRoute);
app.use("/api/food", FoodsRoute);
app.use("/api/rating", RatingsRoute);
app.use("/api/address", AddressRoute);
app.use("/api/cart", CartRoute);
app.use("/api/orders", OrderRoute);

// test
app.get("/api/test", (req, res) => {
  res.send("Hello World");
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

// 使用 server.listen 而不是 app.listen
const PORT = process.env.PORT || 6013;
server.listen(PORT, () => {
  console.log(`Foodly Backend is running on port ${PORT}!`);
  console.log(`API文档: http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});

module.exports = app;
