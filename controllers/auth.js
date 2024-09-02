function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next(); // O usuário está autenticado, continuar para a próxima função/middleware
    } else {
        return res.redirect('/'); // Redireciona para a página inicial se não estiver autenticado
    }
}

module.exports = { isAuthenticated };