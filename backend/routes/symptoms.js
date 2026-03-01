const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');
const { analyzeSymptoms } = require('../services/aiEngine');

router.use(authMiddleware);

// ─── POST /api/symptoms/analyze ───────────────────────────────────────────────
router.post('/analyze', async (req, res) => {
    const { symptomsText } = req.body;
    if (!symptomsText || !symptomsText.trim()) {
        return res.status(400).json({ success: false, message: 'Please describe your symptoms.' });
    }

    try {
        // Gemini async call
        const result = await analyzeSymptoms(symptomsText.trim());
        const scanId = uuidv4();

        run(`INSERT INTO symptom_scans (id, user_id, symptoms_text, category, risk_level, confidence, recommendations, when_to_seek)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [scanId, req.user.id, symptomsText.trim(), result.category, result.riskLevel,
                result.confidence, JSON.stringify(result.recommendations), result.whenToSeek]);

        res.json({
            success: true,
            scan: {
                id: scanId,
                category: result.category,
                riskLevel: result.riskLevel,
                confidence: result.confidence,
                symptoms: result.symptoms,
                recommendations: result.recommendations,
                whenToSeek: result.whenToSeek,
                summary: result.summary || '',
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('Symptom analyze error:', err);
        res.status(500).json({ success: false, message: 'Failed to analyze symptoms. Please try again.' });
    }
});

// ─── GET /api/symptoms/history ────────────────────────────────────────────────
router.get('/history', (req, res) => {
    try {
        const scans = all(
            'SELECT id, category, risk_level, confidence, symptoms_text, recommendations, when_to_seek, created_at FROM symptom_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
            [req.user.id]
        );
        res.json({
            success: true,
            scans: scans.map(s => ({
                id: s.id, category: s.category, riskLevel: s.risk_level,
                confidence: s.confidence, symptomsText: s.symptoms_text,
                recommendations: (() => { try { return JSON.parse(s.recommendations || '[]'); } catch { return []; } })(),
                whenToSeek: s.when_to_seek, createdAt: s.created_at
            }))
        });
    } catch (err) {
        console.error('Symptoms history error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch symptom history.' });
    }
});

module.exports = router;
