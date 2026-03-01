import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare, Activity, Heart, Home, User, Utensils, LogOut, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../../contexts/AuthContext';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/app', icon: Home, label: 'Home', exact: true },
    { path: '/app/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/app/symptoms', icon: Activity, label: 'Scan' },
    { path: '/app/mental', icon: Heart, label: 'Mind' },
    { path: '/app/food', icon: Utensils, label: 'Food' },
    { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/app/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    // Handle aliases
    if (path === '/app/symptoms') return location.pathname.includes('/symptoms') || location.pathname.includes('/scan');
    if (path === '/app/mental') return location.pathname.includes('/mental') || location.pathname.includes('/mind');
    if (path === '/app/food') return location.pathname.includes('/food');
    if (path === '/app/analytics') return location.pathname.includes('/analytics');
    if (path === '/app/profile') return location.pathname.includes('/profile');
    if (path === '/app/chat') return location.pathname.includes('/chat');
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-midnight pb-24">
      {/* Logout top-right */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-text-secondary hover:text-white hover:bg-white/10 transition-all text-xs"
      >
        <LogOut size={13} />
        <span>Logout</span>
      </button>

      <Outlet />

      {/* Bottom Navigation — 6 tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
        <div className="max-w-4xl mx-auto glass-nav rounded-[20px] px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const active = isActive(item.path, item.exact);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all"
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-neon-teal/20 rounded-[12px] glow-teal"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon
                    size={20}
                    className={`relative z-10 transition-colors ${active ? 'text-neon-teal' : 'text-text-secondary'}`}
                  />
                  <span className={`relative z-10 text-[10px] transition-colors ${active ? 'text-neon-teal font-medium' : 'text-text-secondary'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}