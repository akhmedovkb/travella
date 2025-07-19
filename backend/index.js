
const express = require("express");
const cors = require("cors");
const app = express();
const providerRoutes = require("./routes/providerRoutes");


// ✅ Настройка CORS для фронтенда на Vercel
app.use(
  cors({
    origin: "https://frontend-komil.vercel.app",
    credentials: true,
  })
);

app.use(express.json());

// Роуты
app.use("/api/providers", providerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
