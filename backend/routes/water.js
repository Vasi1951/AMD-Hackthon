const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const DAILY_GOAL_ML = 2500;

// POST /api/water/log
router.post('/log', (req, res) => {
    try {
        const { amountMl } = req.body;
        if (!amountMl || amountMl <= 0) return res.status(400).json({ success: false, message: 'Invalid water amount.' });

        run('INSERT INTO water_logs (id, user_id, amount_ml) VALUES (?, ?, ?)', [uuidv4(), req.user.id, amountMl]);

        // Award XP for hitting 2500ml
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = all(`SELECT amount_ml FROM water_logs WHERE user_id = ? AND date(logged_at) = ?`, [req.user.id, today]);
        const total = todayLogs.reduce((s, l) => s + l.amount_ml, 0);

        if (total >= DAILY_GOAL_ML && (total - amountMl) < DAILY_GOAL_ML) {
            const { awardXP } = require('./profile');
            awardXP(req.user.id, 50, 'water_goal');
        }

        res.json({ success: true, todayTotal: total, dailyGoal: DAILY_GOAL_ML, percentage: Math.min(100, Math.round((total / DAILY_GOAL_ML) * 100)) });
    } catch (err) {
        console.error('Water log error:', err);
        res.status(500).json({ success: false, message: 'Failed to log water.' });
    }
});

// GET /api/water/today
router.get('/today', (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const logs = all(`SELECT amount_ml, logged_at FROM water_logs WHERE user_id = ? AND date(logged_at) = ? ORDER BY logged_at ASC`, [req.user.id, today]);
        const total = logs.reduce((s, l) => s + l.amount_ml, 0);
        res.json({ success: true, todayTotal: total, dailyGoal: DAILY_GOAL_ML, percentage: Math.min(100, Math.round((total / DAILY_GOAL_ML) * 100)), logs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch water data.' });
    }
});

// GET /api/water/week
router.get('/week', (req, res) => {
    try {
        const rows = all(`
      SELECT date(logged_at) as day, SUM(amount_ml) as total
      FROM water_logs WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
      GROUP BY date(logged_at) ORDER BY day ASC`, [req.user.id]);
        res.json({ success: true, weekData: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch week data.' });
    }
});

module.exports = router;
