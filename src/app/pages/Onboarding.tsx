import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, User, Activity, MapPin, Check } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../contexts/ToastContext';

const STEPS = [
    { title: 'About You', subtitle: 'Help us personalize your health journey', icon: User },
    { title: 'Body Stats', subtitle: 'For accurate BMI and health calculations', icon: Activity },
    { title: 'Your Location', subtitle: 'Get city-specific health alerts', icon: MapPin },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CITIES = ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];
const HEALTH_GOALS = ['Lose Weight', 'Build Muscle', 'Improve Sleep', 'Reduce Stress', 'Eat Healthier', 'Stay Active'];

export default function Onboarding() {
    const navigate = useNavigate();
    const { success, error } = useToast();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        age: '', gender: 'male', goals: [] as string[],
        weight: '', height: '', bloodGroup: '',
        city: 'New Delhi',
    });

    const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
    const toggleGoal = (g: string) => {
        setForm(p => ({
            ...p,
            goals: p.goals.includes(g) ? p.goals.filter(x => x !== g) : [...p.goals, g]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post('/profile/onboard', {
                age: Number(form.age),
                weight: Number(form.weight),
                height: Number(form.height),
                bloodGroup: form.bloodGroup,
                city: form.city,
                gender: form.gender,
            });
            success('🎉 Profile complete! Welcome to SwasthAI!');
            setTimeout(() => navigate('/app'), 1000);
        } catch {
            error('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-midnight to-indigo-950 flex items-center justify-center p-4">
            {/* BG orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-emerald-500"
                                initial={{ width: '0%' }}
                                animate={{ width: i <= step ? '100%' : '0%' }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-purple-500/30">
                                {(() => { const Icon = STEPS[step].icon; return <Icon className="text-purple-400" size={28} />; })()}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{STEPS[step].title}</h2>
                            <p className="text-text-secondary text-sm">{STEPS[step].subtitle}</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 space-y-4">
                            {/* Step 0: About You */}
                            {step === 0 && (
                                <>
                                    <div>
                                        <label className="text-xs text-text-secondary mb-2 block font-medium">Age</label>
                                        <input
                                            type="number" placeholder="e.g. 25" value={form.age}
                                            onChange={e => update('age', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-purple-500/50 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-text-secondary mb-2 block font-medium">Gender</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['male', 'female', 'other'].map(g => (
                                                <button key={g} onClick={() => update('gender', g)}
                                                    className={`py-3 rounded-xl text-sm font-medium capitalize transition-all ${form.gender === g ? 'bg-purple-500 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                                                    {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'} {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-text-secondary mb-2 block font-medium">Health Goals (pick any)</label>
                                        <div className="flex flex-wrap gap-2">
                                            {HEALTH_GOALS.map(g => (
                                                <button key={g} onClick={() => toggleGoal(g)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.goals.includes(g) ? 'bg-emerald-500 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                                                    {form.goals.includes(g) ? '✓ ' : ''}{g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 1: Body Stats */}
                            {step === 1 && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-text-secondary mb-2 block font-medium">Weight (kg)</label>
                                            <input type="number" placeholder="e.g. 65" value={form.weight}
                                                onChange={e => update('weight', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-purple-500/50" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-secondary mb-2 block font-medium">Height (cm)</label>
                                            <input type="number" placeholder="e.g. 170" value={form.height}
                                                onChange={e => update('height', e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-purple-500/50" />
                                        </div>
                                    </div>
                                    {form.weight && form.height && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                                            <p className="text-emerald-400 text-sm font-medium">
                                                Your BMI: {(Number(form.weight) / ((Number(form.height) / 100) ** 2)).toFixed(1)}
                                                {' '}{Number(form.weight) / ((Number(form.height) / 100) ** 2) < 18.5 ? '— Underweight' :
                                                    Number(form.weight) / ((Number(form.height) / 100) ** 2) < 25 ? '— Normal ✅' :
                                                        Number(form.weight) / ((Number(form.height) / 100) ** 2) < 30 ? '— Overweight' : '— Obese'}
                                            </p>
                                        </motion.div>
                                    )}
                                    <div>
                                        <label className="text-xs text-text-secondary mb-2 block font-medium">Blood Group</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {BLOOD_GROUPS.map(bg => (
                                                <button key={bg} onClick={() => update('bloodGroup', bg)}
                                                    className={`py-2 rounded-xl text-xs font-bold transition-all ${form.bloodGroup === bg ? 'bg-rose-500 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Step 2: City */}
                            {step === 2 && (
                                <div>
                                    <label className="text-xs text-text-secondary mb-2 block font-medium">Select Your City</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {CITIES.map(c => (
                                            <button key={c} onClick={() => update('city', c)}
                                                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${form.city === c ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>
                                                {form.city === c ? '✓ ' : ''}{c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation buttons */}
                        <div className="flex gap-3 mt-6">
                            {step > 0 && (
                                <button onClick={() => setStep(s => s - 1)}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors">
                                    <ChevronLeft size={18} /> Back
                                </button>
                            )}
                            {step < 2 ? (
                                <motion.button whileTap={{ scale: 0.98 }} onClick={() => setStep(s => s + 1)}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:opacity-90 transition-opacity">
                                    Continue <ChevronRight size={18} />
                                </motion.button>
                            ) : (
                                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                                    {loading ? '...' : <><Check size={18} /> Complete Setup</>}
                                </motion.button>
                            )}
                        </div>

                        <button onClick={() => navigate('/app')} className="w-full mt-3 text-text-secondary text-xs text-center hover:text-white transition-colors">
                            Skip for now
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
