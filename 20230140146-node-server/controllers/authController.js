const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { validationResult } = require('express-validator');

/**
 * Register User Baru
 */
exports.register = async (req, res) => {
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

        const { NamaLengkap, Email, Password } = req.body;

        // Cek apakah email sudah terdaftar
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // Buat user baru
        const newUser = await User.create({
            NamaLengkap,
            Email,
            Password: hashedPassword
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                ID_User: newUser.ID_User, 
                Email: newUser.Email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Registrasi berhasil',
            data: {
                user: {
                    ID_User: newUser.ID_User,
                    NamaLengkap: newUser.NamaLengkap,
                    Email: newUser.Email
                },
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat registrasi',
            error: error.message
        });
    }
};

/**
 * Login User
 */
exports.login = async (req, res) => {
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

        const { Email, Password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findOne({ where: { Email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(Password, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                ID_User: user.ID_User, 
                Email: user.Email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: {
                    ID_User: user.ID_User,
                    NamaLengkap: user.NamaLengkap,
                    Email: user.Email
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat login',
            error: error.message
        });
    }
};

/**
 * Get Profile User (Protected Route)
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.ID_User, {
            attributes: { exclude: ['Password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil mendapatkan profile',
            data: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil profile',
            error: error.message
        });
    }
};

/**
 * Update Profile User
 */
exports.updateProfile = async (req, res) => {
    try {
        const { NamaLengkap, Email } = req.body;
        const userId = req.user.ID_User;

        // Cek apakah email baru sudah digunakan user lain
        if (Email) {
            const existingUser = await User.findOne({ 
                where: { 
                    Email,
                    ID_User: { [require('sequelize').Op.ne]: userId }
                } 
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah digunakan oleh user lain'
                });
            }
        }

        // Update user
        await User.update(
            { NamaLengkap, Email },
            { where: { ID_User: userId } }
        );

        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['Password'] }
        });

        res.status(200).json({
            success: true,
            message: 'Profile berhasil diupdate',
            data: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat update profile',
            error: error.message
        });
    }
};

/**
 * Change Password
 */
exports.changePassword = async (req, res) => {
    try {
        const { OldPassword, NewPassword } = req.body;
        const userId = req.user.ID_User;

        // Cari user
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan'
            });
        }

        // Verifikasi password lama
        const isPasswordValid = await bcrypt.compare(OldPassword, user.Password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Password lama salah'
            });
        }

        // Hash password baru
        const hashedNewPassword = await bcrypt.hash(NewPassword, 10);

        // Update password
        await User.update(
            { Password: hashedNewPassword },
            { where: { ID_User: userId } }
        );

        res.status(200).json({
            success: true,
            message: 'Password berhasil diubah'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengubah password',
            error: error.message
        });
    }
};