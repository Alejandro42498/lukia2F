// middlewares/auth.js
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next(); // ✅ Permite el acceso si es admin
  }

  // Si no es admin o no hay sesión
  res.status(403).render('pages/error', { 
    message: 'Acceso denegado: solo administradores' 
  });
}

module.exports = { isAdmin };
