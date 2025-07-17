
const pool = require("../db");

exports.updateProviderProfile = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { name, languages, type, location } = req.body;

    const result = await pool.query(
      "UPDATE providers SET name=$1, languages=$2, type=$3, location=$4 WHERE id=$5 RETURNING *",
      [name, languages, type, location, providerId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Ошибка при обновлении профиля:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { title, description, price, category, availability } = req.body;

    const result = await pool.query(
      "UPDATE services SET title=$1, description=$2, price=$3, category=$4, availability=$5 WHERE id=$6 RETURNING *",
      [title, description, price, category, availability, serviceId]
    );

    res.json({ message: "Услуга обновлена", service: result.rows[0] });
  } catch (error) {
    console.error("Ошибка при обновлении услуги:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    await pool.query("DELETE FROM services WHERE id = $1", [serviceId]);
    res.json({ message: "Услуга удалена" });
  } catch (error) {
    console.error("Ошибка при удалении услуги:", error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
};
