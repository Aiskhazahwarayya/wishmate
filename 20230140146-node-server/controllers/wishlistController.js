const { Wishlist, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Get All Wishlists by User
 */
exports.getAllWishlists = async (req, res) => {
    try {
        const userId = req.user.ID_User;
        const { status, search, sortBy = 'createdAt', order = 'DESC' } = req.query;

        // Build where clause
        let whereClause = { ID_User: userId };

        // Filter by status
        if (status && ['pending', 'dibeli'].includes(status)) {
            whereClause.StatusItem = status;
        }

        // Search by nama item atau deskripsi
        if (search) {
            whereClause[Op.or] = [
                { NamaItem: { [Op.like]: `%${search}%` } },
                { Deskripsi: { [Op.like]: `%${search}%` } }
            ];
        }

        const wishlists = await Wishlist.findAll({
            where: whereClause,
            order: [[sortBy, order]],
            include: [{
                model: User,
                as: 'user',
                attributes: ['ID_User', 'NamaLengkap', 'Email']
            }]
        });

        // Calculate statistics
        const stats = {
            total: wishlists.length,
            pending: wishlists.filter(w => w.StatusItem === 'pending').length,
            dibeli: wishlists.filter(w => w.StatusItem === 'dibeli').length,
            totalHarga: wishlists.reduce((sum, w) => sum + parseFloat(w.TargetHarga), 0),
            totalHargaPending: wishlists
                .filter(w => w.StatusItem === 'pending')
                .reduce((sum, w) => sum + parseFloat(w.TargetHarga), 0)
        };

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data wishlist',
            data: {
                wishlists,
                stats
            }
        });

    } catch (error) {
        console.error('Get all wishlists error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil wishlist',
            error: error.message
        });
    }
};

/**
 * Get Single Wishlist by ID
 */
exports.getWishlistById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.ID_User;

        const wishlist = await Wishlist.findOne({
            where: { 
                ID_Wishlist: id,
                ID_User: userId 
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['ID_User', 'NamaLengkap', 'Email']
            }]
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil data wishlist',
            data: wishlist
        });

    } catch (error) {
        console.error('Get wishlist by id error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil wishlist',
            error: error.message
        });
    }
};

/**
 * Create New Wishlist
 */
exports.createWishlist = async (req, res) => {
    try {
        // Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal',
                errors: errors.array()
            });
        }

        const { NamaItem, Deskripsi, TargetHarga, StatusItem } = req.body;
        const userId = req.user.ID_User;

        // Buat wishlist baru
        const newWishlist = await Wishlist.create({
            ID_User: userId,
            NamaItem,
            Deskripsi,
            TargetHarga,
            StatusItem: StatusItem || 'pending'
        });

        // Ambil data lengkap dengan relasi
        const wishlist = await Wishlist.findByPk(newWishlist.ID_Wishlist, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['ID_User', 'NamaLengkap', 'Email']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Wishlist berhasil dibuat',
            data: wishlist
        });

    } catch (error) {
        console.error('Create wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat membuat wishlist',
            error: error.message
        });
    }
};

/**
 * Update Wishlist
 */
exports.updateWishlist = async (req, res) => {
    try {
        // Validasi input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validasi gagal',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const userId = req.user.ID_User;
        const { NamaItem, Deskripsi, TargetHarga, StatusItem } = req.body;

        // Cek apakah wishlist ada dan milik user ini
        const wishlist = await Wishlist.findOne({
            where: { 
                ID_Wishlist: id,
                ID_User: userId 
            }
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist tidak ditemukan'
            });
        }

        // Update wishlist
        await Wishlist.update(
            { NamaItem, Deskripsi, TargetHarga, StatusItem },
            { where: { ID_Wishlist: id } }
        );

        // Ambil data terbaru
        const updatedWishlist = await Wishlist.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['ID_User', 'NamaLengkap', 'Email']
            }]
        });

        res.status(200).json({
            success: true,
            message: 'Wishlist berhasil diupdate',
            data: updatedWishlist
        });

    } catch (error) {
        console.error('Update wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat update wishlist',
            error: error.message
        });
    }
};

/**
 * Update Status Wishlist (Mark as Dibeli/Pending)
 */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.ID_User;
        const { StatusItem } = req.body;

        // Validasi status
        if (!['pending', 'dibeli'].includes(StatusItem)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid. Gunakan "pending" atau "dibeli"'
            });
        }

        // Cek apakah wishlist ada dan milik user ini
        const wishlist = await Wishlist.findOne({
            where: { 
                ID_Wishlist: id,
                ID_User: userId 
            }
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist tidak ditemukan'
            });
        }

        // Update status
        await Wishlist.update(
            { StatusItem },
            { where: { ID_Wishlist: id } }
        );

        const updatedWishlist = await Wishlist.findByPk(id);

        res.status(200).json({
            success: true,
            message: `Status berhasil diubah menjadi ${StatusItem}`,
            data: updatedWishlist
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat update status',
            error: error.message
        });
    }
};

/**
 * Delete Wishlist
 */
exports.deleteWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.ID_User;

        // Cek apakah wishlist ada dan milik user ini
        const wishlist = await Wishlist.findOne({
            where: { 
                ID_Wishlist: id,
                ID_User: userId 
            }
        });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist tidak ditemukan'
            });
        }

        // Hapus wishlist
        await Wishlist.destroy({
            where: { ID_Wishlist: id }
        });

        res.status(200).json({
            success: true,
            message: 'Wishlist berhasil dihapus'
        });

    } catch (error) {
        console.error('Delete wishlist error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menghapus wishlist',
            error: error.message
        });
    }
};

/**
 * Get Wishlist Statistics
 */
exports.getStatistics = async (req, res) => {
    try {
        const userId = req.user.ID_User;

        const wishlists = await Wishlist.findAll({
            where: { ID_User: userId }
        });

        const stats = {
            totalWishlist: wishlists.length,
            totalPending: wishlists.filter(w => w.StatusItem === 'pending').length,
            totalDibeli: wishlists.filter(w => w.StatusItem === 'dibeli').length,
            totalTargetHarga: wishlists.reduce((sum, w) => sum + parseFloat(w.TargetHarga), 0),
            totalHargaPending: wishlists
                .filter(w => w.StatusItem === 'pending')
                .reduce((sum, w) => sum + parseFloat(w.TargetHarga), 0),
            totalHargaDibeli: wishlists
                .filter(w => w.StatusItem === 'dibeli')
                .reduce((sum, w) => sum + parseFloat(w.TargetHarga), 0)
        };

        res.status(200).json({
            success: true,
            message: 'Berhasil mengambil statistik',
            data: stats
        });

    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil statistik',
            error: error.message
        });
    }
};