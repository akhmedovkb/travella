
const express = require("express");
const router = express.Router();
const providerController = require("../controllers/providerController");
const authMiddleware = require("../middleware/auth");

router.put("/profile", authMiddleware, providerController.updateProviderProfile);
router.put("/services/:id", authMiddleware, providerController.updateService);
router.delete("/services/:id", authMiddleware, providerController.deleteService);

module.exports = router;
