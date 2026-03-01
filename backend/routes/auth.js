const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const { run, get } = require('../db/database');
const authMiddleware = require('../middleware/auth');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const generateToken = (user) =>
    jwt.sign(
        { id: user.id, email: user.email, fullName: user.full_name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { fullName, email, password } = req.body;
    try {
        const existing = get('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const userId = uuidv4();
        run('INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)',
            [userId, fullName, email, passwordHash]);

        // Seed initial health metrics
        run(`INSERT INTO health_metrics (id, user_id, heart_rate, sleep_hours, steps, mood, stress, hydration, health_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), userId, 72, 7.5, 8200, 7, 3, 70, 85]);

        const user = get('SELECT id, full_name, email FROM users WHERE id = ?', [userId]);
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            token,
            user: { id: user.id, fullName: user.full_name, email: user.email }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = generateToken(user);
        res.json({
            success: true,
            message: 'Logged in successfully!',
            token,
            user: { id: user.id, fullName: user.full_name, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
    const user = get('SELECT id, full_name, email FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: { id: user.id, fullName: user.full_name, email: user.email } });
});

module.exports = router;
