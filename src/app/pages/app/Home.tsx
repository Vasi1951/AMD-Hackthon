import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Droplets, Flame, Zap, Phone, TrendingUp, Sparkles, Scale } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../../lib/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';

const WATER_STEPS = [150, 250, 500]; // ml options

export default function Home() {
  const { user } = useAuth();
  const { success } = useToast();

  const [healthScore, setHealthScore] = useState(78);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterGoal] = useState(2500);
  const [waterPct, setWaterPct] = useState(0);
  const [dailyTip, setDailyTip] = useState<{ tip: string; category: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [showSOS, setShowSOS] = useState(false);
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
  const [dailySummary, setDailySummary] = useState<any>(null);
  const [bmi, setBmi] = useState<{ value: number; category: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [metricsRes, timelineRes, waterRes, tipRes, profileRes, trendsRes, summaryRes] = await Promise.allSettled([
        api.get<any>('/health/metrics'),
        api.get<any>('/health/timeline'),
        api.get<any>('/water/today'),
        api.get<any>('/tip/daily'),
        api.get<any>('/profile'),
        api.get<any>('/health/weekly-trends'),
        api.get<any>('/health/daily-summary'),
      ]);

      if (metricsRes.status === 'fulfilled' && metricsRes.value.success) {
        const m = metricsRes.value.metrics;
        setMetrics(m);
        if (m?.health_score) setHealthScore(m.health_score);
      }
      if (timelineRes.status === 'fulfilled' && timelineRes.value.success) {
        setTimeline(timelineRes.value.timeline?.slice(0, 6) || []);
      }
      if (waterRes.status === 'fulfilled' && waterRes.value.success) {
        setWaterTotal(waterRes.value.todayTotal || 0);
        setWaterPct(waterRes.value.percentage || 0);
      }
      if (tipRes.status === 'fulfilled' && tipRes.value.success) {
        setDailyTip({ tip: tipRes.value.tip, category: tipRes.value.category });
      }
      if (profileRes.status === 'fulfilled' && profileRes.value.success) {
        setXp(profileRes.value.profile?.xp || 0);
        setStreak(profileRes.value.streak?.current_streak || 0);
        const p = profileRes.value.profile;
        if (p?.bmi) setBmi({ value: p.bmi, category: p.bmiCategory || 'Normal' });
      }
      if (trendsRes.status === 'fulfilled' && trendsRes.value.success) {
        setWeeklyTrends(trendsRes.value.weekData || []);
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value.success) {
        setDailySummary(summaryRes.value);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const logWater = async (ml: number) => {
    try {
      const data = await api.post<any>('/water/log', { amountMl: ml });
      if (data.success) {
        setWaterTotal(data.todayTotal);
        setWaterPct(data.percentage);
        if (data.percentage >= 100) success('💧 Daily water goal reached! +50 XP');
        else success(`💧 +${ml}ml logged`);
      }
    } catch { /* silent */ }
  };

  const name = user?.fullName?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const orbColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444';

  const tooltipStyle = {
    backgroundColor: 'rgba(19, 27, 46, 0.95)',
    border: '1px solid rgba(0, 229, 196, 0.3)',
    borderRadius: '12px',
    color: '#F8FAFC',
    fontSize: '12px',
  };

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-b from-midnight via-midnight to-midnight relative overflow-hidden">
      {/* Ambient BG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 right-10 w-48 h-48 rounded-full blur-3xl" style={{ background: orbColor + '30' }} />
      </div>

      <div className="relative z-10 px-4 pt-8 max-w-5xl mx-auto space-y-5">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-text-secondary text-sm">{greeting} ☀️</p>
            <h1 className="text-2xl font-bold text-white">{name} 👋</h1>
          </motion.div>
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30">
                <Flame className="text-orange-400" size={14} />
                <span className="text-orange-400 text-xs font-bold">{streak}d</span>
              </motion.div>
            )}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30">
              <Zap className="text-purple-400" size={14} />
              <span className="text-purple-400 text-xs font-bold">{xp} XP</span>
            </div>
            {/* SOS Button */}
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => setShowSOS(true)}
              className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <Phone className="text-rose-400" size={15} />
            </motion.button>
          </div>
        </div>

        {/* AI Daily Summary */}
        {dailySummary && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <GlassCard className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-400 text-xs font-semibold uppercase tracking-wider">AI Daily Summary</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed mb-2">{dailySummary.summary}</p>
                  <div className="flex flex-wrap gap-3">
                    {dailySummary.highlight && (
                      <span className="text-xs text-emerald bg-emerald/10 px-2.5 py-1 rounded-full border border-emerald/30">
                        ✨ {dailySummary.highlight}
                      </span>
                    )}
                    {dailySummary.suggestion && (
                      <span className="text-xs text-amber bg-amber/10 px-2.5 py-1 rounded-full border border-amber/30">
                        💡 {dailySummary.suggestion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Daily Health Tip */}
        {dailyTip && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">💡</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Today's Tip · {dailyTip.category}</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed">{dailyTip.tip}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Health Orb + Score + BMI */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
          <GlassCard className="text-center">
            <div className="flex items-center justify-center gap-6">
              <div className="relative">
                <motion.div
                  animate={{ boxShadow: [`0 0 20px ${orbColor}40`, `0 0 40px ${orbColor}60`, `0 0 20px ${orbColor}40`] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{ background: `radial-gradient(circle at 40% 35%, ${orbColor}90, ${orbColor}40)` }}
                >
                  <div>
                    <p className="text-3xl font-black text-white">{healthScore}</p>
                    <p className="text-xs text-white/70">health score</p>
                  </div>
                </motion.div>
              </div>
              <div className="text-left space-y-2">
                {metrics ? ([
                  { label: '❤️ Heart Rate', val: metrics.heart_rate ? `${metrics.heart_rate} bpm` : '-- bpm' },
                  { label: '😴 Sleep', val: metrics.sleep_hours ? `${metrics.sleep_hours}h` : '--h' },
                  { label: '👣 Steps', val: metrics.steps ? metrics.steps.toLocaleString() : '--' },
                ]).map(m => (
                  <div key={m.label}>
                    <p className="text-text-secondary text-xs">{m.label}</p>
                    <p className="text-white font-semibold text-sm">{m.val}</p>
                  </div>
                )) : (
                  <p className="text-text-secondary text-xs">Log your metrics to see stats</p>
                )}
              </div>
              {/* BMI Badge */}
              {bmi && (
                <div className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex flex-col items-center justify-center">
                    <Scale className="text-emerald mb-0.5" size={14} />
                    <p className="text-lg font-bold text-white">{bmi.value}</p>
                    <p className="text-[9px] text-text-secondary">BMI</p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Water Tracker + Weekly Trends side by side on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Water Tracker */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GlassCard className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30 h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="text-blue-400" size={18} />
                  <h3 className="font-semibold text-sm text-white">Hydration Tracker</h3>
                </div>
                <span className="text-blue-400 text-sm font-bold">{waterTotal}ml / {waterGoal}ml</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: 0 }} animate={{ width: `${Math.min(waterPct, 100)}%` }} transition={{ duration: 0.8 }} />
              </div>
              <div className="flex gap-2">
                {WATER_STEPS.map(ml => (
                  <motion.button key={ml} whileTap={{ scale: 0.95 }}
                    onClick={() => logWater(ml)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-colors">
                    +{ml}ml
                  </motion.button>
                ))}
              </div>
              {waterPct >= 100 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center text-emerald-400 text-xs mt-2 font-medium">
                  🎉 Daily goal reached! Amazing!
                </motion.p>
              )}
            </GlassCard>
          </motion.div>

          {/* Weekly Trends Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <GlassCard className="h-full">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-neon-teal" size={18} />
                <h3 className="font-semibold text-sm text-white">Weekly Mood Trend</h3>
              </div>
              <div className="h-40">
                {weeklyTrends.some(d => d.mood != null) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyTrends}>
                      <defs>
                        <linearGradient id="homeMoodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                      <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                      <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 10]} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="mood" stroke="#A855F7" strokeWidth={2} fill="url(#homeMoodGrad)" name="Mood" connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-text-secondary text-sm text-center">Log your mood on the Mind tab<br />to see trends here 💜</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '💬 AI Health Chat', desc: 'Emotion-aware AI assistant', href: '/app/chat', gradient: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-500/30' },
              { label: '🔬 Symptom Scan', desc: 'Analyze your symptoms', href: '/app/symptoms', gradient: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30' },
              { label: '🥗 Food Diary', desc: 'Log & analyze meals', href: '/app/food', gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
              { label: '📊 Health Analytics', desc: 'AI-powered insights', href: '/app/analytics', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30' },
            ].map(a => (
              <motion.a key={a.href} href={a.href} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <GlassCard className={`bg-gradient-to-br ${a.gradient} ${a.border} h-full`}>
                  <p className="font-semibold text-sm text-white mb-1">{a.label}</p>
                  <p className="text-text-secondary text-xs">{a.desc}</p>
                </GlassCard>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Health Timeline */}
        {timeline.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Recent Activity</h2>
            <GlassCard className="space-y-3">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm">{item.type === 'chat' ? '💬' : item.type === 'scan' ? '🔬' : item.type === 'mood' ? '💚' : item.type === 'food' ? '🥗' : '📊'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium capitalize">{item.type}</p>
                    <p className="text-text-secondary text-xs truncate">{item.summary || 'Health activity recorded'}</p>
                  </div>
                  <p className="text-text-secondary text-xs flex-shrink-0">{item.time || 'Recently'}</p>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        )}
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOS && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowSOS(false)}>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-rose-950 to-midnight border border-rose-500/30 rounded-3xl p-6 max-w-sm w-full">
              <div className="text-center">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="text-rose-400" size={28} />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-1">Emergency SOS</h2>
                <p className="text-rose-300/70 text-sm mb-6">Only use in genuine medical emergency</p>
                <div className="space-y-3">
                  <a href="tel:112"
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-rose-500 text-white font-bold text-lg hover:bg-rose-600 transition-colors">
                    <Phone size={20} /> Call 112 (Emergency)
                  </a>
                  <a href="tel:108"
                    className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                    <Phone size={16} /> 108 (Ambulance)
                  </a>
                  <a href="tel:1800111565"
                    className="flex items-center justify-center gap-3 w-full py-3 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
                    🧠 iCall Mental Health Helpline
                  </a>
                </div>
                <button onClick={() => setShowSOS(false)} className="mt-4 text-text-secondary text-sm hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}