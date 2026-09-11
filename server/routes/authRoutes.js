const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/reset-password', ctrl.resetPassword);
router.get('/me', requireAuth, ctrl.me);

module.exports = router;
