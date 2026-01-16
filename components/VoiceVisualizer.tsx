
import React from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isListening }) => {
  return (
    <div className={`flex items-center gap-1 h-6 transition-opacity duration-300 ${isListening ? 'opacity-100' : 'opacity-0'}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-1 bg-sky-400 rounded-full animate-bounce"
          style={{
            height: isListening ? `${Math.random() * 100 + 20}%` : '20%',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        ></div>
      ))}
      <span className="text-[10px] text-sky-400 font-bold ml-2 uppercase tracking-tighter">Listening for Voice...</span>
    </div>
  );
};
