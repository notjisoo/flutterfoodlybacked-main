const router = require("express").Router();
const orderController = require("../controllers/orderController");
const { verifyTokenAndAuthorization } = require("../middleware/verifyToken");

// 下单
router.post("/", verifyTokenAndAuthorization, orderController.placeOrder);

// 获得用户订单
router.get("/", verifyTokenAndAuthorization, orderController.getUserOrders);

// 获得餐厅订单
router.get(
  "/rest-orders/:id/:status",
  verifyTokenAndAuthorization,
  orderController.getRestaurantOrder
);

// 修改订单状态
router.put(
  "/update/:id",
  verifyTokenAndAuthorization,
  orderController.updateOrderStatus
);

// 获得订单详情
router.get(
  "/:id",
  verifyTokenAndAuthorization,
  orderController.getOrderDetails
);

module.exports = router;
