const express = require("express");
const router = express.Router();

// 测试路由
router.get("/", (req, res) => {
  res.json({
    message: "Hello World",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
