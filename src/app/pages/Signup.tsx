import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'confirmPassword' || name === 'password') {
      const newForm = { ...formData, [name]: value };
      setPasswordsMatch(newForm.password === newForm.confirmPassword);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) return;
    setError('');
    setIsLoading(true);
    try {
      await register(formData.fullName, formData.email, formData.password);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight overflow-hidden flex items-center justify-center py-12">
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-teal/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-electric-cyan/20 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <GlassCard className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-teal to-electric-cyan glow-teal flex items-center justify-center">
              <Brain className="text-midnight" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gradient-teal">SwasthAI</h1>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-text-primary mb-2">Create Account</h2>
          <p className="text-center text-text-secondary mb-8">Join us to start your health journey</p>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-text-primary mb-2 text-sm font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-text-secondary" size={20} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-glass-white border border-glass-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-all backdrop-blur-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-primary mb-2 text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-text-secondary" size={20} />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-glass-white border border-glass-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-all backdrop-blur-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-primary mb-2 text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-text-secondary" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-glass-white border border-glass-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-all backdrop-blur-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-text-secondary hover:text-neon-teal transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-text-primary mb-2 text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-text-secondary" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full pl-12 pr-12 py-3 bg-glass-white border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all backdrop-blur-xl ${passwordsMatch ? 'border-glass-border focus:border-neon-teal focus:ring-neon-teal' : 'border-red-500/50 focus:border-soft-red focus:ring-soft-red'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-text-secondary hover:text-neon-teal transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {!passwordsMatch && (
                <p className="text-soft-red text-sm mt-1">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 rounded bg-glass-white border border-glass-border accent-neon-teal mt-1"
                required
              />
              <label htmlFor="terms" className="text-text-secondary text-sm">
                I agree to the <a href="#" className="text-neon-teal hover:text-electric-cyan">Terms of Service</a> and <a href="#" className="text-neon-teal hover:text-electric-cyan">Privacy Policy</a>
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <PrimaryButton
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="w-full"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </PrimaryButton>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-midnight text-text-muted">Already registered?</span>
            </div>
          </div>

          {/* Login link */}
          <Link
            to="/login"
            className="block text-center py-3 px-4 border border-neon-teal/30 rounded-lg text-neon-teal hover:bg-neon-teal/10 transition-all font-medium"
          >
            Sign In
          </Link>
        </GlassCard>

        <p className="text-center text-text-muted mt-6 text-sm">
          <Link to="/" className="text-neon-teal hover:text-electric-cyan transition-colors">
            Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
