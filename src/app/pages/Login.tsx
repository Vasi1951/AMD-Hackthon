import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-midnight overflow-hidden flex items-center justify-center">
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
          <h2 className="text-2xl font-bold text-center text-text-primary mb-2">Welcome Back</h2>
          <p className="text-center text-text-secondary mb-8">Sign in to access your health insights</p>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-text-primary mb-2 text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-text-secondary" size={20} />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded bg-glass-white border border-glass-border accent-neon-teal" />
                <span className="text-text-secondary">Remember me</span>
              </label>
              <a href="#" className="text-neon-teal hover:text-electric-cyan transition-colors">
                Forgot password?
              </a>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </PrimaryButton>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-midnight text-text-muted">Don't have an account?</span>
            </div>
          </div>

          {/* Sign up link */}
          <Link
            to="/signup"
            className="block text-center py-3 px-4 border border-neon-teal/30 rounded-lg text-neon-teal hover:bg-neon-teal/10 transition-all font-medium"
          >
            Create Account
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
