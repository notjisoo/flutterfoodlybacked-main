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

module.exports = router;
