// Получение профиля клиента
router.get('/me', clientAuth, async (req, res) => {
  try {
    const clientId = req.client.id;
    const result = await db.query('SELECT id, name, email, phone FROM clients WHERE id = $1', [clientId]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении профиля клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление профиля клиента
router.put('/me', clientAuth, async (req, res) => {
  const { name, email, phone } = req.body;
  const clientId = req.client.id;

  try {
    await db.query(
      'UPDATE clients SET name = $1, email = $2, phone = $3 WHERE id = $4',
      [name, email, phone, clientId]
    );
    res.json({ message: 'Профиль обновлён' });
  } catch (error) {
    console.error('Ошибка при обновлении профиля клиента:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});
