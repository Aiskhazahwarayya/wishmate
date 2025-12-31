const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');
const { body } = require('express-validator');

/**
 * Validation Rules
 */
const wishlistValidation = [
    body('NamaItem')
        .notEmpty().withMessage('Nama item harus diisi')
        .isLength({ min: 3 }).withMessage('Nama item minimal 3 karakter'),
    body('Deskripsi')
        .notEmpty().withMessage('Deskripsi harus diisi'),
    body('TargetHarga')
        .notEmpty().withMessage('Target harga harus diisi')
        .isFloat({ min: 0 }).withMessage('Target harga harus berupa angka positif'),
    body('StatusItem')
        .optional()
        .isIn(['pending', 'dibeli']).withMessage('Status harus "pending" atau "dibeli"')
];

/**
 * Semua routes di bawah ini memerlukan authentication
 * Gunakan authMiddleware untuk protect routes
 */

router.get('/', authMiddleware, wishlistController.getAllWishlists);
router.get('/stats', authMiddleware, wishlistController.getStatistics);
router.get('/:id', authMiddleware, wishlistController.getWishlistById);
router.post('/', authMiddleware, wishlistValidation, wishlistController.createWishlist);
router.put('/:id', authMiddleware, wishlistValidation, wishlistController.updateWishlist);
router.patch('/:id/status', authMiddleware, wishlistController.updateStatus);
router.delete('/:id', authMiddleware, wishlistController.deleteWishlist);

module.exports = router;