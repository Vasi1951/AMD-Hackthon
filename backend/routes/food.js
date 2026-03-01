const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { analyzeHealthQuery } = require('../services/aiEngine');

router.use(authMiddleware);

// POST /api/food/log
router.post('/log', async (req, res) => {
    try {
        const { mealType, description } = req.body;
        if (!description?.trim()) return res.status(400).json({ success: false, message: 'Please describe your meal.' });

        // Ask Gemini to analyze the meal
        const prompt = `Analyze this meal for health: "${description}" (meal type: ${mealType || 'snack'}).
Rate the nutritional quality (1-10), estimate calories, and give 2 tips. Reply JSON: {"rating":8,"healthScore":75,"calories":450,"protein_g":20,"carbs_g":55,"fat_g":12,"feedback":"brief feedback","tips":["tip1","tip2"]}`;

        let analysis = { rating: 7, healthScore: 65, calories: 400, protein_g: 15, carbs_g: 50, fat_g: 10, feedback: 'Moderate meal. Could include more vegetables.', tips: ['Add a side salad', 'Drink water with the meal'] };
        try {
            const aiResp = await analyzeHealthQuery(prompt, []);
            const jsonMatch = aiResp.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) analysis = { ...analysis, ...JSON.parse(jsonMatch[0]) };
        } catch (e) { /* use defaults */ }

        const foodId = uuidv4();
        run(`INSERT INTO food_logs (id, user_id, meal_type, description, ai_rating, ai_feedback, calories_estimate, protein_g, carbs_g, fat_g, health_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [foodId, req.user.id, mealType || 'meal', description.trim(),
                `${analysis.rating}/10`, analysis.feedback, analysis.calories,
                analysis.protein_g, analysis.carbs_g, analysis.fat_g, analysis.healthScore]);

        // Award XP
        const { awardXP } = require('./profile');
        awardXP(req.user.id, 20, 'food_log');

        res.json({
            success: true,
            log: { id: foodId, mealType, description, analysis, timestamp: new Date().toISOString() }
        });
    } catch (err) {
        console.error('Food log error:', err);
        res.status(500).json({ success: false, message: 'Failed to log meal.' });
    }
});

// GET /api/food/history
router.get('/history', (req, res) => {
    try {
        const logs = all('SELECT * FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 20', [req.user.id]);
        res.json({ success: true, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch food history.' });
    }
});

// GET /api/food/today-summary
router.get('/today-summary', (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const logs = all(`SELECT * FROM food_logs WHERE user_id = ? AND date(logged_at) = ?`, [req.user.id, today]);
        const totalCals = logs.reduce((s, l) => s + (l.calories_estimate || 0), 0);
        const avgScore = logs.length ? Math.round(logs.reduce((s, l) => s + (l.health_score || 0), 0) / logs.length) : 0;
        res.json({ success: true, totalCalories: totalCals, avgHealthScore: avgScore, mealCount: logs.length, logs });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch today summary.' });
    }
});

module.exports = router;
