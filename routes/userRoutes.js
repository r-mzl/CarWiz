const express = require('express');
const userController = require('../controllers/userController');
const {isGuest, isLoggedIn} = require('../middleware/auth');

const router = express.Router();

router.get('/new', isGuest, userController.new);
router.get('/login', isGuest, userController.loginShow);
router.post('/', isGuest, userController.createUser);
router.post('/login', isGuest, userController.login);
router.get('/profile', isLoggedIn, userController.profile);
router.get('/logout', isLoggedIn, userController.logout);

module.exports = router;