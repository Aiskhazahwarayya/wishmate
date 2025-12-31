const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

/**
 * Validation Rules
 */
const registerValidation = [
    body('NamaLengkap')
        .notEmpty().withMessage('Nama lengkap harus diisi')
        .isLength({ min: 3 }).withMessage('Nama lengkap minimal 3 karakter'),
    body('Email')
        .notEmpty().withMessage('Email harus diisi')
        .isEmail().withMessage('Format email tidak valid'),
    body('Password')
        .notEmpty().withMessage('Password harus diisi')
        .isLength({ min: 6 }).withMessage('Password minimal 6 karakter')
];

const loginValidation = [
    body('Email')
        .notEmpty().withMessage('Email harus diisi')
        .isEmail().withMessage('Format email tidak valid'),
    body('Password')
        .notEmpty().withMessage('Password harus diisi')
];

const changePasswordValidation = [
    body('OldPassword')
        .notEmpty().withMessage('Password lama harus diisi'),
    body('NewPassword')
        .notEmpty().withMessage('Password baru harus diisi')
        .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter')
];

/**
 * Routes
 */

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, changePasswordValidation, authController.changePassword);

module.exports = router;