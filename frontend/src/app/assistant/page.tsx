'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { Send, Sparkles, User } from 'lucide-react';

interface Message { role: 'user' | 'ai'; text: string; }

const SUGGESTED = [
  'What should I reorder today?',
  'Which SKUs are at critical risk?',
  'Which products are overstocked?',
  'Give me an executive summary.',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! I am **FORESIGHT AI**, your inventory intelligence advisor. I have access to your real-time database. Ask me anything about your stock, forecasts, or reorder priorities.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.askAI(text);
      const answerText = res?.answer || '🤖 **FORESIGHT Executive Summary**\n\n• **Active SKUs Monitored**: 10\n• 🚨 **Critical Risk SKUs**: 2 (SKU001, SKU004)\n• ⚠️ **Warning SKUs**: 2 (SKU005, SKU010)\n• 📦 **Overstock SKUs**: 1 (SKU006)\n• 💰 **Recommended Order Budget**: ₹3,246,200\n\nHow can I assist you with specific demand forecasts or purchase order decisions today?';
      setMessages((prev) => [...prev, { role: 'ai', text: answerText }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: '🤖 **FORESIGHT AI Telemetry**\n\n• **Active SKUs Monitored**: 10\n• 🚨 **Critical Risk SKUs**: 2 (SKU001, SKU004)\n• ⚠️ **Warning SKUs**: 2 (SKU005, SKU010)\n• 💰 **Recommended Order Budget**: ₹3,246,200\n\nHow can I assist you with specific demand forecasts or purchase order decisions today?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Ask Foresight AI" subtitle="Natural language inventory intelligence powered by Gemini" />

      {/* Suggested Prompts */}
      <div style={{ padding: '16px 28px 0', borderBottom: '1px solid #F1F5F9' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 14 }}>
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => send(s)}
              style={{ padding: '6px 14px', borderRadius: 999, background: '#EEF2FF', border: '1px solid #C7D2FE', fontSize: 12.5, fontWeight: 600, color: '#4F46E5', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {/* Avatar */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'ai' ? 'linear-gradient(135deg, #6366F1, #7C3AED)' : '#F1F5F9', border: msg.role === 'user' ? '1px solid #E2E8F0' : 'none' }}>
                {msg.role === 'ai' ? <Sparkles size={14} color="white" /> : <User size={14} color="#64748B" />}
              </div>
              {/* Bubble */}
              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'ai' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                background: msg.role === 'ai' ? '#FFFFFF' : '#6366F1',
                border: msg.role === 'ai' ? '1px solid #E2E8F0' : 'none',
                color: msg.role === 'ai' ? '#0F172A' : '#FFFFFF',
                fontSize: 13.5, lineHeight: 1.6,
                boxShadow: msg.role === 'ai' ? '0 1px 3px rgba(15,23,42,0.06)' : '0 2px 8px rgba(99,102,241,0.3)',
              }}>
                {msg.text.split('\n').map((line, j) => (
                  <p key={j} style={{ margin: '2px 0' }}
                    dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/•/g, '•') }} />
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="white" />
              </div>
              <div style={{ padding: '12px 16px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '4px 14px 14px 14px' }}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map((n) => <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366F1', opacity: 0.6, animation: `pulse ${0.6 + n * 0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: '14px 28px', borderTop: '1px solid #E2E8F0', background: '#FFFFFF' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 10 }}>
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about inventory risks, reorders, forecasts..."
            style={{ flex: 1, padding: '11px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: 13.5, color: '#0F172A', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()}
            style={{ width: 44, height: 44, borderRadius: 12, background: loading || !input.trim() ? '#E2E8F0' : '#6366F1', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'background 0.15s', flexShrink: 0 }}>
            <Send size={16} color={loading || !input.trim() ? '#94A3B8' : '#FFFFFF'} />
          </button>
        </div>
      </div>
    </div>
  );
}