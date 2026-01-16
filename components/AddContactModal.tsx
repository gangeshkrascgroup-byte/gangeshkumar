
import React, { useState } from 'react';
import { EmergencyContact } from '../types';

interface AddContactModalProps {
  onAdd: (contact: Omit<EmergencyContact, 'id'>) => void;
  onClose: () => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !relation) return;
    onAdd({ name, phone, relation });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm glass-morphism rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Add Guardian</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 tracking-widest">Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-white"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 tracking-widest">Phone Number</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-white"
              placeholder="+1 555-0123"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1 ml-1 tracking-widest">Relation</label>
            <input 
              type="text" 
              required
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-white"
              placeholder="e.g. Brother, Friend"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-lg shadow-sky-500/20 active:scale-95 uppercase tracking-widest text-xs"
          >
            Register Guardian
          </button>
        </form>
      </div>
    </div>
  );
};
