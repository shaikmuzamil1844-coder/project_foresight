'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/header';
import { api } from '@/lib/api';
import { Bot, Send, User, Sparkles, AlertTriangle, ShoppingCart, ShieldAlert } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: "👋 **Welcome to Ask Foresight!** I am your AI Executive Supply Chain Assistant. Ask me anything about current stockout risks, recommended reorder budgets, or inventory health.",
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.askAI(textToSend);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'assistant', text: res.answer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), sender: 'assistant', text: '⚠️ Apologies, failed to retrieve AI analysis.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'What should I reorder this week?',
    'Which SKUs are at critical stockout risk?',
    'What is our total recommended purchase budget?',
    'Are any products overstocked?',
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <Header
        title="Ask Foresight – AI Executive Assistant"
        subtitle="Natural language query assistant explaining stockout risks, safety stock levels, and procurement decisions."
      />

      <div className="flex-1 flex flex-col p-8 overflow-hidden max-w-4xl mx-auto w-full">
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-4 shrink-0">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            >
              💡 {s}
            </button>
          ))}
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 glass-card p-6 rounded-2xl overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none font-medium shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none whitespace-pre-wrap'
                }`}
              >
                {m.text}
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-indigo-400 font-medium animate-pulse">
              <Sparkles className="w-4 h-4" /> Analyzing database risks and supply chain rules...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex gap-3 shrink-0">
          <input
            type="text"
            placeholder="Ask about reorders, stockouts, safety stock, or lead times..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
