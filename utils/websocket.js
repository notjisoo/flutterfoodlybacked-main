const WebSocket = require("ws");
const Order = require("../models/Order");

const setupWebSocket = (server, app) => {
  // 创建 WebSocket 服务器
  const wss = new WebSocket.Server({
    server,
  });

  // 存储所有连接的客户端，使用 Map 来存储餐厅ID和对应的连接
  const restaurantClients = new Map();

  // WebSocket 连接处理
  wss.on("connection", (ws, req) => {
    console.log("新的WebSocket连接已建立");

    // 从请求中获取餐厅ID（这里假设通过查询参数传递）
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const restaurantId = urlParams.get("restaurantId");

    if (restaurantId) {
      console.log(`餐厅 ${restaurantId} 的 WebSocket 连接已建立`);
      restaurantClients.set(restaurantId, ws);

      // 发送连接成功消息
      ws.send(
        JSON.stringify({
          type: "connection_success",
          message: "WebSocket连接成功",
          restaurantId: restaurantId,
        })
      );

      // 心跳检测
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        }
      }, 30000);

      ws.on("pong", () => {
        // 收到pong响应，连接正常
        console.log(`餐厅 ${restaurantId} 连接正常`);
      });

      ws.on("close", () => {
        console.log(`餐厅 ${restaurantId} 的连接已断开`);
        restaurantClients.delete(restaurantId);
        clearInterval(pingInterval);
      });

      ws.on("error", (error) => {
        console.error(`餐厅 ${restaurantId} 连接错误:`, error);
      });
    } else {
      console.log("未提供餐厅ID，关闭连接");
      ws.close();
    }
  });

  // 导出 restaurantClients Map
  wss.restaurantClients = restaurantClients;

  return wss;
};

module.exports = setupWebSocket;
