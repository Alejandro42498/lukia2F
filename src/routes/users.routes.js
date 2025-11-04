// src/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
const User = require('../models/User');

// ✅ Obtener todos los usuarios (GET /api/users)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'name', 'email', 'role'] // muestra solo columnas necesarias
    });
    res.json(users);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ✅ Obtener un usuario por ID (GET /api/users/:id)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ✅ Actualizar usuario (PUT /api/users/:id)
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await user.update({ name, email, role });
    res.json({ message: 'Usuario actualizado correctamente', user });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ✅ Eliminar usuario (DELETE /api/users/:id)
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// 🟢 LOGIN DE USUARIO
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validar campos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // 2️⃣ Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // 3️⃣ Comparar contraseñas
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    // 4️⃣ Login exitoso
    res.status(200).json({
      message: '✅ Inicio de sesión exitoso',
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;