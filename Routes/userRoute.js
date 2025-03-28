const express = require('express');
const router = express.Router();
const userRoute = require('../Controllers/UserController');

router.get('/login', userRoute.see);
router.get('/register', userRoute.newUserForm);
router.post('/api/login', userRoute.login);

router.post('/api/register', userRoute.register);

module.exports = router;