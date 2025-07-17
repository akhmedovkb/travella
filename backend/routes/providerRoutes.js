const express = require("express");
const router = express.Router();
const {
  registerProvider,
  loginProvider,
  getProviderProfile,
  updateProviderProfile,
  createService,
  getProviderServices,
  updateService,
  deleteService,
} = require("../controllers/providerController");

const verifyToken = require("../middleware/providerAuth");

// Регистрация
router.post("/register", registerProvider);

// Вход
router.post("/login", loginProvider);

// Получить профиль
router.get("/profile", verifyToken, getProviderProfile);

// Обновить профиль
router.put("/profile", verifyToken, updateProviderProfile);

// Услуги поставщика
router.post("/services", verifyToken, createService);
router.get("/services", verifyToken, getProviderServices);
router.put("/services/:id", verifyToken, updateService);
router.delete("/services/:id", verifyToken, deleteService);

module.exports = router;
