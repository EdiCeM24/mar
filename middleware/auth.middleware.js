function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && typeof req.isAuthenticated === 'function') {
    if(!req.isAuthenticated()) {
      return next();
    }
  }

  res.redirect('/api/login');
}

module.exports = { ensureAuthenticated };
