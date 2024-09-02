function checkLogin(req, res, next) {
    res.locals.isLoggedIn = req.session.user ? true : false;
    next();
}

module.exports = checkLogin;
