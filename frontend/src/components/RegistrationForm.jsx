import { useState } from 'react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    type: '', name: '', contact_name: '', email: '',
    phone: '', password: '', description: '', location: '', languages: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <select name="type" onChange={handleChange} required>
        <option value="">Выберите тип</option>
        <option value="guide">Гид</option>
        <option value="transport">Транспорт</option>
        <option value="hotel">Отель</option>
        <option value="food">Питание</option>
        <option value="attraction">Достопримечательность</option>
        <option value="event">Мероприятие</option>
      </select>
      <input name="name" placeholder="Название" onChange={handleChange} required />
      <input name="contact_name" placeholder="Контактное лицо" onChange={handleChange} required />
      <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
      <input name="phone" placeholder="Телефон" onChange={handleChange} />
      <input name="password" type="password" placeholder="Пароль" onChange={handleChange} required />
      <input name="location" placeholder="Локация" onChange={handleChange} />
      <input name="languages" placeholder="Языки (через запятую)" onChange={handleChange} />
      <textarea name="description" placeholder="Описание" onChange={handleChange} />
      <button type="submit">Зарегистрироваться</button>
    </form>
  );
}