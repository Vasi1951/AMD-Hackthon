const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, all, get } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { analyzeHealthQuery } = require('../services/aiEngine');

router.use(authMiddleware);

// ─── Build user context for AI ────────────────────────────────────────────────
function buildUserContext(userId) {
    try {
        const user = get('SELECT full_name, age, weight, height, blood_group, city, gender FROM users WHERE id = ?', [userId]);
        const recentMoods = all('SELECT mood_value, mood_label, logged_at FROM mood_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 5', [userId]);
        const recentSymptoms = all('SELECT symptoms_text, category, risk_level, created_at FROM symptom_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 3', [userId]);
        const waterToday = get("SELECT SUM(amount_ml) as total FROM water_logs WHERE user_id = ? AND date(logged_at) = date('now')", [userId]);
        const foodToday = all("SELECT meal_type, description, calories_estimate, health_score FROM food_logs WHERE user_id = ? AND date(logged_at) = date('now')", [userId]);

        // Calculate BMI if data available
        let bmi = null;
        if (user && user.weight && user.height) {
            bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
        }

        return {
            profile: user ? {
                name: user.full_name,
                age: user.age,
                gender: user.gender,
                city: user.city || 'New Delhi',
                bloodGroup: user.blood_group,
                bmi: bmi
            } : null,
            recentMoods: recentMoods.map(m => ({ mood: m.mood_label, value: m.mood_value })),
            recentSymptoms: recentSymptoms.map(s => ({ symptoms: s.symptoms_text, category: s.category, risk: s.risk_level })),
            todayWater: waterToday?.total || 0,
            todayMeals: foodToday.length,
            todayCalories: foodToday.reduce((sum, f) => sum + (f.calories_estimate || 0), 0)
        };
    } catch (err) {
        console.error('Error building user context:', err.message);
        return null;
    }
}

// ─── POST /api/chat/message ───────────────────────────────────────────────────
router.post('/message', async (req, res) => {
    const { message, mode } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    try {
        // Save user message first
        const userMsgId = uuidv4();
        run('INSERT INTO chat_messages (id, user_id, role, content) VALUES (?, ?, ?, ?)',
            [userMsgId, req.user.id, 'user', message.trim()]);

        // Get recent chat history for context
        const recentHistory = all(
            'SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
            [req.user.id]
        ).reverse();

        // Build user context for personalized AI
        const userContext = buildUserContext(req.user.id);

        // Add mental health context if in mental mode
        const fullMessage = mode === 'mental'
            ? `[Mental Wellbeing Context - please be extra gentle and empathetic] ${message}`
            : message;

        // Get AI response with user context
        const aiResponse = await analyzeHealthQuery(fullMessage, recentHistory.slice(0, -1), userContext);

        // Save AI response with emotional tone
        const aiMsgId = uuidv4();
        run(`INSERT INTO chat_messages (id, user_id, role, content, risk_level, confidence, sources, emotional_tone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [aiMsgId, req.user.id, 'assistant', aiResponse.content, aiResponse.riskLevel,
                aiResponse.confidence, JSON.stringify(aiResponse.sources), aiResponse.emotionalTone || 'neutral']);

        res.json({
            success: true,
            message: {
                id: aiMsgId,
                type: 'ai',
                content: aiResponse.content,
                riskLevel: aiResponse.riskLevel,
                confidence: aiResponse.confidence,
                sources: aiResponse.sources,
                emotionalTone: aiResponse.emotionalTone || 'neutral',
                dataUsed: aiResponse.dataUsed,
                explanation: aiResponse.explanation,
                suggestions: aiResponse.suggestions || []
            }
        });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ success: false, message: 'Failed to process message. Please try again.' });
    }
});

// ─── GET /api/chat/history ────────────────────────────────────────────────────
router.get('/history', (req, res) => {
    try {
        const messages = all(
            'SELECT id, role, content, risk_level, confidence, sources, emotional_tone, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 50',
            [req.user.id]
        );
        const formatted = messages.map((m, i) => ({
            id: m.id || i + 1,
            type: m.role === 'user' ? 'user' : 'ai',
            content: m.content,
            riskLevel: m.risk_level,
            confidence: m.confidence,
            emotionalTone: m.emotional_tone || 'neutral',
            sources: m.sources ? (() => { try { return JSON.parse(m.sources); } catch { return []; } })() : [],
        }));
        res.json({ success: true, messages: formatted });
    } catch (err) {
        console.error('Chat history error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch chat history.' });
    }
});

// ─── DELETE /api/chat/history ─────────────────────────────────────────────────
router.delete('/history', (req, res) => {
    try {
        run('DELETE FROM chat_messages WHERE user_id = ?', [req.user.id]);
        res.json({ success: true, message: 'Chat history cleared.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to clear history.' });
    }
});

module.exports = router;
