require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/ping', (_, res) => res.json({ status: 'ok', version: '2.0', ai: process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('replace') ? 'gemini' : 'fallback' }));

// ── Init DB then mount routes ─────────────────────────────────────────────────
initDatabase().then(() => {
    const authRoutes = require('./routes/auth');
    const healthRoutes = require('./routes/health');
    const { router: profileRouter } = require('./routes/profile');
    const chatRoutes = require('./routes/chat');
    const symptomsRoutes = require('./routes/symptoms');
    const mentalRoutes = require('./routes/mental');
    const cityRoutes = require('./routes/city');
    const foodRoutes = require('./routes/food');
    const waterRoutes = require('./routes/water');
    const tipRoutes = require('./routes/tip');

    app.use('/api/auth', authRoutes);
    app.use('/api/health', healthRoutes);
    app.use('/api/profile', profileRouter);
    app.use('/api/chat', chatRoutes);
    app.use('/api/symptoms', symptomsRoutes);
    app.use('/api/mental', mentalRoutes);
    app.use('/api/city', cityRoutes);
    app.use('/api/food', foodRoutes);
    app.use('/api/water', waterRoutes);
    app.use('/api/tip', tipRoutes);

    app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` }));
    app.use((err, req, res, _next) => {
        console.error('Server error:', err.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    });

    app.listen(PORT, () => {
        console.log(`🚀 SwasthAI Backend v2.0 running at http://localhost:${PORT}`);
        console.log(`🔍 Health check: http://localhost:${PORT}/api/ping`);
        console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('replace') ? '✅ Gemini' : '⚠️ Fallback (set GEMINI_API_KEY)'}`);
    });
}).catch(err => {
    console.error('❌ Database init failed:', err);
    process.exit(1);
});
