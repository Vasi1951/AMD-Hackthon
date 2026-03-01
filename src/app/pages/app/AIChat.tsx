import { useState, useEffect, useRef } from "react";
import {
  Send,
  Mic,
  Brain,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  TrendingUp,
  Activity,
  Cloud,
  User,
  Globe,
  BarChart3,
  Info,
  X,
  Sparkles,
  Trash2,
  Heart,
  Frown,
  Meh,
  Smile,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../../components/GlassCard";
import { CircularProgress } from "../../components/CircularProgress";
import api from "../../../lib/api";

interface Message {
  id: number | string;
  type: "user" | "ai" | "suggestion";
  content: string;
  sources?: string[];
  riskLevel?: "low" | "monitor" | "urgent";
  confidence?: number;
  emotionalTone?: string;
  dataUsed?: {
    personal?: boolean;
    community?: boolean;
    trends?: boolean;
  };
  explanation?: {
    personalContext?: string;
    communityContext?: string;
    medicalGuideline?: string;
  };
  suggestions?: {
    title: string;
    action: string;
  }[];
}

// ─── Markdown-like renderer ───────────────────────────────────────────────────
function renderMarkdown(text: string) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Headers
    if (line.startsWith('### ')) return <h4 key={i} className="text-sm font-semibold text-white mt-3 mb-1">{line.slice(4)}</h4>;
    if (line.startsWith('## ')) return <h3 key={i} className="text-base font-semibold text-white mt-3 mb-1">{line.slice(3)}</h3>;
    if (line.startsWith('# ')) return <h2 key={i} className="text-lg font-bold text-white mt-3 mb-1">{line.slice(2)}</h2>;
    // Bullet points
    if (line.match(/^[•\-\*]\s/)) {
      const content = line.replace(/^[•\-\*]\s/, '');
      return <li key={i} className="text-text-primary text-sm leading-relaxed ml-2 list-none flex gap-2"><span className="text-neon-teal mt-1 flex-shrink-0">•</span><span>{renderInlineMd(content)}</span></li>;
    }
    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      return <li key={i} className="text-text-primary text-sm leading-relaxed ml-2 list-none">{renderInlineMd(line)}</li>;
    }
    // Empty line
    if (line.trim() === '') return <div key={i} className="h-2" />;
    // Regular paragraph
    return <p key={i} className="text-text-primary text-sm leading-relaxed">{renderInlineMd(line)}</p>;
  });
}

