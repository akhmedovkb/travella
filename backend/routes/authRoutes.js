import express from 'express';
const router = express.Router();

router.post('/providers/register', async (req, res) => {
  console.log('📥 Получен запрос на регистрацию');
  res.json({ message: 'Поставщик зарегистрирован (заглушка)' });
});

export default router;
