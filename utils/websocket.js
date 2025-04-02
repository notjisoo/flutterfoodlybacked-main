const WebSocket = require("ws");
const Order = require("../models/Order");
const setupWebSocket = (server, app) => {
  // 创建 WebSocket 服务器
  const wss = new WebSocket.Server({ server });

  // 存储所有连接的客户端，使用 Map 来存储餐厅ID和对应的连接
  const clients = new Map();

  // WebSocket 连接处理
  wss.on("connection", (ws, req) => {
    // 从请求中获取餐厅ID（这里假设通过查询参数传递）
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const restaurantId = urlParams.get("restaurantId");

    if (restaurantId) {
      console.log(`餐厅 ${restaurantId} 的 WebSocket 连接已建立`);
      clients.set(restaurantId, ws);

      ws.on("close", () => {
        console.log(`餐厅 ${restaurantId} 的连接已断开`);
        clients.delete(restaurantId);
      });
    }
  });

  // 订单支付成功通知路由
  app.post("/api/orders/payment-success", async (req, res) => {
    try {
      const { orderId, orderDetails, paymentStatus } = req.body;

      // 1. 更新订单状态
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "Completed",
      });

      // 2. 获取订单对应的商家ID
      const order = await Order.findById(orderId);
      const restaurantId = order.restaurantId;
      // 3. 获取对应商家的WebSocket连接
      const restaurantWs = clients.get(restaurantId);

      if (restaurantWs && restaurantWs.readyState === WebSocket.OPEN) {
        // 4. 只向对应的商家发送通知
        const wsMessage = {
          type: "order_paid", // 订单支付成功通知
          orderId: orderId,
          orderDetails: orderDetails,
        };
        restaurantWs.send(JSON.stringify(wsMessage));
      }

      res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Error processing payment success:", error);
      res.status(500).json({ error: "Failed to process payment success" });
    }
  });

  return wss;
};

// 提现通知

module.exports = setupWebSocket;
