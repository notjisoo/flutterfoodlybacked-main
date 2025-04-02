const router = require("express").Router();
const userController = require("../controllers/userController");
const { verifyTokenAndAuthorization } = require("../middleware/verifyToken")

router.get("/", verifyTokenAndAuthorization, userController.getUser);

router.delete("/", userController.deleteUser);

router.get("/verify/:otp", verifyTokenAndAuthorization, userController.verifyAccount);

router.get("/verify_phone/:phone", verifyTokenAndAuthorization, userController.verfyPhone);

module.exports = router