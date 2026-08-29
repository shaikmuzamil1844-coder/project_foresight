"use client";

import { useState } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: '👋 Hi! I am **Foresight Copilot**. Ask me about SKU risks, reorder quantities, or stockout forecasts!',
    },
  ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setPrompt('');
    setLoading(true);

    try {
      const res = await api.askAI(textToSend);
      const aiMsg: Message = { sender: 'ai', text: res.answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        sender: 'ai',
        text: '⚠️ Unable to connect to AI server. Please try again in a moment.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            right: '0',
            width: '380px',
            maxHeight: '540px',
            height: '500px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={18} color="#FFFFFF" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>Foresight Copilot</div>
                <div style={{ fontSize: '11px', opacity: 0.85 }}>AI Demand & Inventory Assistant</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick Prompt Suggestions */}
          <div
            style={{
              padding: '10px 14px',
              background: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
            }}
          >
            {[
              'Which SKUs are high risk?',
              'Show purchase order plan',
              'Check overstock items',
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#4F46E5',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#FFFFFF',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {msg.sender === 'ai' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '8px',
                      background: '#EEF2FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={14} color="#4F46E5" />
                  </div>
                )}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '14px',
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    background: msg.sender === 'user' ? '#4F46E5' : '#F1F5F9',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    fontWeight: msg.sender === 'user' ? 600 : 400,
                  }}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    M
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
                <Loader2 size={16} className="animate-spin" color="#4F46E5" />
                Analyzing inventory telemetry...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Ask Copilot anything..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                outline: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: '#4F46E5',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Launcher Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          color: '#FFFFFF',
          border: 'none',
          fontWeight: 700,
          fontSize: '13.5px',
          boxShadow: '0 8px 24px -4px rgba(79, 70, 229, 0.45)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Sparkles size={18} color="#FFFFFF" />
        <span>Ask Foresight</span>
      </button>
    </div>
  );
}
