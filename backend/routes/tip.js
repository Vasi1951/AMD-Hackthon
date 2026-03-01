const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { analyzeHealthQuery } = require('../services/aiEngine');

router.use(authMiddleware);

// GET /api/tip/daily  - returns one AI health tip per day (cached in DB)
router.get('/daily', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        // Check if tip already generated today
        const existing = get('SELECT tip, category FROM daily_tips WHERE user_id = ? AND date = ?', [req.user.id, today]);
        if (existing) return res.json({ success: true, tip: existing.tip, category: existing.category, cached: true });

        const categories = ['Nutrition', 'Mental Health', 'Exercise', 'Sleep', 'Hydration', 'Preventive Care'];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const dayName = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

        const prompt = `Give me ONE concise, practical health tip for ${dayName} focused on ${category}. 
Make it specific, actionable, and relevant for Indian lifestyle. Max 2 sentences. Start with an emoji.`;

        let tip = `💧 Start your ${dayName} with 2 glasses of water before your morning tea — it kickstarts your metabolism and flushes toxins from overnight.`;
        try {
            const aiResp = await analyzeHealthQuery(prompt, []);
            tip = aiResp.content.trim().split('\n')[0]; // take first line only
        } catch (e) { /* use default */ }

        run('INSERT INTO daily_tips (id, user_id, tip, category, date) VALUES (?, ?, ?, ?, ?)',
            [uuidv4(), req.user.id, tip, category, today]);

        res.json({ success: true, tip, category, cached: false });
    } catch (err) {
        console.error('Tip error:', err);
        res.json({ success: true, tip: '🌿 Take 5 deep breaths right now — it activates your parasympathetic nervous system and instantly reduces stress.', category: 'Mental Health', cached: false });
    }
});

module.exports = router;