function renderInlineMd(text: string) {
  // Bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ─── Emotion Config ───────────────────────────────────────────────────────────
const emotionConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  anxious: { icon: AlertTriangle, label: 'Sensing Anxiety', color: 'text-amber', bg: 'bg-amber/15 border-amber/30' },
  frustrated: { icon: Frown, label: 'Sensing Frustration', color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  sad: { icon: Frown, label: 'Sensing Sadness', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  curious: { icon: HelpCircle, label: 'Curious', color: 'text-neon-teal', bg: 'bg-neon-teal/15 border-neon-teal/30' },
  hopeful: { icon: Smile, label: 'Positive Vibes', color: 'text-emerald', bg: 'bg-emerald/15 border-emerald/30' },
  distressed: { icon: AlertCircle, label: 'Urgent Concern', color: 'text-soft-red', bg: 'bg-soft-red/15 border-soft-red/30' },
  neutral: { icon: Meh, label: 'Neutral', color: 'text-text-secondary', bg: 'bg-white/5 border-white/10' },
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content: "Hello! I'm your **Health Intelligence Engine** — powered by AI that understands your emotions and health context.\n\nI analyze your personal health data, community trends, and medical guidelines to provide **context-aware guidance**.\n\nHow can I help you today? 💚",
      confidence: 95,
      emotionalTone: "hopeful",
      dataUsed: { personal: true, community: true, trends: true },
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history on mount
  useEffect(() => {
    api.get<any>('/chat/history').then(data => {
      if (data.success && data.messages.length > 0) {
        setMessages(data.messages);
      }
    }).catch(() => { });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const [input, setInput] = useState("");
  const [activeMode, setActiveMode] = useState<
    "personal" | "community" | "mental"
  >("personal");
  const [showContext, setShowContext] = useState(false);
  const [expandedExplanation, setExpandedExplanation] =
    useState<number | string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const data = await api.post<any>('/chat/message', { message: input, mode: activeMode });
      if (data.success) {
        setMessages(prev => [...prev, { ...data.message, id: data.message.id || Date.now() + 1 }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Sorry, I could not process your request. Please check your connection and try again.',
        riskLevel: 'low',
        confidence: 0,
        emotionalTone: 'neutral',
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await api.delete('/chat/history');
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: "Chat cleared! 🔄 I'm ready for a fresh conversation. How can I help you today?",
        confidence: 95,
        emotionalTone: 'hopeful',
        dataUsed: { personal: true, community: true, trends: true },
      }]);
    } catch { /* silent */ }
  };

  const getRiskConfig = (risk?: string) => {
    switch (risk) {
      case "low":
        return { color: "emerald", glow: "glow-emerald", label: "Low Risk", bg: "from-emerald-500/20 to-emerald-500/10" };
      case "monitor":
        return { color: "amber", glow: "glow-amber", label: "Monitor", bg: "from-amber-500/20 to-amber-500/10" };
      case "urgent":
        return { color: "soft-red", glow: "glow-red", label: "Urgent", bg: "from-soft-red/20 to-soft-red/10" };
      default:
        return { color: "neon-teal", glow: "", label: "Info", bg: "from-neon-teal/20 to-neon-teal/10" };
    }
  };

  const modeConfig = {
    personal: { icon: User, label: "Personal Mode", color: "neon-teal" },
    community: { icon: Globe, label: "Community-Aware", color: "emerald" },
    mental: { icon: Brain, label: "Mental Support", color: "purple-400" },
  };

  // Time-based quick suggestions
  const hour = new Date().getHours();
  const quickSuggestions = hour < 12
    ? ["Morning headache", "Didn't sleep well", "Feeling anxious today", "Breakfast ideas"]
    : hour < 17
      ? ["Post-lunch fatigue", "Stress at work", "Need energy boost", "Healthy snack ideas"]
      : ["Evening tiredness", "Can't fall asleep", "Feeling low today", "Relaxation tips"];

  return (
    <div className="h-screen flex flex-col relative">
      {/* 🎯 INTELLIGENT HEADER */}
      <div className="p-4 border-b border-glass-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-teal via-electric-cyan to-emerald glow-teal flex items-center justify-center">
                  <Brain className="text-midnight" size={24} />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-emerald rounded-full"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-neon-teal to-electric-cyan bg-clip-text text-transparent">
                  Health Intelligence Engine
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                    <p className="text-xs text-emerald">Emotion-Aware AI</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                    <MapPin size={12} className="text-neon-teal" />
                    <span>Context-Intelligent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-glass-white border border-glass-border hover:border-soft-red hover:text-soft-red transition-all text-xs text-text-secondary"
              >
                <Trash2 size={12} />
                <span className="hidden md:inline">Clear</span>
              </button>
              <button
                onClick={() => setShowContext(!showContext)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-glass-white border border-glass-border hover:border-neon-teal transition-all text-xs"
              >
                <BarChart3 size={14} className="text-neon-teal" />
                <span>AI Context</span>
                {showContext ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2">
            {(Object.keys(modeConfig) as Array<keyof typeof modeConfig>).map((mode) => {
              const config = modeConfig[mode];
              const isActive = activeMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => setActiveMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isActive
                    ? `bg-${config.color}/20 border border-${config.color}/50 text-${config.color}`
                    : "bg-glass-white border border-glass-border text-text-secondary hover:border-neon-teal"
                    }`}
                >
                  <config.icon size={12} />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-6xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.3) }}
                >
                  {message.type === "suggestion" ? (
                    <GlassCard className="border-l-4 border-amber bg-gradient-to-r from-amber/10 to-transparent">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="text-amber" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-text-primary mb-2">{message.content}</p>
                          {message.suggestions && (
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <button key={idx} className="px-3 py-1.5 rounded-full bg-amber/20 border border-amber/30 text-xs text-amber hover:bg-amber/30 transition-all">
                                  {suggestion.action}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="text-text-muted hover:text-text-secondary transition-colors"><X size={16} /></button>
                      </div>
                    </GlassCard>
                  ) : message.type === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[75%] bg-gradient-to-br from-neon-teal to-electric-cyan rounded-[20px] px-4 py-3 glow-teal">
                        <p className="text-midnight text-sm leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-[85%]">
                      <GlassCard className={message.riskLevel ? getRiskConfig(message.riskLevel).glow : ""}>
                        {/* Emotion Badge */}
                        {message.emotionalTone && message.emotionalTone !== 'neutral' && (
                          <div className="mb-3">
                            {(() => {
                              const emotion = emotionConfig[message.emotionalTone] || emotionConfig.neutral;
                              const EmotionIcon = emotion.icon;
                              return (
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${emotion.bg} ${emotion.color}`}>
                                  <EmotionIcon size={12} />
                                  <span>{emotion.label}</span>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Main Response with Markdown */}
                        <div className="prose prose-sm prose-invert max-w-none">
                          {renderMarkdown(message.content)}
                        </div>

                        {/* Risk + Confidence + Data Sources Row */}
                        {(message.riskLevel || message.confidence || message.dataUsed) && (
                          <div className="mt-4 pt-4 border-t border-glass-border">
                            <div className="flex flex-wrap gap-3 items-center">
                              {message.riskLevel && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getRiskConfig(message.riskLevel).bg} border border-${getRiskConfig(message.riskLevel).color}/30`}>
                                  <AlertCircle className={`text-${getRiskConfig(message.riskLevel).color}`} size={14} />
                                  <span className={`text-xs font-medium text-${getRiskConfig(message.riskLevel).color}`}>
                                    {getRiskConfig(message.riskLevel).label}
                                  </span>
                                </div>
                              )}
                              {message.confidence != null && message.confidence > 0 && (
                                <div className="flex items-center gap-2">
                                  <CircularProgress percentage={message.confidence} size={32} strokeWidth={3} color="teal" value={`${message.confidence}%`} className="text-[8px]" />
                                  <span className="text-xs text-text-secondary">AI Confidence</span>
                                </div>
                              )}
                              {message.dataUsed && (
                                <div className="flex items-center gap-2">
                                  {message.dataUsed.personal && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-neon-teal/10 border border-neon-teal/30">
                                      <User size={10} className="text-neon-teal" />
                                      <span className="text-[10px] text-neon-teal">Personal</span>
                                    </div>
                                  )}
                                  {message.dataUsed.community && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald/10 border border-emerald/30">
                                      <Globe size={10} className="text-emerald" />
                                      <span className="text-[10px] text-emerald">Community</span>
                                    </div>
                                  )}
                                  {message.dataUsed.trends && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-400/10 border border-purple-400/30">
                                      <TrendingUp size={10} className="text-purple-400" />
                                      <span className="text-[10px] text-purple-400">Trends</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Expandable Explanation */}
                        {message.explanation && (
                          <div className="mt-3">
                            <button
                              onClick={() => setExpandedExplanation(expandedExplanation === message.id ? null : message.id)}
                              className="flex items-center gap-2 text-xs text-neon-teal hover:text-electric-cyan transition-colors"
                            >
                              <Info size={12} />
                              <span>Why this suggestion?</span>
                              {expandedExplanation === message.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                            <AnimatePresence>
                              {expandedExplanation === message.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 space-y-2"
                                >
                                  {message.explanation.personalContext && (
                                    <div className="flex items-start gap-2 text-xs">
                                      <User size={12} className="text-neon-teal mt-0.5 flex-shrink-0" />
                                      <div><span className="text-text-secondary">Personal: </span><span className="text-text-primary">{message.explanation.personalContext}</span></div>
                                    </div>
                                  )}
                                  {message.explanation.communityContext && (
                                    <div className="flex items-start gap-2 text-xs">
                                      <Globe size={12} className="text-emerald mt-0.5 flex-shrink-0" />
                                      <div><span className="text-text-secondary">Community: </span><span className="text-text-primary">{message.explanation.communityContext}</span></div>
                                    </div>
                                  )}
                                  {message.explanation.medicalGuideline && (
                                    <div className="flex items-start gap-2 text-xs">
                                      <Activity size={12} className="text-purple-400 mt-0.5 flex-shrink-0" />
                                      <div><span className="text-text-secondary">Medical: </span><span className="text-text-primary">{message.explanation.medicalGuideline}</span></div>
                                    </div>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-glass-border">
                            <p className="text-xs text-text-secondary mb-2">Verified Sources:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, idx) => (
                                <div key={idx} className="px-2 py-1 rounded-full bg-neon-teal/10 border border-neon-teal/30 text-xs text-neon-teal">
                                  {source}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-glass-border">
                            <p className="text-xs text-text-secondary mb-2">Recommended Actions:</p>
                            <div className="space-y-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-glass-white rounded-lg px-3 py-2">
                                  <span className="text-xs text-text-primary">{suggestion.title}</span>
                                  <button className="text-xs text-neon-teal hover:text-electric-cyan font-medium transition-colors">{suggestion.action}</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </GlassCard>
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[85%]"
                >
                  <GlassCard className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            className="w-2 h-2 rounded-full bg-neon-teal"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-text-secondary">SwasthAI is thinking...</span>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-glass-border">
            <div className="max-w-6xl mx-auto">
              <GlassCard className="p-4">
                <div className="flex gap-3 mb-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Describe your symptoms or ask a health question..."
                    className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-teal to-electric-cyan flex items-center justify-center glow-teal disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    <Send className="text-midnight" size={18} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-glass-white flex items-center justify-center hover:bg-glass-border transition-all">
                    <Mic className="text-neon-teal" size={18} />
                  </button>
                </div>

                {/* Time-aware Quick Suggestions */}
                <div className="flex gap-2 flex-wrap">
                  {quickSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 rounded-full bg-glass-white border border-glass-border text-xs text-text-secondary hover:border-neon-teal hover:text-neon-teal transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>

        {/* 📊 CONTEXT SNAPSHOT PANEL (Desktop) */}
        <AnimatePresence>
          {showContext && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="hidden md:block w-80 border-l border-glass-border p-4 overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm">AI Context</h3>
                  <button onClick={() => setShowContext(false)} className="text-text-muted hover:text-text-secondary"><X size={16} /></button>
                </div>

                {/* Emotion Detection Info */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Heart size={14} className="text-pink-400" />
                    <h4 className="text-xs font-medium text-text-secondary uppercase">Emotion Detection</h4>
                  </div>
                  <GlassCard className="space-y-2 p-3">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      SwasthAI detects your emotional state from messages and adapts responses with empathy.
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(emotionConfig).filter(([k]) => k !== 'neutral').map(([key, val]) => (
                        <span key={key} className={`text-[9px] px-2 py-0.5 rounded-full border ${val.bg} ${val.color}`}>
                          {val.label}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </div>

                {/* User Context */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User size={14} className="text-neon-teal" />
                    <h4 className="text-xs font-medium text-text-secondary uppercase">Your Context</h4>
                  </div>
                  <GlassCard className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">Data Scope</span>
                      <span className="text-emerald font-medium">Profile + Health</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">Context Items</span>
                      <span className="text-neon-teal font-medium">Mood · Food · Water</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">AI Model</span>
                      <span className="text-purple-400 font-medium">Gemini 1.5 Flash</span>
                    </div>
                  </GlassCard>
                </div>

                {/* Community Context */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={14} className="text-emerald" />
                    <h4 className="text-xs font-medium text-text-secondary uppercase">Community Context</h4>
                  </div>
                  <GlassCard className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">City Health Index</span>
                      <CircularProgress percentage={82} size={40} strokeWidth={4} color="emerald" value="82" />
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary">Air Quality</span>
                      <div className="flex items-center gap-1">
                        <Cloud className="text-amber" size={12} />
                        <span className="text-amber font-medium">Moderate</span>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}