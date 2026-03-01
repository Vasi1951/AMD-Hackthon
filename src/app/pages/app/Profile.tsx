import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Edit3, Save, X, Award, Heart } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';
import { CircularProgress } from '../../components/CircularProgress';
import api from '../../../lib/api';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { SkeletonCard } from '../../../components/EmptyState';

interface Profile {
    id: string; full_name: string; email: string; age: number | null;
    weight: number | null; height: number | null; blood_group: string | null;
    city: string; gender: string; xp: number; level: number; bmi: number | null; bmiCategory: string | null;
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const bmiColors: Record<string, string> = { Normal: 'emerald', Overweight: 'amber', Underweight: 'blue', Obese: 'rose' };

export default function Profile() {
    const { user: authUser } = useAuth();
    const { success, error } = useToast();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [badges, setBadges] = useState<any[]>([]);
    const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0, total_logs: 0 });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Partial<Profile>>({});

    useEffect(() => {
        api.get<any>('/profile').then(data => {
            if (data.success) {
                setProfile(data.profile);
                setForm(data.profile);
                setBadges(data.badges || []);
                setStreak(data.streak || { current_streak: 0, longest_streak: 0, total_logs: 0 });
            }
        }).catch(() => error('Failed to load profile')).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = await api.put<any>('/profile', {
                fullName: form.full_name, age: form.age, weight: form.weight,
                height: form.height, bloodGroup: form.blood_group, city: form.city, gender: form.gender,
            });
            if (data.success) {
                setProfile(data.profile);
                setEditing(false);
                success('✅ Profile updated!');
            }
        } catch { error('Failed to save profile'); } finally { setSaving(false); }
    };

    const xpToNextLevel = ((profile?.level || 1) * 500);
    const xpProgress = Math.round(((profile?.xp || 0) % 500) / 500 * 100);

    if (loading) return (
        <div className="min-h-screen p-4 pt-8 pb-32 space-y-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
    );

    return (
        <div className="min-h-screen p-4 pt-8 pb-32 bg-gradient-to-b from-indigo-950/30 via-midnight to-midnight">
            <div className="max-w-5xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                        My Profile
                    </motion.h1>
                    {!editing ? (
                        <button onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-text-secondary hover:bg-white/10 transition-colors">
                            <Edit3 size={14} /> Edit
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setEditing(false)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-text-secondary hover:bg-white/10"><X size={16} /></button>
                            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium">
                                <Save size={14} /> {saving ? '...' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Avatar & XP Card */}
                <GlassCard className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/30">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
                            {(profile?.full_name || authUser?.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <input value={form.full_name || ''} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm mb-1 focus:outline-none focus:border-purple-500/50" />
                            ) : (
                                <h2 className="font-semibold text-white truncate">{profile?.full_name}</h2>
                            )}
                            <p className="text-text-secondary text-xs truncate">{profile?.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-purple-400 font-medium">Level {profile?.level || 1}</span>
                                <span className="text-xs text-text-secondary">·</span>
                                <span className="text-xs text-text-secondary">{profile?.xp || 0} XP</span>
                                {profile?.city && <span className="text-xs text-text-secondary">· 📍 {profile.city}</span>}
                            </div>
                        </div>
                        <div className="flex-shrink-0">
                            <CircularProgress percentage={xpProgress} size={56} color="teal" value={`${xpProgress}%`} />
                        </div>
                    </div>
                    {/* XP progress bar */}
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-text-secondary mb-1">
                            <span>XP Progress</span><span>{profile?.xp || 0} / {xpToNextLevel}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-gradient-to-r from-purple-500 to-emerald-500 rounded-full"
                                initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1 }} />
                        </div>
                    </div>
                </GlassCard>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: '🔥 Streak', value: `${streak.current_streak}d`, sub: `Best: ${streak.longest_streak}d` },
                        { label: '📋 Total Logs', value: streak.total_logs, sub: 'health actions' },
                        { label: '🏆 Badges', value: badges.length, sub: 'earned' },
                    ].map(s => (
                        <GlassCard key={s.label} className="text-center py-3">
                            <p className="text-xs text-text-secondary mb-1">{s.label}</p>
                            <p className="text-xl font-bold text-white">{s.value}</p>
                            <p className="text-xs text-text-secondary">{s.sub}</p>
                        </GlassCard>
                    ))}
                </div>

                {/* Body Stats + BMI */}
                <GlassCard>
                    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Heart className="text-rose-400" size={16} />Body Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Age', key: 'age', unit: 'yrs', type: 'number' },
                            { label: 'Weight', key: 'weight', unit: 'kg', type: 'number' },
                            { label: 'Height', key: 'height', unit: 'cm', type: 'number' },
                            { label: 'Blood Group', key: 'blood_group', unit: '', type: 'select' },
                        ].map(field => (
                            <div key={field.key}>
                                <p className="text-xs text-text-secondary mb-1">{field.label}</p>
                                {editing ? (
                                    field.type === 'select' ? (
                                        <select value={(form as any)[field.key] || ''}
                                            onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50">
                                            <option value="">Select</option>
                                            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                        </select>
                                    ) : (
                                        <input type={field.type} value={(form as any)[field.key] || ''}
                                            onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50" />
                                    )
                                ) : (
                                    <p className="font-semibold text-white text-sm">
                                        {(profile as any)?.[field.key] ? `${(profile as any)[field.key]}${field.unit}` : <span className="text-text-secondary italic text-xs">Not set</span>}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {profile?.bmi && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-xs text-text-secondary">BMI</p>
                                <p className="text-2xl font-bold text-white">{profile.bmi}</p>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${bmiColors[profile.bmiCategory!] || 'emerald'}-500/20 text-${bmiColors[profile.bmiCategory!] || 'emerald'}-400`}>
                                    {profile.bmiCategory}
                                </span>
                                <p className="text-xs text-text-secondary mt-1">Body Mass Index</p>
                            </div>
                        </motion.div>
                    )}
                </GlassCard>

                {/* Badges */}
                {badges.length > 0 && (
                    <GlassCard>
                        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><Award className="text-amber-400" size={16} />Badges Earned</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {badges.map((b, i) => (
                                <motion.div key={b.badge_key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                                    <div className="text-2xl">{b.badge_name.split(' ')[0]}</div>
                                    <div>
                                        <p className="text-xs font-semibold text-white">{b.badge_name.split(' ').slice(1).join(' ')}</p>
                                        <p className="text-xs text-text-secondary">{b.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                )}

                {badges.length === 0 && (
                    <GlassCard className="text-center py-6">
                        <div className="text-4xl mb-2">🏆</div>
                        <p className="text-text-secondary text-sm">Keep using SwasthAI to earn badges!</p>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}
