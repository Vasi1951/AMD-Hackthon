import { useState } from 'react';
import { Camera, Scan, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard } from '../../components/GlassCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SecondaryButton } from '../../components/SecondaryButton';
import { GlowBadge } from '../../components/GlowBadge';
import api from '../../../lib/api';

export default function SymptomScan() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [symptomsText, setSymptomsText] = useState('');
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!symptomsText.trim()) {
      setError('Please describe your symptoms before scanning.');
      return;
    }
    setError('');
    setScanning(true);
    try {
      const data = await api.post<any>('/symptoms/analyze', { symptomsText });
      if (data.success) {
        setResult(data.scan);
        setScanned(true);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const resetScan = () => {
    setScanned(false);
    setResult(null);
    setSymptomsText('');
    setError('');
  };

  return (
    <div className="min-h-screen p-4 pt-8 pb-32">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Symptom Scanner</h1>
          <p className="text-text-secondary">
            AI-powered instant symptom analysis
          </p>
        </div>

        {!scanned ? (
          <>
            {/* Camera Preview / Scan Area */}
            <GlassCard className="mb-6 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-midnight-darker to-midnight-lighter rounded-[16px] relative overflow-hidden flex items-center justify-center">
                {scanning ? (
                  <motion.div className="absolute inset-0">
                    {/* Scanning animation */}
                    <motion.div
                      animate={{ y: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-neon-teal to-transparent opacity-70"
                      style={{ boxShadow: '0 0 20px rgba(0, 229, 196, 0.5)' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Scan className="text-neon-teal mx-auto mb-4 animate-pulse" size={48} />
                        <p className="text-neon-teal font-medium">Analyzing symptoms...</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Grid overlay */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-glass-border/30" />
                      ))}
                    </div>

                    {/* Corner markers */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neon-teal" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-neon-teal" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-neon-teal" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neon-teal" />

                    {/* Center icon */}
                    <Activity className="text-neon-teal opacity-50" size={64} />
                  </>
                )}
              </div>
            </GlassCard>

            {/* Instructions */}
            <div className="mb-6 space-y-3">
              <h3 className="font-medium">How it works:</h3>
              {[
                'Describe your symptoms using text or voice',
                'AI analyzes patterns and severity',
                'Get instant risk assessment and recommendations',
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-neon-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-neon-teal text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-text-secondary text-sm">{step}</p>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <GlassCard className="mb-6">
              <label className="block text-sm font-medium mb-3">Describe Your Symptoms</label>
              {error && (
                <p className="text-red-400 text-sm mb-3">{error}</p>
              )}
              <textarea
                placeholder="E.g., I have a headache and mild fever since yesterday..."
                rows={4}
                value={symptomsText}
                onChange={e => setSymptomsText(e.target.value)}
                className="w-full bg-input-background border border-glass-border rounded-[12px] px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-neon-teal focus:glow-teal transition-all resize-none"
              />
            </GlassCard>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <SecondaryButton variant="teal" className="flex items-center justify-center gap-2">
                <Camera size={20} />
                Camera
              </SecondaryButton>
              <PrimaryButton
                onClick={handleScan}
                disabled={scanning}
                className="flex items-center justify-center gap-2"
              >
                <Scan size={20} />
                {scanning ? 'Scanning...' : 'Start Scan'}
              </PrimaryButton>
            </div>
          </>
        ) : (
          <>
            {/* Scan Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Result Card */}
              <GlassCard glow="emerald" className="border-l-4 border-emerald">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Analysis Complete</h3>
                    <p className="text-text-secondary text-sm">
                      {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                  <GlowBadge variant="emerald">Low Risk</GlowBadge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-text-secondary text-sm mb-1">Category</p>
                    <p className="text-emerald font-medium">{result?.category}</p>
                  </div>
                  <div>
                    <p className="text-text-secondary text-sm mb-1">Confidence</p>
                    <p className="text-emerald font-medium">{result?.confidence}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-text-secondary text-sm mb-2">Detected Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {result?.symptoms.map((symptom: string, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-1 rounded-full bg-emerald/10 border border-emerald/30 text-emerald text-sm"
                      >
                        {symptom}
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Recommendations */}
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="text-neon-teal" size={24} />
                  <h3 className="font-medium">Recommended Actions</h3>
                </div>
                <ul className="space-y-3">
                  {result?.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-teal flex-shrink-0 mt-2" />
                      <p className="text-text-secondary text-sm">{rec}</p>
                    </li>
                  ))}
                </ul>
              </GlassCard>

              {/* When to Seek Help */}
              <GlassCard className="border-l-4 border-amber">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-medium mb-1">When to Seek Medical Help</h4>
                    <p className="text-text-secondary text-sm">{result?.whenToSeek}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <SecondaryButton onClick={resetScan} variant="white">
                  New Scan
                </SecondaryButton>
                <PrimaryButton variant="emerald">Save Results</PrimaryButton>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}