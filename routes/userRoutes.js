const express = require('express');
const userController = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middleware/auth');
const { logInLimiter } = require('../middleware/rateLimiters');
const {validateLogin, validatorSignup, validateResult} = require('../middleware/validator');

const router = express.Router();

router.get('/new', isGuest, userController.new);
router.get('/login', isGuest, userController.loginShow);
router.post('/', isGuest, validatorSignup, validateResult, userController.createUser);
router.post('/login', logInLimiter, isGuest, validateLogin, validateResult, userController.login);
router.get('/profile', isLoggedIn, userController.profile);
router.get('/logout', isLoggedIn, userController.logout);

module.exports = router;