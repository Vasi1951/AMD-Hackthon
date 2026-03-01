import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Droplets, Brain, Activity, Sparkles, Utensils } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { CircularProgress } from '../../components/CircularProgress';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../../../lib/api';

const PIE_COLORS = ['#00E5C4', '#F59E0B', '#A855F7'];

export default function HealthAnalytics() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [weeklyTrends, setWeeklyTrends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.allSettled([
            api.get<any>('/health/analytics'),
            api.get<any>('/health/weekly-trends'),
        ]).then(([analyticsRes, trendsRes]) => {
            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
                setAnalytics(analyticsRes.value);
            }
            if (trendsRes.status === 'fulfilled' && trendsRes.value.success) {
                setWeeklyTrends(trendsRes.value.weekData || []);
            }
        }).finally(() => setLoading(false));
    }, []);

    const nutritionPieData = analytics?.nutrition ? [
        { name: 'Protein', value: analytics.nutrition.totalProtein || 0 },
        { name: 'Carbs', value: analytics.nutrition.totalCarbs || 0 },
        { name: 'Fat', value: analytics.nutrition.totalFat || 0 },
    ].filter(d => d.value > 0) : [];

    const tooltipStyle = {
        backgroundColor: 'rgba(19, 27, 46, 0.95)',
        border: '1px solid rgba(0, 229, 196, 0.3)',
        borderRadius: '12px',
        color: '#F8FAFC',
        fontSize: '12px',
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 pt-8 pb-32">
                <div className="max-w-5xl mx-auto space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 pt-8 pb-32 bg-gradient-to-b from-cyan-950/20 via-midnight to-midnight relative overflow-hidden">
            {/* Ambient BG */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute top-10 right-20 w-60 h-60 bg-neon-teal/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute bottom-40 left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-5xl mx-auto space-y-6 relative z-10">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-teal to-electric-cyan flex items-center justify-center">
                            <BarChart3 className="text-midnight" size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-teal to-electric-cyan bg-clip-text text-transparent">
                                Health Analytics
                            </h1>
                            <p className="text-text-secondary text-sm">Your AI-powered health insights</p>
                        </div>
                    </div>
                </motion.div>

                {/* AI Insights */}
                {analytics?.insights && analytics.insights.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="text-amber" size={16} />
                            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">AI Health Insights</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {analytics.insights.map((insight: any, i: number) => (
                                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                                    <GlassCard className={`h-full border-l-4 ${insight.type === 'positive' ? 'border-emerald bg-gradient-to-r from-emerald-500/10 to-transparent' :
                                            insight.type === 'warning' ? 'border-amber bg-gradient-to-r from-amber-500/10 to-transparent' :
                                                'border-neon-teal bg-gradient-to-r from-neon-teal/10 to-transparent'
                                        }`}>
                                        <h3 className="font-semibold text-sm text-white mb-1">{insight.title}</h3>
                                        <p className="text-text-secondary text-xs leading-relaxed">{insight.description}</p>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Top Stats Row */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <GlassCard className="text-center py-3 bg-gradient-to-br from-neon-teal/10 to-transparent">
                            <Utensils className="text-neon-teal mx-auto mb-1" size={20} />
                            <p className="text-2xl font-bold text-white">{analytics?.nutrition?.totalCalories || 0}</p>
                            <p className="text-xs text-text-secondary">Total Calories (7d)</p>
                        </GlassCard>
                        <GlassCard className="text-center py-3 bg-gradient-to-br from-purple-500/10 to-transparent">
                            <Brain className="text-purple-400 mx-auto mb-1" size={20} />
                            <p className="text-2xl font-bold text-white">{analytics?.moodDistribution?.length || 0}</p>
                            <p className="text-xs text-text-secondary">Mood Entries (30d)</p>
                        </GlassCard>
                        <GlassCard className="text-center py-3 bg-gradient-to-br from-blue-500/10 to-transparent">
                            <Droplets className="text-blue-400 mx-auto mb-1" size={20} />
                            <p className="text-2xl font-bold text-white">{analytics?.waterHistory?.length || 0}</p>
                            <p className="text-xs text-text-secondary">Hydration Days</p>
                        </GlassCard>
                        <GlassCard className="text-center py-3 bg-gradient-to-br from-emerald-500/10 to-transparent">
                            <Activity className="text-emerald mx-auto mb-1" size={20} />
                            <p className="text-2xl font-bold text-white">{analytics?.nutrition?.avgHealthScore || 0}</p>
                            <p className="text-xs text-text-secondary">Avg Food Score</p>
                        </GlassCard>
                    </div>
                </motion.div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Weekly Mood + Water Trends */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-neon-teal" size={18} />
                                <h3 className="font-semibold text-sm">Weekly Mood & Hydration</h3>
                            </div>
                            <div className="h-52">
                                {weeklyTrends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={weeklyTrends}>
                                            <defs>
                                                <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                            <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                            <YAxis yAxisId="left" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 10]} />
                                            <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
                                            <Area yAxisId="left" type="monotone" dataKey="mood" stroke="#A855F7" strokeWidth={2} fill="url(#moodGrad)" name="Mood" />
                                            <Area yAxisId="right" type="monotone" dataKey="water" stroke="#3B82F6" strokeWidth={2} fill="url(#waterGrad)" name="Water (ml)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-text-secondary text-sm">Log mood & water to see trends</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Nutrition Breakdown Pie */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4">
                                <Utensils className="text-emerald" size={18} />
                                <h3 className="font-semibold text-sm">Nutrition Breakdown (7 Days)</h3>
                            </div>
                            <div className="h-52">
                                {nutritionPieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={nutritionPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={75}
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}g`}
                                                labelLine={false}
                                            >
                                                {nutritionPieData.map((_entry: any, index: number) => (
                                                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={tooltipStyle} />
                                            <Legend wrapperStyle={{ fontSize: '10px', color: '#94A3B8' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <p className="text-text-secondary text-sm">Log meals to see breakdown</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Water History Bar Chart */}
                {analytics?.waterHistory && analytics.waterHistory.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4">
                                <Droplets className="text-blue-400" size={18} />
                                <h3 className="font-semibold text-sm">Daily Water Intake</h3>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.waterHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                        <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }}
                                            tickFormatter={(v) => v ? v.slice(5) : ''} />
                                        <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Bar dataKey="total" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Water (ml)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Mood Distribution + Symptom Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analytics?.moodDistribution && analytics.moodDistribution.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                            <GlassCard>
                                <div className="flex items-center gap-2 mb-4">
                                    <Brain className="text-purple-400" size={18} />
                                    <h3 className="font-semibold text-sm">Mood Distribution (30 Days)</h3>
                                </div>
                                <div className="space-y-2">
                                    {analytics.moodDistribution.map((entry: any, i: number) => {
                                        const maxCount = Math.max(...analytics.moodDistribution.map((e: any) => e.count));
                                        const pct = maxCount ? (entry.count / maxCount) * 100 : 0;
                                        const emoji = entry.mood_label === 'great' ? '😊' : entry.mood_label === 'good' ? '🙂' : entry.mood_label === 'okay' ? '😐' : entry.mood_label === 'low' ? '😔' : entry.mood_label === 'anxious' ? '😰' : '💜';
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-lg w-6">{emoji}</span>
                                                <span className="text-xs text-text-secondary w-16 capitalize">{entry.mood_label}</span>
                                                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                    />
                                                </div>
                                                <span className="text-xs text-white font-medium w-6 text-right">{entry.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {analytics?.symptomHistory && analytics.symptomHistory.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <GlassCard>
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="text-neon-teal" size={18} />
                                    <h3 className="font-semibold text-sm">Symptom Categories (30 Days)</h3>
                                </div>
                                <div className="space-y-2">
                                    {analytics.symptomHistory.map((entry: any, i: number) => {
                                        const maxCount = Math.max(...analytics.symptomHistory.map((e: any) => e.count));
                                        const pct = maxCount ? (entry.count / maxCount) * 100 : 0;
                                        return (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-xs text-text-secondary w-24">{entry.category}</span>
                                                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                                        className="h-full bg-gradient-to-r from-neon-teal to-electric-cyan rounded-full"
                                                    />
                                                </div>
                                                <span className="text-xs text-white font-medium w-6 text-right">{entry.count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </div>

                {/* Health Score History */}
                {analytics?.healthScores && analytics.healthScores.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                        <GlassCard>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-emerald" size={18} />
                                <h3 className="font-semibold text-sm">Health Score Trend</h3>
                            </div>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.healthScores}>
                                        <defs>
                                            <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1FD28E" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#1FD28E" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                                        <XAxis dataKey="day" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }}
                                            tickFormatter={(v) => v ? v.slice(5) : ''} />
                                        <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} domain={[0, 100]} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Area type="monotone" dataKey="health_score" stroke="#1FD28E" strokeWidth={2} fill="url(#healthGrad)" name="Health Score" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Empty state */}
                {!analytics?.nutrition?.mealCount && !analytics?.moodDistribution?.length && (
                    <GlassCard className="text-center py-12">
                        <div className="text-5xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-white mb-2">Your Analytics Dashboard</h3>
                        <p className="text-text-secondary text-sm max-w-md mx-auto">
                            Start logging meals, moods, water intake, and health metrics to see your personalized analytics and AI-powered insights here.
                        </p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
