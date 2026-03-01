import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import { EmptyState, SkeletonCard } from '../../../components/EmptyState';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_EMOJI: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
const SCORE_COLOR = (s: number) => s >= 70 ? 'emerald' : s >= 50 ? 'amber' : 'rose';

export default function FoodDiary() {
    const { success, error } = useToast();
    const [logs, setLogs] = useState<any[]>([]);
    const [todaySummary, setTodaySummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [form, setForm] = useState({ mealType: 'lunch', description: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [hist, today] = await Promise.all([
                api.get<any>('/food/history'),
                api.get<any>('/food/today-summary'),
            ]);
            if (hist.success) setLogs(hist.logs || []);
            if (today.success) setTodaySummary(today);
        } catch { error('Failed to load food diary'); } finally { setLoading(false); }
    };

    const handleLog = async () => {
        if (!form.description.trim()) return error('Please describe your meal');
        setAnalyzing(true);
        try {
            const data = await api.post<any>('/food/log', form);
            if (data.success) {
                success('🥗 Meal logged and analyzed!');
                setAdding(false);
                setForm({ mealType: 'lunch', description: '' });
                loadData();
            }
        } catch { error('Failed to log meal'); } finally { setAnalyzing(false); }
    };

    return (
        <div className="min-h-screen p-4 pt-8 pb-32 bg-gradient-to-b from-emerald-950/20 via-midnight to-midnight">
            <div className="max-w-5xl mx-auto space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Food Diary 🥗
                        </h1>
                        <p className="text-text-secondary text-sm">AI-powered nutrition tracking</p>
                    </motion.div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setAdding(!adding)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium">
                        <Plus size={16} /> Log Meal
                    </motion.button>
                </div>

                {/* Today Summary */}
                {todaySummary && todaySummary.mealCount > 0 && (
                    <GlassCard className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
                        <h3 className="text-sm font-semibold mb-3 text-emerald-400">Today's Nutrition</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{todaySummary.totalCalories}</p>
                                <p className="text-xs text-text-secondary">kcal</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{todaySummary.mealCount}</p>
                                <p className="text-xs text-text-secondary">meals</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{todaySummary.avgHealthScore}</p>
                                <p className="text-xs text-text-secondary">health score</p>
                            </div>
                        </div>
                    </GlassCard>
                )}

                {/* Add Meal Form */}
                <AnimatePresence>
                    {adding && (
                        <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }}>
                            <GlassCard className="border-emerald-500/30">
                                <h3 className="text-sm font-semibold mb-4 text-emerald-400">🍽️ What did you eat?</h3>
                                {/* Meal type */}
                                <div className="flex gap-2 mb-4">
                                    {MEAL_TYPES.map(mt => (
                                        <button key={mt} onClick={() => setForm(p => ({ ...p, mealType: mt }))}
                                            className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${form.mealType === mt ? 'bg-emerald-500 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                                            {MEAL_EMOJI[mt]} {mt}
                                        </button>
                                    ))}
                                </div>
                                {/* Description */}
                                <textarea
                                    placeholder="Describe your meal... e.g. 'Dal rice with salad and raita, 2 chapatis'"
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary text-sm focus:outline-none focus:border-emerald-500/50 resize-none mb-3"
                                />
                                <motion.button whileTap={{ scale: 0.97 }} onClick={handleLog} disabled={analyzing}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm disabled:opacity-50">
                                    {analyzing ? '🤖 Analyzing with AI...' : '✨ Log & Analyze'}
                                </motion.button>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Log List */}
                {loading ? (
                    <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
                ) : logs.length === 0 ? (
                    <EmptyState icon="🥗" title="No meals logged yet" subtitle="Log your first meal and get AI-powered nutrition analysis" />
                ) : (
                    <div className="space-y-3">
                        {logs.map(log => {
                            const sc = log.health_score || 0;
                            const color = SCORE_COLOR(sc);
                            return (
                                <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                    <GlassCard className={`border-l-4 border-${color}-500 cursor-pointer`}
                                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{MEAL_EMOJI[log.meal_type] || '🍽️'}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-white capitalize">{log.meal_type}</p>
                                                    <p className="text-xs text-text-secondary truncate max-w-[200px]">{log.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-white">{log.calories_estimate || 0}</p>
                                                    <p className="text-xs text-text-secondary">kcal</p>
                                                </div>
                                                <div className={`px-2 py-1 rounded-lg bg-${color}-500/20 text-${color}-400 text-xs font-bold`}>{sc}</div>
                                                {expandedId === log.id ? <ChevronUp size={14} className="text-text-secondary" /> : <ChevronDown size={14} className="text-text-secondary" />}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedId === log.id && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                                        {log.ai_feedback && <p className="text-xs text-text-secondary italic">{log.ai_feedback}</p>}
                                                        <div className="grid grid-cols-3 gap-2 text-center">
                                                            {[['Protein', log.protein_g || 0, 'g'], ['Carbs', log.carbs_g || 0, 'g'], ['Fat', log.fat_g || 0, 'g']].map(([l, v, u]) => (
                                                                <div key={l as string} className="bg-white/5 rounded-lg p-2">
                                                                    <p className="text-xs text-text-secondary">{l}</p>
                                                                    <p className="text-sm font-bold text-white">{v}{u}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-text-secondary">
                                                            <Clock size={10} />{new Date(log.logged_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
