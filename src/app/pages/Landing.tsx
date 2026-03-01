import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  Activity,
  MapPin,
  Globe,
  Shield,
  Heart,
  Users,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { CircularProgress } from '../components/CircularProgress';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-midnight overflow-hidden">
      {/* Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-6xl">
        <div className="glass-nav rounded-[20px] px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-teal to-electric-cyan glow-teal flex items-center justify-center">
              <Brain className="text-midnight" size={24} />
            </div>
            <span className="text-2xl font-bold text-gradient-teal">SwasthAI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-text-secondary hover:text-neon-teal transition-colors">
              Features
            </a>
            <a href="#community" className="text-text-secondary hover:text-neon-teal transition-colors">
              Community
            </a>
            <a href="#about" className="text-text-secondary hover:text-neon-teal transition-colors">
              About
            </a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-text-primary hover:text-neon-teal transition-colors font-medium"
            >
              Login
            </button>
            <PrimaryButton size="sm" onClick={() => navigate('/signup')}>
              Register
            </PrimaryButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial-teal opacity-50" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-radial-emerald opacity-30 blur-3xl" />

        <div className="container max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              AI Health Guidance.{' '}
              <span className="text-gradient-teal">For You.</span>{' '}
              <span className="text-gradient-emerald">For Your City.</span>
            </h1>
            <p className="text-xl text-text-secondary mb-8 leading-relaxed">
              Private. Multilingual. Preventive. Real-time community awareness.
            </p>
            <div className="flex flex-wrap gap-4">
              <PrimaryButton size="lg" onClick={() => navigate('/signup')}>
                Get Started Free
              </PrimaryButton>
              <SecondaryButton size="lg" variant="white">
                Watch Demo
              </SecondaryButton>
            </div>
          </motion.div>

          {/* Right side - Floating cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[500px] hidden md:block"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-0 right-0"
            >
              <GlassCard className="w-64" glow="emerald">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald animate-pulse" />
                  <p className="text-emerald text-sm font-medium">Health Status: Stable</p>
                </div>
                <p className="text-text-secondary text-sm">
                  Your city health index is normal. Stay healthy!
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-32 left-0"
            >
              <GlassCard className="w-56" glow="teal">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="text-neon-teal" size={20} />
                  <p className="text-neon-teal text-sm font-medium">AI Insight</p>
                </div>
                <p className="text-text-secondary text-sm">
                  Based on your symptoms, consider rest and hydration.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute bottom-0 right-12"
            >
              <GlassCard className="w-52" glow="amber">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-amber" size={20} />
                  <p className="text-amber text-sm font-medium">City Alert</p>
                </div>
                <p className="text-text-secondary text-sm">
                  Flu activity increased in your area.
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-24 px-4 relative">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Cities Covered', value: '150+', icon: MapPin, color: 'teal' },
              { label: 'Symptom Reports', value: '2.5M+', icon: Activity, color: 'emerald' },
              { label: 'Languages', value: '22', icon: Globe, color: 'teal' },
              { label: 'Privacy Secured', value: '100%', icon: Shield, color: 'emerald' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <GlassCard className="text-center">
                  <stat.icon
                    className={`mx-auto mb-4 ${
                      stat.color === 'teal' ? 'text-neon-teal' : 'text-emerald'
                    }`}
                    size={32}
                  />
                  <h3 className="text-4xl font-bold text-text-primary mb-2">{stat.value}</h3>
                  <p className="text-text-secondary">{stat.label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-24 px-4">
        <div className="container max-w-6xl mx-auto space-y-32">
          {/* AI Chat Feature */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-teal/20 border border-neon-teal mb-6">
                <MessageSquare className="text-neon-teal" size={16} />
                <span className="text-neon-teal text-sm font-medium">AI Health Assistant</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Your Personal <span className="text-gradient-teal">AI Doctor</span>
              </h2>
              <p className="text-text-secondary text-lg mb-6">
                Chat with our intelligent health assistant. Get instant guidance on symptoms, preventive
                care, and wellness tips in your preferred language.
              </p>
              <ul className="space-y-3">
                {['24/7 availability', 'Multilingual support', 'Evidence-based responses'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-neon-teal/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-neon-teal" />
                    </div>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard glow="teal" className="p-8">
                <div className="space-y-4">
                  <div className="bg-neon-teal/10 rounded-[16px] p-4">
                    <p className="text-text-primary">What are the symptoms of dehydration?</p>
                  </div>
                  <div className="bg-midnight-lighter rounded-[16px] p-4">
                    <p className="text-text-secondary text-sm mb-2">
                      Common symptoms include: dry mouth, fatigue, dizziness, and dark urine. Drink 8-10
                      glasses of water daily.
                    </p>
                    <div className="flex gap-2">
                      <span className="text-xs text-neon-teal">Verified Source</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Symptom Scan Feature */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 md:order-1"
            >
              <GlassCard glow="emerald" className="p-8">
                <div className="aspect-video bg-gradient-to-br from-emerald/20 to-lime-highlight/20 rounded-[16px] flex items-center justify-center mb-4">
                  <Activity className="text-emerald" size={64} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Category</span>
                    <span className="text-emerald font-medium">Respiratory</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Risk Level</span>
                    <span className="text-emerald font-medium">Low</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/20 border border-emerald mb-6">
                <Activity className="text-emerald" size={16} />
                <span className="text-emerald text-sm font-medium">Smart Symptom Scanner</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Instant <span className="text-gradient-emerald">Symptom Analysis</span>
              </h2>
              <p className="text-text-secondary text-lg mb-6">
                Advanced AI analyzes your symptoms and provides instant risk assessment with recommended
                actions.
              </p>
              <ul className="space-y-3">
                {['Quick assessment', 'Risk categorization', 'Action recommendations'].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald" />
                    </div>
                    <span className="text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Mental Wellbeing Feature */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/20 border border-emerald mb-6">
                <Heart className="text-emerald" size={16} />
                <span className="text-emerald text-sm font-medium">Mental Wellness</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">
                Track Your <span className="text-gradient-emerald">Mental Health</span>
              </h2>
              <p className="text-text-secondary text-lg mb-6">
                Monitor mood, stress levels, and sleep patterns. Get personalized wellness recommendations.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard glow="emerald" className="p-8">
                <div className="flex justify-center mb-6">
                  <CircularProgress percentage={75} color="emerald" value="75%" label="Wellness" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald">Good</p>
                    <p className="text-xs text-text-secondary">Mood</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-neon-teal">Low</p>
                    <p className="text-xs text-text-secondary">Stress</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-lime-highlight">7.5h</p>
                    <p className="text-xs text-text-secondary">Sleep</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Intelligence Section */}
      <section id="community" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-radial-teal opacity-30" />
        <div className="container max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neon-teal/20 border border-neon-teal mb-6">
              <Users className="text-neon-teal" size={16} />
              <span className="text-neon-teal text-sm font-medium">Community Health Intelligence</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">
              Real-time <span className="text-gradient-teal">City Health Insights</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Anonymous, aggregated health data helps you stay aware of health trends in your community.
            </p>
          </motion.div>

          <GlassCard glow="teal" className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="aspect-video bg-gradient-to-br from-neon-teal/10 to-electric-cyan/10 rounded-[16px] flex items-center justify-center mb-4">
                  <MapPin className="text-neon-teal" size={64} />
                  <p className="text-text-secondary ml-4">City Health Heatmap</p>
                </div>
                <div className="bg-midnight-lighter rounded-[12px] p-4">
                  <p className="text-text-primary font-medium mb-2">AI Health Summary</p>
                  <p className="text-text-secondary text-sm">
                    Respiratory infections trending up in North zone. Preventive measures recommended. Air
                    quality moderate.
                  </p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-center mb-2">
                    <CircularProgress percentage={82} color="emerald" value="82" label="Stability" />
                  </div>
                  <p className="text-center text-text-secondary text-sm">Health Stability Index</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Respiratory</span>
                    <span className="text-amber text-sm">↑ 12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Digestive</span>
                    <span className="text-emerald text-sm">↓ 5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">General</span>
                    <span className="text-neon-teal text-sm">Stable</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-teal/10 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to Take Control of Your{' '}
            <span className="text-gradient-teal">Health Journey?</span>
          </h2>
          <p className="text-xl text-text-secondary mb-12">
            Join thousands using SwasthAI for intelligent, preventive healthcare.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <PrimaryButton size="lg" onClick={() => navigate('/signup')}>
              Start Free Today
            </PrimaryButton>
            <SecondaryButton size="lg" variant="white">
              Learn More
            </SecondaryButton>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-glass-border py-12 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-teal to-electric-cyan flex items-center justify-center">
                  <Brain className="text-midnight" size={20} />
                </div>
                <span className="text-xl font-bold text-gradient-teal">SwasthAI</span>
              </div>
              <p className="text-text-secondary text-sm">
                AI-powered health intelligence for individuals and communities.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                <li>Privacy</li>
                <li>Terms</li>
                <li>HIPAA</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-glass-border text-center text-text-secondary text-sm">
            © 2026 SwasthAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}