const express = require("express");
const app = express();
const dotenv = require("dotenv");
const WebSocket = require("ws");
const http = require("http");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

// 创建 HTTP 服务器
const server = http.createServer(app);

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ server });

// 存储连接的客户端
const clients = new Map();

// WebSocket 连接处理
wss.on("connection", (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const restaurantId = url.searchParams.get("restaurantId");

  if (restaurantId) {
    clients.set(restaurantId, ws);
    console.log(`餐厅 ${restaurantId} 已连接`);

    ws.on("close", () => {
      clients.delete(restaurantId);
      console.log(`餐厅 ${restaurantId} 已断开连接`);
    });
  }
});

// 发送新订单通知的函数
function sendNewOrderNotification(restaurantId, orderData) {
  const client = clients.get(restaurantId);
  if (client && client.readyState === WebSocket.OPEN) {
    client.send(
      JSON.stringify({
        type: "new_order",
        data: orderData,
      })
    );
    console.log(`已向餐厅 ${restaurantId} 发送新订单通知`);
  } else {
    console.log(`餐厅 ${restaurantId} 未连接或连接已断开`);
  }
}

// 加载环境变量
dotenv.config();

// Utility function to check if a string is a valid ObjectId
function isValidObjectId(id) {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

// 连接数据库
let client;
let database;

async function connectToDatabase() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected to MongoDB");
    database = client.db("test");
  }
  return database;
}

app.use(
  cors({
    origin: "*",
  })
);

// 排除webhook路由使用原始body
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/webhook")) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// ... 其他现有的路由代码 ...

// 设置 Webhook 监听端点
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("收到Webhook事件:", event.type);
      console.log("Webhook事件数据:", event.data);

      switch (event.type) {
        case "payment_intent.succeeded":
          // ... 现有的支付意图成功处理代码 ...
          break;

        case "payment_intent.payment_failed":
          // ... 现有的支付意图失败处理代码 ...
          break;

        case "checkout.session.completed":
          try {
            const checkoutData = event.data.object;

            if (!checkoutData.customer) {
              console.error("Missing customer data in checkout session.");
              break;
            }

            const customer = await stripe.customers.retrieve(
              checkoutData.customer
            );
            const cart = customer.metadata?.cart;
            if (!cart) {
              console.error("Cart is missing in customer metadata.");
              break;
            }

            const data = JSON.parse(cart);
            const products = data.map((item) => ({
              name: item.name,
              id: item.id,
              price: item.price,
              quantity: item.quantity,
              restaurantId: item.restaurantId,
              orderId: item.orderId,
            }));

            const db = await connectToDatabase();
            const ordersCollection = db.collection("orders");

            if (!isValidObjectId(products[0].orderId)) {
              console.error("Invalid orderId:", products[0].orderId);
              break;
            }

            // 更新订单状态
            const updatedOrder = await ordersCollection.findOneAndUpdate(
              { _id: new ObjectId(products[0].orderId) },
              {
                $set: {
                  paymentStatus: "Completed",
                  orderStatus: "Placed",
                },
              },
              { returnDocument: "after" }
            );

            // 发送 WebSocket 通知
            if (updatedOrder.value) {
              sendNewOrderNotification(
                products[0].restaurantId,
                updatedOrder.value
              );
              console.log("Order updated and notification sent successfully.");
            }
          } catch (error) {
            console.error("Error processing checkout session:", error);
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.status(200).send("Webhook received");
    } catch (err) {
      console.error("Webhook signature verification failed.", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// 启动服务器
const PORT = process.env.PORT || 6013;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
