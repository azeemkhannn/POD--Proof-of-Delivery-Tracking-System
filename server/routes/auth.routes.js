// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Validation rules
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const registerValidation = [
  body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[0-9]{11}$/).withMessage('Phone must be 11 digits'),
  body('role').optional().isIn(['admin', 'driver']).withMessage('Invalid role')
];

// Routes
router.post('/login', loginValidation, authController.login);
router.post('/login-driver', loginValidation, authController.loginDriver);
router.post('/register', registerValidation, authController.register);
router.get('/verify', protect, authController.verifyToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;