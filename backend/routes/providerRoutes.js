
const express = require("express");
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  addService,
  getServices,
  updateService,
  deleteService
} = require("../controllers/providerController");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/register", registerProvider);
router.post("/login", loginProvider);
router.get("/profile", authenticateToken, getProviderProfile);
router.put("/profile", authenticateToken, updateProviderProfile);
router.post("/services", authenticateToken, addService);
router.get("/services", authenticateToken, getServices);
router.put("/services/:id", authenticateToken, updateService);
router.delete("/services/:id", authenticateToken, deleteService);

module.exports = router;
