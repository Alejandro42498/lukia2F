const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// 🟢 LOGIN DE USUARIO (para vista) → debe ir antes de "/:id"
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render('pages/login', { error: 'Debes ingresar tu correo y contraseña' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render('pages/login', { error: 'Usuario no encontrado' });
    }

    // Soportar usuarios antiguos con contraseña en texto plano en la BD.
    const stored = user.password || '';
    let validPassword = false;

    try {
      if (stored.startsWith('$2')) {
        // Contraseña ya hasheada con bcrypt
        validPassword = await bcrypt.compare(password, stored);
      } else {
        // Legacy: contraseña en texto plano
        validPassword = password === stored;
        if (validPassword) {
          // Migrar a hash para seguridad
          user.password = await bcrypt.hash(password, 10);
          await user.save();
          console.log(`Usuario ${user.email} migrado a contraseña hasheada`);
        }
      }
    } catch (err) {
      console.error('Error comprobando contraseña:', err);
      return res.status(500).render('pages/login', { error: 'Error en el servidor' });
    }

    if (!validPassword) {
      return res.render('pages/login', { error: 'Contraseña incorrecta' });
    }

    // Guardar sesión (normalizar user y userId para compatibilidad)
    req.session.user = {
      id: user.user_id,
      name: user.name,
      role: user.role,
    };
  req.session.userId = user.user_id;

  // Después de iniciar sesión, llevar al usuario al dashboard
  res.redirect('/dashboard');
  } catch (error) {
    console.error('❌ Error al iniciar sesión:', error);
    res.status(500).render('pages/login', { error: 'Error en el servidor' });
  }
});

// ✅ Crear usuario (POST /api/users)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.render('pages/usuarios/create', { error: 'Todos los campos son obligatorios' });
      }
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.render('pages/usuarios/create', { error: 'El correo ya está en uso' });
      }
      return res.status(400).json({ error: 'El correo ya está en uso' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect('/usuarios');
    }

    res.status(201).json({ message: 'Usuario creado correctamente', user });
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ✅ Eliminar usuario desde formulario (POST /api/users/delete/:id)
router.post('/delete/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send('Usuario no encontrado');
    await user.destroy();
    res.redirect('/usuarios');
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

// ✅ Actualizar usuario desde formulario (POST /api/users/:id)
router.post('/:id', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).send('Usuario no encontrado');

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.redirect('/usuarios');
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).send('Error en el servidor');
  }
});

// ✅ Obtener todos los usuarios (GET /api/users)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['user_id', 'name', 'email', 'role'],
    });

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('pages/usuarios/list', { usuarios: users });
    }

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

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.render('pages/usuarios/detail', { usuario: user });
    }

    res.json(user);
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ✅ Actualizar usuario (PUT /api/users/:id) → Postman
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

// ✅ Eliminar usuario (DELETE /api/users/:id) → Postman
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

module.exports = router;
