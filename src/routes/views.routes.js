const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isAdmin } = require('../middlewares/auth'); // 🔒 Middleware para admin

// 🟢 Página de inicio de sesión
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null });
});

// 🟢 Página de registro
router.get('/register', (req, res) => {
  res.render('pages/register', { error: null });
});

// 🟢 Listado de usuarios (CRUD principal)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.render('pages/admin/list', { users }); // 👈 Renderiza lista con los datos
  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error);
    res.status(500).send('Error al cargar usuarios');
  }
});

// 🟢 Ver detalles de un usuario
router.get('/users/view/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.redirect('/users');
    res.render('pages/admin/user-view', { user }); // 👈 Crea esta vista (te la dejo más abajo)
  } catch (error) {
    console.error('❌ Error al ver usuario:', error);
    res.status(500).send('Error al ver usuario');
  }
});

// 🟢 Formulario para crear un usuario
router.get('/users/create', (req, res) => {
  res.render('pages/admin/user-create', { error: null });
});

// 🟢 Procesar creación de usuario
router.post('/users/create', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.render('pages/admin/user-create', { error: 'Todos los campos son obligatorios' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render('pages/admin/user-create', { error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role });

    res.redirect('/users'); // ✅ Redirige a la lista
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).send('Error al crear usuario');
  }
});

// 🟢 Formulario de edición
router.get('/users/edit/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.redirect('/users');
    res.render('pages/admin/user-edit', { user, error: null });
  } catch (error) {
    console.error('❌ Error al cargar usuario para editar:', error);
    res.status(500).send('Error al cargar usuario');
  }
});

// 🟢 Procesar edición
router.post('/users/edit/:id', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.redirect('/users');

    user.name = name;
    user.email = email;
    user.role = role;

    if (password && password.trim() !== '') {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.redirect('/users');
  } catch (error) {
    console.error('❌ Error al editar usuario:', error);
    res.status(500).send('Error al editar usuario');
  }
});

// 🟢 Eliminar usuario
router.post('/users/delete/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.redirect('/users');

    await user.destroy();
    res.redirect('/users'); // ✅ Vuelve a la lista después de eliminar
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).send('Error al eliminar usuario');
  }
});

module.exports = router;