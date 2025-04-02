const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const CategoryRoute = require("../routes/category");
const RestaurantRoute = require("../routes/restaurant");
const FoodsRoute = require("../routes/food");
const RatingsRoute = require("../routes/rating");
const AuthRoute = require("../routes/auth");
const UserRoute = require("../routes/user");
const AddressRoute = require("../routes/address");
const CartRoute = require("../routes/cart");
const OrderRoute = require("../routes/order");
const TestRoute = require("./test");

// 初始化express应用
const app = express();
dotenv.config();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGOURL ||
        "mongodb+srv://foodly:mcQsSBqbnEi4qmwr@foodly.8brkl.mongodb.net/?retryWrites=true&w=majority&appName=foodly",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("数据库连接错误:", err.message);
    process.exit(1);
  }
};

// 连接数据库
connectDB();

// API路由处理函数
const handler = async (req, res) => {
  try {
    const path = req.url;

    // 根路由
    if (path === "/" || path === "") {
      return res.status(200).json({
        status: "success",
        message: "欢迎访问 Foodly API",
        version: "1.0.0",
      });
    }

    // 健康检查
    if (path === "/health") {
      return res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    }

    // 测试路由
    if (path === "/api/test") {
      return res.status(200).json({
        message: "Test API is working",
        timestamp: new Date().toISOString(),
      });
    }

    // 路由配置
    if (path === "/api/auth") {
      return AuthRoute(req, res);
    }
    if (path === "/api/users") {
      return UserRoute(req, res);
    }
    if (path === "/api/category") {
      return CategoryRoute(req, res);
    }
    if (path === "/api/restaurant") {
      return RestaurantRoute(req, res);
    }
    if (path === "/api/food") {
      return FoodsRoute(req, res);
    }
    if (path === "/api/rating") {
      return RatingsRoute(req, res);
    }
    if (path === "/api/address") {
      return AddressRoute(req, res);
    }
    if (path === "/api/cart") {
      return CartRoute(req, res);
    }
    if (path === "/api/orders") {
      return OrderRoute(req, res);
    }

    // 404处理
    return res.status(404).json({
      status: "error",
      message: "未找到请求的资源",
      path: path,
    });
  } catch (error) {
    console.error("服务器错误:", error);
    return res.status(500).json({
      status: "error",
      message: "服务器内部错误",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// 导出处理函数
module.exports = (req, res) => {
  // 添加中间件
  return app(req, res, () => handler(req, res));
};
