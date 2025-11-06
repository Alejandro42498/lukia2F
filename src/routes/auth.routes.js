// src/routes/auth.routes.js intentionally left blank (placeholder)

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');


// Mostrar formularios
router.get('/login', (req, res) => {
  res.render('pages/auth/login');
});

router.get('/register', (req, res) => {
  res.render('pages/auth/register');
});

// Crear usuario (registro público)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user' // el rol por defecto
    });

    res.redirect('/login'); // ✅ redirige al login después de registrarse
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.render('pages/auth/register', { error: 'No se pudo crear la cuenta. Intenta nuevamente.' });
  }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render('pages/auth/login', { error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.render('pages/auth/login', { error: 'Contraseña incorrecta' });
    }

    req.session.user = user; // guardar sesión
    res.redirect('/'); // ✅ redirige al home
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.render('pages/auth/login', { error: 'Ocurrió un error al iniciar sesión' });
  }
});

// --- Cerrar sesión ---
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});



module.exports = router;
