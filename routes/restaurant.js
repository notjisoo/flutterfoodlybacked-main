const router = require("express").Router();
const restaurantController = require("../controllers/restaurantController");
const { verifyTokenAndAuthorization } = require("../middleware/verifyToken");

// 获取所有餐厅
router.get("/", restaurantController.getAllRestaurants);

router.post(
  "/",
  verifyTokenAndAuthorization,
  restaurantController.addRestaurant
);

router.get("/:code", restaurantController.getRandomRestaurant);

router.get("/all/:code", restaurantController.getAllNearByRestaurants);

router.get("/byId/:id", restaurantController.getRestaurantById);

router.get(
  "/owner/profile",
  verifyTokenAndAuthorization,
  restaurantController.getRestaurantByOwner
);

module.exports = router;
