import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, TrendingDown, AlertTriangle, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../components/GlassCard';
import { CircularProgress } from '../../components/CircularProgress';
import { GlowBadge } from '../../components/GlowBadge';
import api from '../../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CityIntelligence() {
  const [trendData, setTrendData] = useState<any[]>([
    { category: 'Respiratory', cases: 245, change: 12 },
    { category: 'Digestive', cases: 156, change: -5 },
    { category: 'Fever', cases: 189, change: 8 },
    { category: 'Allergies', cases: 134, change: -3 },
    { category: 'General', cases: 98, change: 2 },
  ]);
  const [zoneData, setZoneData] = useState<any[]>([
    { zone: 'North', risk: 'medium', cases: 342 },
    { zone: 'South', risk: 'low', cases: 187 },
    { zone: 'East', risk: 'high', cases: 456 },
    { zone: 'West', risk: 'low', cases: 203 },
    { zone: 'Central', risk: 'medium', cases: 298 },
  ]);
  const [chartData, setChartData] = useState<any[]>([
    { date: 'Feb 19', cases: 245 }, { date: 'Feb 20', cases: 289 },
    { date: 'Feb 21', cases: 312 }, { date: 'Feb 22', cases: 298 },
    { date: 'Feb 23', cases: 285 }, { date: 'Feb 24', cases: 271 },
    { date: 'Feb 25', cases: 263 },
  ]);
  const [cityIndex, setCityIndex] = useState(82);
  const [alerts, setAlerts] = useState<any[]>([{
    id: 1, title: 'Active Health Alert',
    message: 'Increased flu activity detected in North and East zones.',
    severity: 'warning', updated: '2 hours ago'
  }]);

  useEffect(() => {
    api.get<any>('/city/health-index').then(d => d.success && setCityIndex(d.data.healthIndex)).catch(() => { });
    api.get<any>('/city/trends').then(d => { if (d.success) { setTrendData(d.trends); setChartData(d.chartData); } }).catch(() => { });
    api.get<any>('/city/zones').then(d => d.success && setZoneData(d.zones)).catch(() => { });
    api.get<any>('/city/alerts').then(d => d.success && setAlerts(d.alerts)).catch(() => { });
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'emerald';
      case 'medium':
        return 'amber';
      case 'high':
        return 'red';
      default:
        return 'teal';
    }
  };

  return (
    <div className="min-h-screen p-4 pt-8 pb-32">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">City Intelligence</h1>
          <div className="flex items-center gap-2">
            <MapPin className="text-neon-teal" size={20} />
            <p className="text-text-secondary">New Delhi, India</p>
          </div>
        </div>

        {/* Health Stability Index */}
        <GlassCard glow="emerald" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-text-secondary mb-2">City Health Stability Index</p>
              <h2 className="text-4xl font-bold text-emerald mb-1">82%</h2>
              <div className="flex items-center gap-2 text-emerald text-sm">
                <TrendingUp size={16} />
                <span>Stable trend</span>
              </div>
            </div>
            <CircularProgress percentage={82} size={120} color="emerald" value="82" label="Stable" />
          </div>
          <p className="text-text-secondary text-sm">
            Overall health conditions in your city are stable. Minor increases in respiratory cases detected.
          </p>
        </GlassCard>

        {/* Heatmap Placeholder */}
        <GlassCard glow="teal" className="mb-6">
          <h3 className="font-medium mb-4">City Health Heatmap</h3>
          <div className="aspect-video bg-gradient-to-br from-midnight-darker to-midnight-lighter rounded-[16px] relative overflow-hidden flex items-center justify-center">
            {/* Map visualization placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="text-neon-teal mx-auto mb-3" size={48} />
                <p className="text-text-secondary text-sm">Interactive city health map</p>
              </div>
            </div>

            {/* Hotspot indicators */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1/4 right-1/3 w-12 h-12 rounded-full bg-soft-red/30 glow-red"
            />
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute bottom-1/3 left-1/4 w-10 h-10 rounded-full bg-amber/30 glow-amber"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 w-8 h-8 rounded-full bg-emerald/30 glow-emerald"
            />
          </div>
        </GlassCard>

        {/* Zone Status */}
        <div className="mb-6">
          <h3 className="font-medium mb-4">Zone Status</h3>
          <div className="space-y-3">
            {zoneData.map((zone) => (
              <GlassCard key={zone.zone} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin
                    className={`text-${getRiskColor(zone.risk)}`}
                    size={20}
                  />
                  <div>
                    <p className="font-medium">{zone.zone} Zone</p>
                    <p className="text-text-secondary text-xs">{zone.cases} reported cases</p>
                  </div>
                </div>
                <GlowBadge variant={getRiskColor(zone.risk) as any} size="sm">
                  {zone.risk.toUpperCase()}
                </GlowBadge>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Trend Analysis */}
        <GlassCard className="mb-6">
          <h3 className="font-medium mb-4">Health Category Trends</h3>
          <div className="space-y-3">
            {trendData.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-secondary">{item.category}</span>
                    <span className="text-sm font-medium">{item.cases} cases</span>
                  </div>
                  <div className="h-2 bg-glass-white rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.change > 0
                        ? 'bg-gradient-to-r from-amber to-soft-red'
                        : 'bg-gradient-to-r from-emerald to-lime-highlight'
                        }`}
                      style={{ width: `${(item.cases / 300) * 100}%` }}
                    />
                  </div>
                </div>
                <div className={`ml-4 flex items-center gap-1 ${item.change > 0 ? 'text-amber' : 'text-emerald'
                  }`}>
                  {item.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span className="text-sm font-medium">{Math.abs(item.change)}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* 7-Day Trend Chart */}
        <GlassCard className="mb-6">
          <h3 className="font-medium mb-4">7-Day Case Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5C4" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00E5C4" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <YAxis
                  stroke="#94A3B8"
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(19, 27, 46, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Bar dataKey="cases" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* AI Summary */}
        <GlassCard className="border-l-4 border-neon-teal" glow="teal">
          <div className="flex items-start gap-3">
            <Users className="text-neon-teal flex-shrink-0" size={24} />
            <div>
              <h4 className="font-medium mb-2">AI Community Health Summary</h4>
              <p className="text-text-secondary text-sm leading-relaxed mb-3">
                Respiratory infections showing a moderate increase (+12%) in the East zone over the past week.
                Air quality has been moderate. Preventive measures recommended:
              </p>
              <ul className="space-y-2">
                {[
                  'Wear masks in crowded areas',
                  'Maintain good hand hygiene',
                  'Stay hydrated and boost immunity',
                  'Avoid unnecessary travel to high-risk zones',
                ].map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-teal flex-shrink-0 mt-2" />
                    <span className="text-text-secondary text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Alert Section */}
        <GlassCard className="mt-6 border-l-4 border-amber" glow="amber">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber flex-shrink-0" size={24} />
            <div>
              <h4 className="font-medium mb-1">Active Health Alert</h4>
              <p className="text-text-secondary text-sm">
                Increased flu activity detected in North and East zones. Take preventive measures.
              </p>
              <p className="text-text-muted text-xs mt-2">Updated 2 hours ago</p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
