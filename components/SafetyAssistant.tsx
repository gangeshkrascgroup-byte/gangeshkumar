
import React, { useState } from 'react';
import { assessSituation, generateSafetyGuidance } from '../services/geminiService';

interface SafetyAssistantProps {
  onTriggerDanger: () => void;
}

export const SafetyAssistant: React.FC<SafetyAssistantProps> = ({ onTriggerDanger }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "I'm Guardian Angel. Tell me what's happening or where you are, and I'll keep watch." }
  ]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    const assessment = await assessSituation(userMsg);
    
    if (assessment.shouldTriggerAlert) {
      setMessages(prev => [...prev, { role: 'ai', text: "⚠️ ALERT: High danger detected. Notifying emergency services and contacts now." }]);
      onTriggerDanger();
    } else {
      const guidance = await generateSafetyGuidance("Current Location", userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: guidance || "I've logged this. Stay alert." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full glass-morphism rounded-2xl overflow-hidden">
      <div className="bg-slate-800/50 p-3 border-b border-slate-700 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Safety Intelligence Active</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
              m.role === 'user' 
                ? 'bg-sky-600 text-white rounded-tr-none' 
                : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none animate-pulse text-xs text-slate-400">
              Analyzing situation...
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-800/30 border-t border-slate-700">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type situation (e.g., 'Being followed')"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
