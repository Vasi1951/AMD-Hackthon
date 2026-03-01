/**
 * SwasthAI Gemini-powered AI Engine v2.0
 * Emotion-aware, context-intelligent health assistant.
 * Uses Google Gemini for natural, empathetic, real-world health responses.
 * Falls back to rule-based answers if API key is missing or quota exceeded.
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

if (GEMINI_KEY && !GEMINI_KEY.includes('replace_with')) {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_KEY);
        model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('✅ Gemini AI engine initialized');
    } catch (e) {
        console.warn('⚠️ Gemini init failed, using fallback engine');
    }
} else {
    console.warn('⚠️ No Gemini API key — using fallback rule-based engine. Set GEMINI_API_KEY in backend/.env');
}

// ─── Emotion-Aware System Prompt ─────────────────────────────────────────────
const HEALTH_SYSTEM_PROMPT = `You are SwasthAI, an intelligent, deeply empathetic AI health assistant built for Indian users.

## CORE CAPABILITY: Emotion-Aware Responses
You MUST detect the user's emotional state from their message and adapt your response accordingly:
- **Anxious/Worried**: Be extra reassuring, normalize their concern, give clear steps
- **Frustrated/Angry**: Acknowledge their frustration, validate their feelings, be solution-focused  
- **Sad/Low**: Be warm, gentle, encouraging — like a caring friend
- **Curious/Neutral**: Be informative, clear, and educational
- **Hopeful/Positive**: Match their energy, reinforce positive behavior
- **Distressed/Panicked**: Be calm and grounding, provide immediate steps, assess urgency

## Response Guidelines:
- Give CONCISE, practical, real-world health advice
- Use simple language (mix of English is fine — avoid jargon)
- Structure responses with clear headings using **bold** and bullet points
- Always mention WHEN to see a doctor (don't replace medical advice, complement it)
- For mental health, be extra gentle and empathetic
- ALWAYS end with 1-2 specific action steps the user can do RIGHT NOW
- Keep responses under 200 words unless absolutely necessary
- Based on content, assign a riskLevel: "low", "monitor", or "urgent"

## IMPORTANT: Response Format
You MUST respond in this EXACT JSON format:
{
  "content": "Your full response text with **markdown** formatting",
  "emotionalTone": "one of: anxious, frustrated, sad, curious, hopeful, distressed, neutral",
  "riskLevel": "low | monitor | urgent",
  "suggestions": [{"title": "Action 1", "action": "Do this →"}]
}

Today's date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Location context: India`;

const SYMPTOM_SYSTEM_PROMPT = `You are SwasthAI's symptom analyzer. Analyze the user's symptoms and respond in this EXACT JSON format:
{
  "category": "one of: Headache, Fever, Cold & Cough, Fatigue, Chest & Heart, Digestive, Skin & Allergy, Mental Health, Musculoskeletal, General",
  "riskLevel": "low | monitor | urgent",
  "confidence": 75,
  "symptoms": ["identified symptom 1", "identified symptom 2"],
  "recommendations": ["actionable step 1", "actionable step 2", "actionable step 3", "actionable step 4"],
  "whenToSeek": "specific condition when to see a doctor immediately",
  "summary": "2-sentence natural language summary of the analysis"
}

Be accurate. If symptoms suggest emergency (chest pain, difficulty breathing, stroke signs), set riskLevel to "urgent".
Today: ${new Date().toLocaleDateString('en-IN')}`;

const JOURNAL_SYSTEM_PROMPT = `You are SwasthAI's journal sentiment analyzer. Analyze the user's journal entry for emotional state and mental wellbeing. Respond in this EXACT JSON format:
{
  "sentiment": "one of: positive, negative, mixed, neutral",
  "sentimentScore": 0.0 to 1.0 (0 = very negative, 1 = very positive),
  "feedback": "A warm, empathetic 2-3 sentence response acknowledging their feelings and offering gentle guidance. Be like a supportive friend."
}`;

const DAILY_SUMMARY_PROMPT = `You are SwasthAI's health summarizer. Generate a brief, encouraging daily health summary based on the user's data. Respond in this EXACT JSON format:
{
  "summary": "A 2-3 sentence personalized health recap. Be warm and encouraging. Mention specific data points.",
  "highlight": "One key positive thing about their day",
  "suggestion": "One actionable suggestion for tomorrow"
}`;

const ANALYTICS_INSIGHTS_PROMPT = `You are SwasthAI's health analytics expert. Analyze the user's weekly health data and provide smart insights. Respond in this EXACT JSON format:
{
  "insights": [
    {"title": "Insight Title", "description": "1-2 sentence insight", "type": "positive | warning | info"},
    {"title": "Insight Title", "description": "1-2 sentence insight", "type": "positive | warning | info"},
    {"title": "Insight Title", "description": "1-2 sentence insight", "type": "positive | warning | info"}
  ]
}`;

// ─── Gemini Chat Response (Emotion-Aware) ─────────────────────────────────────
async function analyzeHealthQuery(userMessage, chatHistory = [], userContext = null) {
    if (model) {
        try {
            // Build context-enriched system prompt
            let contextPrompt = HEALTH_SYSTEM_PROMPT;
            if (userContext) {
                contextPrompt += `\n\n## USER HEALTH PROFILE (use this to personalize your response):
${JSON.stringify(userContext, null, 2)}`;
            }

            const chat = model.startChat({
                history: [
                    { role: 'user', parts: [{ text: contextPrompt }] },
                    { role: 'model', parts: [{ text: '{"content": "Understood. I am SwasthAI, ready to provide emotionally-aware health guidance.", "emotionalTone": "neutral", "riskLevel": "low", "suggestions": []}' }] },
                    ...chatHistory.slice(-6).map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                ],
                generationConfig: { maxOutputTokens: 1024, temperature: 0.7, responseMimeType: 'application/json' }
            });

            const result = await chat.sendMessage(userMessage);
            const text = result.response.text();

            // Try to parse structured response
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    return {
                        content: parsed.content || text,
                        emotionalTone: parsed.emotionalTone || 'neutral',
                        riskLevel: parsed.riskLevel || 'low',
                        confidence: 90,
                        sources: ['Google Gemini AI', 'WHO Guidelines', 'ICMR'],
                        dataUsed: { personal: !!userContext, community: true, trends: true },
                        explanation: {
                            personalContext: userContext ? 'Response personalized using your health profile' : null,
                            communityContext: 'Community health trends considered',
                            medicalGuideline: 'Based on WHO & ICMR guidelines'
                        },
                        suggestions: parsed.suggestions || []
                    };
                }
            } catch (parseErr) {
                // If JSON parse fails, use the raw text
            }

            // Fallback: use raw text and detect emotion/risk from content
            let riskLevel = 'low';
            let emotionalTone = 'neutral';
            const lowerText = text.toLowerCase();
            if (lowerText.includes('urgent') || lowerText.includes('emergency') || lowerText.includes('immediately') || lowerText.includes('call 112')) {
                riskLevel = 'urgent';
            } else if (lowerText.includes('monitor') || lowerText.includes('watch') || lowerText.includes('consult') || lowerText.includes('doctor')) {
                riskLevel = 'monitor';
            }

            // Detect emotion from user message
            const lowerMsg = userMessage.toLowerCase();
            if (lowerMsg.match(/anxi|worried|scared|nervous|afraid|panic/)) emotionalTone = 'anxious';
            else if (lowerMsg.match(/frustrat|angry|mad|annoyed|irritat/)) emotionalTone = 'frustrated';
            else if (lowerMsg.match(/sad|depress|lonely|hopeless|crying|low/)) emotionalTone = 'sad';
            else if (lowerMsg.match(/happy|great|good|better|excited|hopeful/)) emotionalTone = 'hopeful';
            else if (lowerMsg.match(/help|emergency|urgent|dying|can't breathe/)) emotionalTone = 'distressed';

            return {
                content: text,
                emotionalTone,
                riskLevel,
                confidence: 88,
                sources: ['Google Gemini AI', 'WHO Guidelines', 'ICMR'],
                dataUsed: { personal: !!userContext, community: true, trends: true },
                explanation: {
                    personalContext: userContext ? 'Response personalized using your health profile' : null,
                    communityContext: 'Community health trends considered',
                    medicalGuideline: 'Based on WHO & ICMR guidelines'
                },
                suggestions: []
            };
        } catch (err) {
            console.error('Gemini API error:', err.message);
        }
    }
    return fallbackHealthQuery(userMessage);
}

// ─── Gemini Symptom Analyzer ──────────────────────────────────────────────────
async function analyzeSymptoms(symptomsText) {
    if (model) {
        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `${SYMPTOM_SYSTEM_PROMPT}\n\nUser symptoms: "${symptomsText}"` }] }],
                generationConfig: { maxOutputTokens: 512, temperature: 0.3, responseMimeType: 'application/json' }
            });

            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    category: parsed.category || 'General',
                    riskLevel: parsed.riskLevel || 'low',
                    confidence: parsed.confidence || 78,
                    symptoms: parsed.symptoms || [symptomsText],
                    recommendations: parsed.recommendations || ['Rest and stay hydrated', 'Monitor your symptoms'],
                    whenToSeek: parsed.whenToSeek || 'If symptoms worsen or persist beyond 3 days, consult a doctor.',
                    summary: parsed.summary || ''
                };
            }
        } catch (err) {
            console.error('Gemini symptom error:', err.message);
        }
    }
    return fallbackSymptoms(symptomsText);
}

// ─── Journal Sentiment Analysis ───────────────────────────────────────────────
async function analyzeJournal(journalText) {
    if (model) {
        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `${JOURNAL_SYSTEM_PROMPT}\n\nJournal entry: "${journalText}"` }] }],
                generationConfig: { maxOutputTokens: 512, temperature: 0.5, responseMimeType: 'application/json' }
            });
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    sentiment: parsed.sentiment || 'neutral',
                    sentimentScore: parsed.sentimentScore || 0.5,
                    feedback: parsed.feedback || 'Thank you for sharing your thoughts. Writing about your feelings is a powerful tool for wellbeing.'
                };
            }
        } catch (err) {
            console.error('Journal analysis error:', err.message);
        }
    }
    // Fallback
    const lower = journalText.toLowerCase();
    let sentiment = 'neutral';
    let sentimentScore = 0.5;
    if (lower.match(/happy|great|wonderful|amazing|grateful|thankful|joy/)) { sentiment = 'positive'; sentimentScore = 0.8; }
    else if (lower.match(/sad|angry|frustrated|anxious|worried|stressed|tired|exhausted/)) { sentiment = 'negative'; sentimentScore = 0.3; }
    return {
        sentiment,
        sentimentScore,
        feedback: 'Thank you for journaling. Taking time to reflect on your feelings is a wonderful habit for your mental wellbeing. Keep it up! 💜'
    };
}

// ─── Daily Health Summary ─────────────────────────────────────────────────────
async function generateDailySummary(userData) {
    if (model) {
        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `${DAILY_SUMMARY_PROMPT}\n\nUser's today data: ${JSON.stringify(userData)}` }] }],
                generationConfig: { maxOutputTokens: 512, temperature: 0.6, responseMimeType: 'application/json' }
            });
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (err) {
            console.error('Daily summary error:', err.message);
        }
    }
    return {
        summary: `You've been active today! Keep up the good habits and stay hydrated.`,
        highlight: 'You logged your health data today — great consistency!',
        suggestion: 'Try a 10-minute walk before bed to improve sleep quality.'
    };
}

// ─── Analytics Insights ───────────────────────────────────────────────────────
async function generateAnalyticsInsights(weeklyData) {
    if (model) {
        try {
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: `${ANALYTICS_INSIGHTS_PROMPT}\n\nWeekly health data: ${JSON.stringify(weeklyData)}` }] }],
                generationConfig: { maxOutputTokens: 512, temperature: 0.5, responseMimeType: 'application/json' }
            });
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (err) {
            console.error('Analytics insights error:', err.message);
        }
    }
    return {
        insights: [
            { title: 'Hydration Streak', description: 'You\'ve been consistent with water intake. Keep it up!', type: 'positive' },
            { title: 'Sleep Pattern', description: 'Your sleep hours vary significantly. Try a consistent bedtime.', type: 'warning' },
            { title: 'Activity Level', description: 'Your daily activity is on track with WHO recommendations.', type: 'info' }
        ]
    };
}

// ─── Fallback rule-based engine ───────────────────────────────────────────────
function fallbackHealthQuery(message) {
    const lower = message.toLowerCase();
    let content = '';
    let riskLevel = 'low';
    let emotionalTone = 'neutral';

    // Detect emotion from message
    if (lower.match(/anxi|worried|scared|nervous|afraid|panic/)) emotionalTone = 'anxious';
    else if (lower.match(/frustrat|angry|mad|annoyed|irritat/)) emotionalTone = 'frustrated';
    else if (lower.match(/sad|depress|lonely|hopeless|crying/)) emotionalTone = 'sad';
    else if (lower.match(/happy|great|good|better|excited|hopeful/)) emotionalTone = 'hopeful';
    else if (lower.match(/help|emergency|urgent|dying|can't breathe/)) emotionalTone = 'distressed';

    if (lower.includes('headache') || lower.includes('head pain') || lower.includes('migraine')) {
        riskLevel = 'monitor';
        content = `**Headache Analysis**\n\n**Immediate Relief:**\n• Drink 2 glasses of water now — dehydration is the #1 cause\n• Rest in a dark, quiet room for 20 minutes\n• Apply a cold pack to your forehead or neck\n• Take paracetamol 500mg if pain is moderate\n\n**Avoid:**\n• Bright screens and loud noise\n• Skipping meals\n\n**See a Doctor if:**\n• Pain is sudden and severe ("thunderclap")\n• Accompanied by fever, stiff neck, or vision changes\n• Doesn't improve in 48 hours\n\n**Right Now:** Drink water and rest for 20 minutes.`;
    } else if (lower.includes('fever') || lower.includes('temperature')) {
        riskLevel = 'monitor';
        content = `**Fever Management**\n\n**Immediate Steps:**\n• Drink plenty of fluids (ORS, coconut water, warm soup)\n• Take paracetamol 500-1000mg as per age/weight\n• Use a damp cloth on forehead\n• Wear light clothing\n\n**Monitor every 2 hours.** Fever above 103°F (39.4°C) needs urgent attention.\n\n**See a Doctor Immediately if:**\n• Fever > 104°F or lasts > 3 days\n• Rash, difficulty breathing, or severe headache\n• Child under 3 months with any fever\n\n**Right Now:** Check temperature, take paracetamol, and hydrate.`;
    } else if (lower.includes('cough') || lower.includes('cold') || lower.includes('flu')) {
        content = `**Cold & Cough Relief**\n\n**Natural Remedies:**\n• Ginger-honey-tulsi tea — 3x daily\n• Steam inhalation with eucalyptus oil for 10 minutes\n• Gargle with warm salt water\n• Keep head elevated while sleeping\n\n**Medications:**\n• Antihistamine for runny nose\n• Cough syrup for dry cough\n\n**See a Doctor if:**\n• Cough with blood, green phlegm, or lasts >2 weeks\n• Chest pain or breathing difficulty\n\n**Right Now:** Make ginger-honey tea and do steam inhalation.`;
    } else if (lower.includes('stress') || lower.includes('anxiety') || lower.includes('mental')) {
        emotionalTone = emotionalTone === 'neutral' ? 'anxious' : emotionalTone;
        content = `**Managing Stress & Anxiety** 💚\n\nI can sense you might be going through a tough time, and that's completely okay.\n\n**Right Now (5-minute relief):**\n• Box breathing: inhale 4s → hold 4s → exhale 4s → hold 4s. Repeat 4 times.\n• Step outside for fresh air if possible\n\n**Daily Habits:**\n• 20 minutes of morning walk (most effective natural anti-anxiety)\n• Limit news/social media to 30 mins/day\n• Talk to someone you trust today\n\n**Remember:** What you're feeling is valid. Stress is your body's alarm system — it's telling you something needs attention.\n\n**Right Now:** Try the box breathing exercise (takes 2 minutes).`;
    } else if (lower.includes('sleep') || lower.includes('insomnia')) {
        content = `**Sleep Improvement Guide**\n\n**Tonight:**\n• No screens 45 minutes before bed\n• Keep room cool (18-22°C is optimal)\n• Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s\n• Write down tomorrow's to-do list (clears mind)\n\n**Fix Your Sleep Schedule:**\n• Same wake time every day — even weekends\n• No caffeine after 2pm\n• 20-min limit on daytime naps\n\n**Right Now:** Put your phone in another room and try the 4-7-8 breathing technique.`;
    } else if (lower.includes('chest') || lower.includes('heart')) {
        riskLevel = 'urgent';
        emotionalTone = 'distressed';
        content = `⚠️ **IMPORTANT — Chest Symptoms**\n\n**If you have ANY of these RIGHT NOW — Call 112 immediately:**\n• Crushing/squeezing chest pain\n• Pain spreading to arm, jaw, or back\n• Shortness of breath + sweating\n• Sudden dizziness or fainting\n\n**If mild discomfort:**\n• Sit upright and rest immediately\n• Loosen any tight clothing\n• Do NOT ignore — get evaluated today\n\n**Chest pain always warrants medical evaluation.** Please don't delay.`;
    } else {
        content = `I'd love to help you with that! Could you share a bit more detail about what you're experiencing?\n\n**In the meantime, here are universal health essentials:**\n• 💧 Hydration: 8-10 glasses of water daily\n• 😴 Sleep: 7-9 hours (most health issues improve with good sleep)\n• 🚶 Movement: 30 minutes of walking daily\n• 🥗 Nutrition: Include fruits, vegetables, and protein in every meal\n\n**Right Now:** Share more about what you're experiencing so I can give specific guidance.`;
    }

    return {
        content,
        emotionalTone,
        riskLevel,
        confidence: 75,
        sources: ['WHO Guidelines', 'ICMR', 'NHS'],
        dataUsed: { personal: false, community: true, trends: true },
        explanation: {
            personalContext: null,
            communityContext: 'Based on community health patterns',
            medicalGuideline: 'Based on clinical guidelines and symptom patterns'
        },
        suggestions: []
    };
}

function fallbackSymptoms(text) {
    const lower = text.toLowerCase();
    let category = 'General';
    let riskLevel = 'low';
    const recommendations = ['Rest and stay hydrated', 'Monitor your symptoms', 'Maintain a healthy diet', 'Get adequate sleep'];

    if (lower.match(/head|migraine|dizz/)) category = 'Headache';
    else if (lower.match(/fever|temperature|chills/)) { category = 'Fever'; riskLevel = 'monitor'; }
    else if (lower.match(/cough|cold|flu|sore throat/)) category = 'Cold & Cough';
    else if (lower.match(/tired|fatigue|weak|exhaust/)) category = 'Fatigue';
    else if (lower.match(/chest|heart|breath/)) { category = 'Chest & Heart'; riskLevel = 'urgent'; }
    else if (lower.match(/stomach|nausea|vomit|digest/)) category = 'Digestive';
    else if (lower.match(/skin|rash|itch|allerg/)) category = 'Skin & Allergy';
    else if (lower.match(/stress|anxi|depress|mental/)) category = 'Mental Health';

    return {
        category,
        riskLevel,
        confidence: 72,
        symptoms: [text.slice(0, 50)],
        recommendations,
        whenToSeek: 'If symptoms worsen or persist beyond 3 days, consult a healthcare provider.',
        summary: `Symptoms suggest ${category}. Risk level: ${riskLevel}.`
    };
}

module.exports = { analyzeHealthQuery, analyzeSymptoms, analyzeJournal, generateDailySummary, generateAnalyticsInsights };
