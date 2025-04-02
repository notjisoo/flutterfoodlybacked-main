const express = require("express");
const router = express.Router();

// 测试路由
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Test API is working",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
  });
});

// 添加健康检查路由
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 根路由
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "欢迎访问 Foodly API",
    version: "1.0.0",
    endpoints: {
      test: "/api/test",
      health: "/health",
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

module.exports = router;
