// Вверху файла
const authMiddleware = require('../middleware/clientAuth');

// Защищённый маршрут - данные клиента
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const clientId = req.client.id;
    const result = await db.query('SELECT id, name, email, phone FROM clients WHERE id = $1', [clientId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Клиент не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении данных клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
