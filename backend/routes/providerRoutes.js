// ✅ providerRoutes.js
const express = require("express");
const router = express.Router();
const {
  getProviderProfile,
  updateProviderProfile,
  getProviderServices,
  addService,
  updateService,
  deleteService,
} = require("../controllers/providerController");
const verifyToken = require("../middleware/providerAuth");

router.get("/profile", verifyToken, getProviderProfile);
router.put("/profile", verifyToken, updateProviderProfile);
router.get("/services", verifyToken, getProviderServices);
router.post("/services", verifyToken, addService);
router.put("/services/:id", verifyToken, updateService);
router.delete("/services/:id", verifyToken, deleteService);

module.exports = router;
