
import React, { useState, useEffect } from 'react';

interface DecoyCallProps {
  onEnd: () => void;
  callerName: string;
}

export const DecoyCall: React.FC<DecoyCallProps> = ({ onEnd, callerName }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-between p-12 text-white font-sans animate-in fade-in duration-300">
      <div className="text-center mt-12">
        <div className="w-24 h-24 bg-sky-500 rounded-full mx-auto flex items-center justify-center text-3xl font-bold shadow-2xl mb-4">
          {callerName[0]}
        </div>
        <h2 className="text-3xl font-light mb-2">{callerName}</h2>
        <p className="text-sky-400 font-mono text-sm tracking-widest">{formatTime(seconds)}</p>
      </div>

      <div className="w-full flex justify-around mb-12">
        <div className="flex flex-col items-center gap-2">
          <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
            <i className="fas fa-microphone-slash"></i>
          </button>
          <span className="text-[10px] text-slate-400">Mute</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
            <i className="fas fa-th"></i>
          </button>
          <span className="text-[10px] text-slate-400">Keypad</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center">
            <i className="fas fa-volume-up"></i>
          </button>
          <span className="text-[10px] text-slate-400">Speaker</span>
        </div>
      </div>

      <button 
        onClick={onEnd}
        className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl mb-12"
      >
        <i className="fas fa-phone-slash text-2xl rotate-[135deg]"></i>
      </button>
    </div>
  );
};
