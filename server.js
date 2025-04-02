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
const setupWebSocket = require("./utils/websocket");

dotenv.config();

// 创建 HTTP 服务器
const server = require("http").createServer(app);

// 中间件配置
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 添加健康检查路由
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// 设置 WebSocket
setupWebSocket(server, app);

// 数据库连接
mongoose
  .connect(
    "mongodb+srv://foodly:mcQsSBqbnEi4qmwr@foodly.8brkl.mongodb.net/?retryWrites=true&w=majority&appName=foodly"
  )
  .then(() => {
    console.log("Foodly Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// 路由配置
app.use("/", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/category", CategoryRoute);
app.use("/api/restaurant", RestaurantRoute);
app.use("/api/food", FoodsRoute);
app.use("/api/rating", RatingsRoute);
app.use("/api/address", AddressRoute);
app.use("/api/cart", CartRoute);
app.use("/api/orders", OrderRoute);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 使用 server.listen 而不是 app.listen
const PORT = process.env.PORT || 6013;
server.listen(PORT, () => {
  console.log(`Foodly Backend is running on port ${PORT}!`);
});
