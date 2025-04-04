const router = require("express").Router();
const addressController = require("../controllers/addressController");
const { verifyTokenAndAuthorization } = require("../middleware/verifyToken")

router.post("/", verifyTokenAndAuthorization, addressController.addAddress);

router.get("/all", verifyTokenAndAuthorization, addressController.getAddresses);

router.get("/default", verifyTokenAndAuthorization, addressController.getDefaultAddress);

router.delete("/:id", verifyTokenAndAuthorization, addressController.deleteAddress);

router.patch("/default/:id", verifyTokenAndAuthorization, addressController.setAddressDefault);

module.exports = router

