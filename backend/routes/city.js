const express = require('express');
const router = express.Router();
const { get } = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

const getCity = () => get('SELECT * FROM city_health WHERE city = ?', ['New Delhi']);

// ─── GET /api/city/health-index ───────────────────────────────────────────────
router.get('/health-index', (req, res) => {
    try {
        const city = getCity();
        if (!city) return res.status(404).json({ success: false, message: 'City data not found.' });
        res.json({ success: true, data: { city: city.city, healthIndex: city.health_index, trend: city.trend } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch health index.' });
    }
});

// ─── GET /api/city/trends ─────────────────────────────────────────────────────
router.get('/trends', (req, res) => {
    try {
        const city = getCity();
        if (!city) return res.status(404).json({ success: false, message: 'City data not found.' });
        res.json({ success: true, trends: JSON.parse(city.category_trends), chartData: JSON.parse(city.chart_data) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch trends.' });
    }
});

// ─── GET /api/city/zones ──────────────────────────────────────────────────────
router.get('/zones', (req, res) => {
    try {
        const city = getCity();
        if (!city) return res.status(404).json({ success: false, message: 'City data not found.' });
        res.json({ success: true, zones: JSON.parse(city.zone_data) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch zone data.' });
    }
});

// ─── GET /api/city/alerts ─────────────────────────────────────────────────────
router.get('/alerts', (req, res) => {
    try {
        const city = getCity();
        if (!city) return res.status(404).json({ success: false, message: 'City data not found.' });
        res.json({ success: true, alerts: JSON.parse(city.alerts) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
    }
});

module.exports = router;
