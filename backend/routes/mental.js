const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { analyzeHealthQuery, analyzeJournal } = require('../services/aiEngine');

router.use(authMiddleware);

// POST /api/mental/mood
router.post('/mood', async (req, res) => {
    try {
        const { moodValue, moodLabel } = req.body;
        if (!moodValue) return res.status(400).json({ success: false, message: 'Mood value required.' });

        const moodId = uuidv4();
        run('INSERT INTO mood_logs (id, user_id, mood_value, mood_label) VALUES (?, ?, ?, ?)',
            [moodId, req.user.id, moodValue, moodLabel || '']);

        // Award XP
        const { awardXP } = require('./profile');
        awardXP(req.user.id, 15, 'mood_log');

        // Generate AI insight with Gemini
        const moodName = moodLabel || (moodValue >= 8 ? 'great' : moodValue >= 6 ? 'good' : moodValue >= 4 ? 'okay' : moodValue >= 2 ? 'low' : 'very low');
        const prompt = `User logged their mood as "${moodName}" (${moodValue}/10). Give a warm, 1-2 sentence supportive response with one practical suggestion. Be concise and empathetic.`;

        let insight = `You logged feeling ${moodName} today. Take a moment to acknowledge your emotions — they're valid. ${moodValue < 5 ? 'Try 5 minutes of box breathing to center yourself.' : 'Keep up the positive energy!'}`;
        try {
            const aiResp = await analyzeHealthQuery(prompt, []);
            // Handle both JSON and plain text response
            const content = aiResp.content;
            if (content) {
                const cleanContent = content.replace(/[\r\n]+/g, ' ').trim();
                if (cleanContent.length > 10) insight = cleanContent;
            }
        } catch (e) { /* use default */ }

        res.json({ success: true, moodId, insight });
    } catch (err) {
        console.error('Mood log error:', err);
        res.status(500).json({ success: false, message: 'Failed to log mood.' });
    }
});

// GET /api/mental/mood-history
router.get('/mood-history', (req, res) => {
    try {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const rows = all(`
      SELECT strftime('%w', logged_at) as dow, AVG(mood_value) as avg_mood, COUNT(*) as count
      FROM mood_logs WHERE user_id = ? AND logged_at >= datetime('now', '-7 days')
      GROUP BY strftime('%w', logged_at)`, [req.user.id]);

        const weekData = rows.map(r => ({
            day: days[parseInt(r.dow)],
            mood: Math.round(r.avg_mood || 0),
            count: r.count
        }));
        res.json({ success: true, weekData });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch mood history.' });
    }
});

// POST /api/mental/journal — AI-powered sentiment analysis
router.post('/journal', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content?.trim()) return res.status(400).json({ success: false, message: 'Journal entry cannot be empty.' });

        // Analyze journal with AI
        const analysis = await analyzeJournal(content.trim());

        // Save to journal_entries table
        const id = uuidv4();
        run('INSERT INTO journal_entries (id, user_id, content, sentiment, sentiment_score, ai_feedback) VALUES (?, ?, ?, ?, ?, ?)',
            [id, req.user.id, content.trim(), analysis.sentiment, analysis.sentimentScore, analysis.feedback]);

        // Award XP
        const { awardXP } = require('./profile');
        awardXP(req.user.id, 20, 'journal');

        res.json({
            success: true,
            entryId: id,
            sentiment: analysis.sentiment,
            sentimentScore: analysis.sentimentScore,
            feedback: analysis.feedback
        });
    } catch (err) {
        console.error('Journal error:', err);
        res.status(500).json({ success: false, message: 'Failed to save journal entry.' });
    }
});

// GET /api/mental/journal-history
router.get('/journal-history', (req, res) => {
    try {
        const entries = all(
            'SELECT id, content, sentiment, sentiment_score, ai_feedback, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.user.id]
        );
        res.json({ success: true, entries });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch journal history.' });
    }
});

module.exports = router;
