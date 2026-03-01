const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/profile
router.get('/', (req, res) => {
    try {
        const user = get('SELECT id, full_name, email, age, weight, height, blood_group, city, gender, onboarded, xp, level, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

        // Calculate BMI if height/weight available
        let bmi = null, bmiCategory = null;
        if (user.weight && user.height) {
            const hm = user.height / 100;
            bmi = parseFloat((user.weight / (hm * hm)).toFixed(1));
            if (bmi < 18.5) bmiCategory = 'Underweight';
            else if (bmi < 25) bmiCategory = 'Normal';
            else if (bmi < 30) bmiCategory = 'Overweight';
            else bmiCategory = 'Obese';
        }

        // Get badges
        const badges = all('SELECT badge_key, badge_name, description, earned_at FROM badges WHERE user_id = ? ORDER BY earned_at DESC', [req.user.id]);
        // Get streak
        const streak = get('SELECT current_streak, longest_streak, total_logs FROM streaks WHERE user_id = ?', [req.user.id]);

        res.json({
            success: true,
            profile: { ...user, bmi, bmiCategory },
            badges,
            streak: streak || { current_streak: 0, longest_streak: 0, total_logs: 0 }
        });
    } catch (err) {
        console.error('Profile GET error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    }
});

// PUT /api/profile
router.put('/', (req, res) => {
    try {
        const { fullName, age, weight, height, bloodGroup, city, gender } = req.body;

        // Build dynamic SET clause — only update fields that are provided
        const fields = [];
        const values = [];

        if (fullName !== undefined && fullName !== '') { fields.push('full_name = ?'); values.push(fullName); }
        if (age !== undefined && age !== '' && age !== null) { fields.push('age = ?'); values.push(Number(age)); }
        if (weight !== undefined && weight !== '' && weight !== null) { fields.push('weight = ?'); values.push(Number(weight)); }
        if (height !== undefined && height !== '' && height !== null) { fields.push('height = ?'); values.push(Number(height)); }
        if (bloodGroup !== undefined && bloodGroup !== '') { fields.push('blood_group = ?'); values.push(bloodGroup); }
        if (city !== undefined && city !== '') { fields.push('city = ?'); values.push(city); }
        if (gender !== undefined && gender !== '') { fields.push('gender = ?'); values.push(gender); }

        if (fields.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update.' });
        }

        fields.push("updated_at = datetime('now')");
        values.push(req.user.id);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        run(sql, values);

        // Fetch updated profile with BMI
        const updated = get('SELECT id, full_name, email, age, weight, height, blood_group, city, gender, onboarded, xp, level FROM users WHERE id = ?', [req.user.id]);

        let bmi = null, bmiCategory = null;
        if (updated && updated.weight && updated.height) {
            const hm = updated.height / 100;
            bmi = parseFloat((updated.weight / (hm * hm)).toFixed(1));
            if (bmi < 18.5) bmiCategory = 'Underweight';
            else if (bmi < 25) bmiCategory = 'Normal';
            else if (bmi < 30) bmiCategory = 'Overweight';
            else bmiCategory = 'Obese';
        }

        res.json({ success: true, profile: { ...updated, bmi, bmiCategory } });
    } catch (err) {
        console.error('Profile PUT error:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
});

// POST /api/profile/onboard - complete onboarding
router.post('/onboard', (req, res) => {
    try {
        const { age, weight, height, bloodGroup, city, gender } = req.body;
        run(`UPDATE users SET age = ?, weight = ?, height = ?, blood_group = ?, city = ?, gender = ?, onboarded = 1, updated_at = datetime('now') WHERE id = ?`,
            [age, weight, height, bloodGroup, city || 'New Delhi', gender, req.user.id]);
        awardXP(req.user.id, 100, 'onboarding');
        res.json({ success: true, message: 'Onboarding complete!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to save onboarding data.' });
    }
});

// Helper to award XP and check badges
function awardXP(userId, amount, action) {
    try {
        const user = get('SELECT xp, level FROM users WHERE id = ?', [userId]);
        if (!user) return;
        const newXP = (user.xp || 0) + amount;
        const newLevel = Math.floor(newXP / 500) + 1;
        run('UPDATE users SET xp = ?, level = ? WHERE id = ?', [newXP, newLevel, userId]);

        // Check badge milestones
        const allBadges = all('SELECT badge_key FROM badges WHERE user_id = ?', [userId]);
        const earned = allBadges.map(b => b.badge_key);
        const { v4: uuid } = require('uuid');

        const checkBadge = (key, name, desc, condition) => {
            if (condition && !earned.includes(key)) {
                run('INSERT INTO badges (id, user_id, badge_key, badge_name, description) VALUES (?, ?, ?, ?, ?)',
                    [uuid(), userId, key, name, desc]);
            }
        };

        checkBadge('first_step', '🌟 First Step', 'Completed your first action', true);
        checkBadge('xp_500', '⚡ Rising Star', 'Earned 500 XP', newXP >= 500);
        checkBadge('xp_1000', '🏆 Health Hero', 'Earned 1000 XP', newXP >= 1000);
        checkBadge('onboarded', '✅ Profile Complete', 'Completed onboarding', action === 'onboarding');
    } catch (e) {
        console.error('XP award error:', e.message);
    }
}

module.exports = { router, awardXP };
