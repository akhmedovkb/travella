// server/controllers/providerController.js
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const provider = await Provider.findOne({ where: { email } });
  if (!provider) return res.status(401).json({ message: 'Пользователь не найден' });

  const isMatch = await bcrypt.compare(password, provider.password);
  if (!isMatch) return res.status(401).json({ message: 'Неверный пароль' });

  const token = jwt.sign({ id: provider.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(200).json({ token, provider });
};
