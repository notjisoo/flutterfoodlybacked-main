const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// 初始化express应用
const app = express();
dotenv.config();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 简单的处理函数
const handler = async (req, res) => {
  try {
    // 返回测试响应
    return res.status(200).json({
      status: "success",
      message: "Hello from Foodly API",
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  } catch (error) {
    console.error("服务器错误:", error);
    return res.status(500).json({
      status: "error",
      message: "服务器内部错误",
      error: error.message,
    });
  }
};

// 导出处理函数
module.exports = async (req, res) => {
  return handler(req, res);
};
