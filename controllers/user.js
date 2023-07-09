const User = require('../models/user');

module.exports.registerForm = (req, res) => {
    res.render('user/register', { title: 'Register' });
}

module.exports.createUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email });
        const registerUser = await User.register(user, password);
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to the YelpCamp! ");
            res.redirect("/campgrounds");
        })
    }
    catch (err) {
        req.flash("error", err.message);
        res.redirect("/register");
    }
}

module.exports.loginForm = (req, res) => {
    res.render('user/login', { title: "Login" });
}

module.exports.loginUser = async (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/campgrounds";
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res, next) => {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        req.flash("success", "Goodbye!");
        res.redirect("/");
    })
}