// middlewares/auth.js
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next(); // ✅ Permite el acceso si es admin
  }

  // Si no es admin o no hay sesión
  res.status(403).render('pages/error', {
    message: 'Acceso denegado: solo administradores'
  });
}

function isAuthenticated(req, res, next) {
  // Soportar dos formas: req.session.userId (nuevo) o req.session.user (legacy)
  if (req.session && req.session.userId) return next();

  if (req.session && req.session.user && req.session.user.id) {
    // Normalizar a userId para compatibilidad con el resto del código
    req.session.userId = req.session.user.id;
    return next();
  }

  // Si no hay sesión válida, redirigir al login
  return res.redirect('/login');
}

module.exports = { isAdmin, isAuthenticated };
