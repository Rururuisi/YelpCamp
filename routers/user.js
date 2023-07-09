const express = require('express');
const router = express.Router();
const passport = require('passport');
const user = require('../controllers/user');
const catchAsync = require('../utils/catchAsync');
const { storeReturnTo } = require('../middleware');


router.route('/register')
    .get(user.registerForm)
    .post(catchAsync(user.createUser));

router.route('/login')
    .get(user.loginForm)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: "/login" }), catchAsync(user.loginUser));

router.get('/logout', user.logoutUser);


module.exports = router;