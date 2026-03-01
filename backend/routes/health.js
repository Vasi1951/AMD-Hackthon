const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { generateDailySummary, generateAnalyticsInsights } = require('../services/aiEngine');

router.use(authMiddleware);

// ─── GET /api/health/metrics ──────────────────────────────────────────────────
router.get('/metrics', (req, res) => {
    try {
        const metrics = get(
            'SELECT * FROM health_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
            [req.user.id]
        );
        if (!metrics) {
            return res.json({ success: true, metrics: { heartRate: 72, sleepHours: 7.5, steps: 8200, mood: 7, stress: 3, hydration: 70, healthScore: 85 } });
        }
        res.json({
            success: true,
            metrics: {
                heartRate: metrics.heart_rate, sleepHours: metrics.sleep_hours,
                steps: metrics.steps, mood: metrics.mood, stress: metrics.stress,
                hydration: metrics.hydration, healthScore: metrics.health_score,
                recordedAt: metrics.recorded_at
            }
        });
    } catch (err) {
        console.error('Get metrics error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch metrics.' });
    }
});

// ─── POST /api/health/metrics ─────────────────────────────────────────────────
router.post('/metrics', (req, res) => {
    const { heartRate, sleepHours, steps, mood, stress, hydration } = req.body;
    try {
        const sleepScore = Math.min(((sleepHours || 7.5) / 9) * 100, 100);
        const moodScore = ((mood || 7) / 10) * 100;
        const stressScore = 100 - (((stress || 3) / 10) * 100);
        const healthScore = Math.round((sleepScore * 0.35) + (moodScore * 0.35) + (stressScore * 0.30));

        run(`INSERT INTO health_metrics (id, user_id, heart_rate, sleep_hours, steps, mood, stress, hydration, health_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), req.user.id, heartRate || 72, sleepHours || 7.5, steps || 0, mood || 7, stress || 3, hydration || 70, healthScore]);

        res.json({ success: true, message: 'Health metrics saved.', healthScore });
    } catch (err) {
        console.error('Save metrics error:', err);
        res.status(500).json({ success: false, message: 'Failed to save metrics.' });
    }
});

// ─── GET /api/health/timeline ─────────────────────────────────────────────────
router.get('/timeline', (req, res) => {
    try {
        const scans = all(
            `SELECT 'scan' as type, category as summary, risk_level, created_at as time
       FROM symptom_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 3`,
            [req.user.id]
        );
        const moods = all(
            `SELECT 'mood' as type, mood_label as summary, NULL as risk_level, logged_at as time
       FROM mood_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 3`,
            [req.user.id]
        );
        const chats = all(
            `SELECT 'chat' as type, SUBSTR(content, 1, 60) as summary, NULL as risk_level, created_at as time
       FROM chat_messages WHERE user_id = ? AND role = 'user' ORDER BY created_at DESC LIMIT 3`,
            [req.user.id]
        );
        const foods = all(
            `SELECT 'food' as type, description as summary, NULL as risk_level, logged_at as time
       FROM food_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 2`,
            [req.user.id]
        );
        const timeline = [...scans, ...moods, ...chats, ...foods]
            .sort((a, b) => new Date(b.time) - new Date(a.time))
            .slice(0, 8);
        res.json({ success: true, timeline });
    } catch (err) {
        console.error('Timeline error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch timeline.' });
    }
});

// ─── GET /api/health/weekly-trends ────────────────────────────────────────────
router.get('/weekly-trends', (req, res) => {
    try {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        // Get mood data by day
        const moodRows = all(`
            SELECT strftime('%w', logged_at) as dow, AVG(mood_value) as avg_mood
            FROM mood_logs WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
            GROUP BY strftime('%w', logged_at)`, [req.user.id]);

        // Get water data by day
        const waterRows = all(`
            SELECT strftime('%w', logged_at) as dow, SUM(amount_ml) as total_water
            FROM water_logs WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
            GROUP BY strftime('%w', logged_at)`, [req.user.id]);

        // Get sleep data from health metrics
        const sleepRows = all(`
            SELECT strftime('%w', recorded_at) as dow, AVG(sleep_hours) as avg_sleep
            FROM health_metrics WHERE user_id = ? AND recorded_at >= datetime('now', '-7 days')
            GROUP BY strftime('%w', recorded_at)`, [req.user.id]);

        // Build combined weekly data
        const moodMap = {};
        moodRows.forEach(r => { moodMap[r.dow] = Math.round(r.avg_mood * 10) / 10; });
        const waterMap = {};
        waterRows.forEach(r => { waterMap[r.dow] = r.total_water; });
        const sleepMap = {};
        sleepRows.forEach(r => { sleepMap[r.dow] = Math.round(r.avg_sleep * 10) / 10; });

        // Generate data for all 7 days
        const today = new Date().getDay();
        const weekData = [];
        for (let i = 6; i >= 0; i--) {
            const dow = (today - i + 7) % 7;
            weekData.push({
                day: days[dow],
                mood: moodMap[dow.toString()] || null,
                water: waterMap[dow.toString()] || 0,
                sleep: sleepMap[dow.toString()] || null
            });
        }

        res.json({ success: true, weekData });
    } catch (err) {
        console.error('Weekly trends error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch weekly trends.' });
    }
});

// ─── GET /api/health/daily-summary ────────────────────────────────────────────
router.get('/daily-summary', async (req, res) => {
    try {
        const waterToday = get("SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date(logged_at) = date('now')", [req.user.id]);
        const mealsToday = all("SELECT meal_type, calories_estimate, health_score FROM food_logs WHERE user_id = ? AND date(logged_at) = date('now')", [req.user.id]);
        const moodToday = get("SELECT mood_value, mood_label FROM mood_logs WHERE user_id = ? AND date(logged_at) = date('now') ORDER BY logged_at DESC LIMIT 1", [req.user.id]);
        const latestMetrics = get("SELECT * FROM health_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1", [req.user.id]);

        const userData = {
            waterMl: waterToday?.total || 0,
            meals: mealsToday.length,
            totalCalories: mealsToday.reduce((s, m) => s + (m.calories_estimate || 0), 0),
            avgMealScore: mealsToday.length ? Math.round(mealsToday.reduce((s, m) => s + (m.health_score || 0), 0) / mealsToday.length) : null,
            mood: moodToday?.mood_label || null,
            moodValue: moodToday?.mood_value || null,
            sleepHours: latestMetrics?.sleep_hours || null,
            steps: latestMetrics?.steps || null
        };

        const summary = await generateDailySummary(userData);
        res.json({ success: true, ...summary, userData });
    } catch (err) {
        console.error('Daily summary error:', err);
        res.status(500).json({ success: false, message: 'Failed to generate daily summary.' });
    }
});

// ─── GET /api/health/analytics ────────────────────────────────────────────────
router.get('/analytics', async (req, res) => {
    try {
        // Calorie breakdown from food logs (last 7 days)
        const nutritionData = get(`
            SELECT SUM(protein_g) as totalProtein, SUM(carbs_g) as totalCarbs, SUM(fat_g) as totalFat,
                   SUM(calories_estimate) as totalCalories, COUNT(*) as mealCount,
                   AVG(health_score) as avgHealthScore
            FROM food_logs WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')`, [req.user.id]);

        // Mood distribution
        const moodDist = all(`
            SELECT mood_label, COUNT(*) as count
            FROM mood_logs WHERE user_id = ? AND logged_at >= datetime('now', '-30 days')
            GROUP BY mood_label ORDER BY count DESC`, [req.user.id]);

        // Daily water for last 7 days
        const waterHistory = all(`
            SELECT date(logged_at) as day, SUM(amount_ml) as total
            FROM water_logs WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
            GROUP BY date(logged_at) ORDER BY day`, [req.user.id]);

        // Health score history
        const healthScores = all(`
            SELECT health_score, date(recorded_at) as day
            FROM health_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 14`, [req.user.id]);

        // Symptom scan history
        const symptomHistory = all(`
            SELECT category, COUNT(*) as count
            FROM symptom_scans WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
            GROUP BY category ORDER BY count DESC`, [req.user.id]);

        // Generate AI insights
        const weeklyData = {
            nutrition: nutritionData || {},
            moodDistribution: moodDist,
            waterHistory,
            healthScores,
            symptomHistory
        };
        const aiInsights = await generateAnalyticsInsights(weeklyData);

        res.json({
            success: true,
            nutrition: {
                totalProtein: Math.round(nutritionData?.totalProtein || 0),
                totalCarbs: Math.round(nutritionData?.totalCarbs || 0),
                totalFat: Math.round(nutritionData?.totalFat || 0),
                totalCalories: nutritionData?.totalCalories || 0,
                mealCount: nutritionData?.mealCount || 0,
                avgHealthScore: Math.round(nutritionData?.avgHealthScore || 0)
            },
            moodDistribution: moodDist,
            waterHistory,
            healthScores: healthScores.reverse(),
            symptomHistory,
            insights: aiInsights.insights || []
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
    }
});

module.exports = router;
