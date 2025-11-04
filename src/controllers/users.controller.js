// src/controllers/users.controller.js intentionally left blank (placeholder)

const bcrypt = require("bcrypt");
const User = require("../models/User");

// Registro
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "Todos los campos son requeridos" });

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ error: "Email ya registrado" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) { res.status(500).json({ error: "Error en el servidor" }); }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Credenciales inválidas" });

    req.session.userId = user.id;
    req.session.role = user.role;

    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (err) { res.status(500).json({ error: "Error en el servidor" }); }
};

// Obtener todos los usuarios (admin)
const getUsers = async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ["password"] } });
  res.json(users);
};

// Actualizar usuario (admin)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  if (username) user.username = username;
  if (email) user.email = email;
  if (role) user.role = role;
  if (password) user.password = await bcrypt.hash(password, 10);

  await user.save();
  res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
};

// Eliminar usuario (admin)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.session.userId) return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

  await user.destroy();
  res.json({ message: "Usuario eliminado" });
};

module.exports = { registerUser, loginUser, getUsers, updateUser, deleteUser };
