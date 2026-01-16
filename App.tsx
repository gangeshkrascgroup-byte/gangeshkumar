
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertStatus, EmergencyContact, LocationData, SafetyLog, NearbyResponder, SafeHaven } from './types';
import { SafetyMap } from './components/SafetyMap';
import { SafetyAssistant } from './components/SafetyAssistant';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { CameraStream } from './components/CameraStream';
import { DecoyCall } from './components/DecoyCall';
import { AddContactModal } from './components/AddContactModal';
import { findSafeHavens } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AlertStatus>(AlertStatus.SAFE);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Dad', phone: '+1 555-0123', relation: 'Family' },
    { id: '2', name: 'Sarah', phone: '+1 555-0199', relation: 'Partner' }
  ]);
  const [logs, setLogs] = useState<SafetyLog[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [responders, setResponders] = useState<NearbyResponder[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSilentMode, setIsSilentMode] = useState(false);
  const [isCommunityAlertEnabled, setIsCommunityAlertEnabled] = useState(true);
  const [isDecoyActive, setIsDecoyActive] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [safeHavens, setSafeHavens] = useState<SafeHaven[]>([]);
  const [searchingHavens, setSearchingHavens] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  const addLog = useCallback((event: string, type: 'info' | 'warning' | 'critical' = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      event,
      type
    }, ...prev].slice(0, 10));
  }, []);

  const speak = (text: string) => {
    if (isSilentMode) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const triggerEmergency = useCallback(() => {
    if (status === AlertStatus.DANGER || status === AlertStatus.RESCUE_IN_PROGRESS) return;
    setStatus(AlertStatus.DANGER);
    setIsCameraActive(true);
    setCountdown(5);
    addLog(`Emergency Protocol: ${isSilentMode ? 'SILENT' : 'LOUD'} SOS`, "critical");
    if (isCommunityAlertEnabled) {
      addLog("Preparing community-wide GPS broadcast", "warning");
    }
    if (!isSilentMode) speak("SOS Initiated. Camera feed broadcasting.");
  }, [status, addLog, isSilentMode, isCommunityAlertEnabled]);

  const cancelEmergency = useCallback(() => {
    setCountdown(null);
    setStatus(AlertStatus.SAFE);
    setIsCameraActive(false);
    setResponders([]);
    addLog("Status: SAFE", "info");
    if (!isSilentMode) speak("Alert deactivated.");
  }, [addLog, isSilentMode]);

  const handleAddContact = (newContact: Omit<EmergencyContact, 'id'>) => {
    const contact: EmergencyContact = {
      ...newContact,
      id: Math.random().toString(36).substr(2, 9)
    };
    setContacts(prev => [...prev, contact]);
    addLog(`Guardian Added: ${contact.name}`, 'info');
    speak(`Guardian ${contact.name} registered successfully.`);
  };

  const fetchHavens = async () => {
    if (!location || searchingHavens) return;
    setSearchingHavens(true);
    addLog("Scanning for Nearby Safe Havens", "info");
    const found = await findSafeHavens(location.lat, location.lng);
    setSafeHavens(found);
    setSearchingHavens(false);
    addLog(`Safety Grounding: ${found.length} sites found`, "info");
  };

  const dispatchResponders = useCallback(() => {
    const newResponders: NearbyResponder[] = [
      { id: 'p1', type: 'police', name: 'Unit 402', distance: 800, bearing: 45, eta: 3 },
      { id: 'c1', type: 'citizen', name: 'Guardian-Res', distance: 150, bearing: 180, eta: 1 }
    ];
    
    if (isCommunityAlertEnabled) {
      addLog(`GPS BROADCAST: Exact coordinates sent to 12 nearby users`, "critical");
      newResponders.push({ id: 'c2', type: 'citizen', name: 'Volunteer #88', distance: 400, bearing: 300, eta: 2 });
    }

    setResponders(newResponders);
    addLog("Alerting Local Authorities & Net", "critical");
    if (!isSilentMode) speak("Police units and nearby guardians are responding.");
  }, [addLog, isSilentMode, isCommunityAlertEnabled]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        if (transcript.includes("help") || transcript.includes("sos")) triggerEmergency();
        if (transcript.includes("stop alert")) cancelEmergency();
      };
      recognition.onend = () => isVoiceActive && recognition.start();
      recognitionRef.current = recognition;
    }
  }, [isVoiceActive, triggerEmergency, cancelEmergency]);

  const toggleVoice = () => {
    if (isVoiceActive) {
      recognitionRef.current?.stop();
      setIsVoiceActive(false);
    } else {
      recognitionRef.current?.start();
      setIsVoiceActive(true);
      speak("Voice commands active.");
    }
  };

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: Date.now(),
        accuracy: pos.coords.accuracy
      }),
      (err) => addLog(`GPS: ${err.message}`, 'warning'),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [addLog]);

  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setStatus(AlertStatus.RESCUE_IN_PROGRESS);
      dispatchResponders();
      setCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [countdown, dispatchResponders]);

  return (
    <div className="min-h-screen pb-32 max-w-lg mx-auto p-4 flex flex-col gap-6 select-none">
      {isDecoyActive && <DecoyCall callerName="Dad (Guardian)" onEnd={() => setIsDecoyActive(false)} />}
      {isAddContactOpen && <AddContactModal onAdd={handleAddContact} onClose={() => setIsAddContactOpen(false)} />}
      
      <header className="flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500 p-2 rounded-lg shadow-lg shadow-sky-500/20">
            <i className="fas fa-shield-alt text-white text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">GuardianAngel</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Mission Control</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCommunityAlertEnabled(!isCommunityAlertEnabled)}
            className={`w-10 h-10 rounded-full glass-morphism flex items-center justify-center transition-all ${isCommunityAlertEnabled ? 'bg-sky-500/20 text-sky-400 border border-sky-500/50' : 'text-slate-400'}`}
            title="Toggle Community Broadcast"
          >
            <i className="fas fa-users-rays"></i>
          </button>
          <button 
            onClick={() => setIsSilentMode(!isSilentMode)}
            className={`w-10 h-10 rounded-full glass-morphism flex items-center justify-center transition-all ${isSilentMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-slate-400'}`}
            title="Toggle Silent/Loud Mode"
          >
            <i className={`fas ${isSilentMode ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          </button>
          <button 
            onClick={toggleVoice}
            className={`w-10 h-10 rounded-full glass-morphism flex items-center justify-center transition-all ${isVoiceActive ? 'bg-sky-500/20 text-sky-400 ring-2 ring-sky-500' : 'text-slate-400'}`}
          >
            <i className="fas fa-microphone"></i>
          </button>
        </div>
      </header>

      <div className={`glass-morphism rounded-3xl p-6 transition-all duration-500 ${status === AlertStatus.DANGER ? 'ring-4 ring-red-500 panic-glow' : 'border-slate-800'}`}>
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                status === AlertStatus.SAFE ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400 animate-pulse'
              }`}>
                {status}
              </span>
              <VoiceVisualizer isListening={isVoiceActive} />
            </div>
            <h2 className="text-2xl font-bold mt-2 leading-tight">
              {status === AlertStatus.SAFE ? 'Shield Active' : 'Breach Detected'}
            </h2>
          </div>
          <div className="text-right">
             <p className="text-xs text-slate-500">Mode</p>
             <p className={`text-[10px] font-black uppercase ${isSilentMode ? 'text-amber-500' : 'text-sky-400'}`}>{isSilentMode ? 'Stealth' : 'Tactical'}</p>
          </div>
        </div>

        <SafetyMap location={location} responders={responders} />
        
        <div className="mt-6 flex flex-col gap-4">
          {countdown !== null ? (
            <div className="flex flex-col items-center gap-4 w-full">
              <div className="text-7xl font-black text-red-500 font-mono tracking-tighter">{countdown}</div>
              <p className="text-[10px] text-red-400 font-bold uppercase animate-pulse">
                {isCommunityAlertEnabled ? 'Broadcasting location to nearby users...' : 'Alerting private contacts only'}
              </p>
              <button onClick={cancelEmergency} className="w-full bg-slate-800 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest border border-slate-700">Aborted Signal</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={triggerEmergency} className={`col-span-2 bg-red-600 hover:bg-red-500 text-white font-black py-6 rounded-3xl shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95 ${status === AlertStatus.RESCUE_IN_PROGRESS ? 'hidden' : ''}`}>
                <i className="fas fa-satellite-dish"></i>
                <span className="text-lg uppercase tracking-widest">Broadcasting SOS</span>
              </button>
              <button onClick={() => setIsDecoyActive(true)} className="bg-slate-800 border border-slate-700 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <i className="fas fa-phone"></i> Fake Call
              </button>
              <button onClick={fetchHavens} disabled={searchingHavens} className="bg-slate-800 border border-slate-700 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <i className={`fas ${searchingHavens ? 'fa-spinner fa-spin' : 'fa-map-marker-alt'}`}></i> Havens
              </button>
            </div>
          )}
        </div>
      </div>

      <CameraStream isActive={isCameraActive} />

      {/* Safe Havens List */}
      {safeHavens.length > 0 && (
        <section className="animate-in slide-in-from-bottom duration-500">
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
            Verified Safe Zones
            <button onClick={() => setSafeHavens([])} className="text-[10px] text-sky-400">Clear</button>
           </h3>
           <div className="space-y-2">
             {safeHavens.map((h, i) => (
               <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="block glass-morphism p-4 rounded-2xl border-l-4 border-emerald-500 hover:bg-slate-800/50 transition-colors">
                 <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-slate-100">{h.name}</p>
                    <i className="fas fa-chevron-right text-slate-600 text-xs"></i>
                 </div>
                 <p className="text-[10px] text-emerald-400 mt-1 uppercase font-black">{h.type}</p>
               </a>
             ))}
           </div>
        </section>
      )}

      <section>
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Safety Assistant</h3>
        <SafetyAssistant onTriggerDanger={triggerEmergency} />
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-morphism rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Emergency Contacts</h4>
            <button 
              onClick={() => setIsAddContactOpen(true)}
              className="w-5 h-5 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center hover:bg-sky-500/40 transition-colors"
            >
              <i className="fas fa-plus text-[8px]"></i>
            </button>
          </div>
          <div className="space-y-3">
            {contacts.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-500/10 text-sky-400 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {c.name[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-slate-200 truncate">{c.name}</p>
                  <p className="text-[9px] text-slate-500 uppercase">{c.relation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-morphism rounded-2xl p-4 overflow-hidden">
          <h4 className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tighter">Live Audit Trail</h4>
          <div className="space-y-2 max-h-[100px] overflow-y-auto pr-1 scrollbar-hide">
            {logs.map(l => (
              <div key={l.id} className="text-[9px] border-l-2 border-slate-700 pl-2 py-0.5 leading-tight">
                <span className="text-slate-500 block">{new Date(l.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                <span className={`${l.type === 'critical' ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                  {l.event}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto flex justify-around items-center glass-morphism rounded-[2.5rem] p-4 border border-white/5 pointer-events-auto shadow-2xl">
          <button className="p-3 text-sky-500 flex flex-col items-center">
            <i className="fas fa-home text-lg"></i>
            <span className="text-[9px] font-bold uppercase mt-1">Dash</span>
          </button>
          <button className="p-3 text-slate-500 flex flex-col items-center">
            <i className="fas fa-history text-lg"></i>
            <span className="text-[9px] font-bold uppercase mt-1">Logs</span>
          </button>
          <div className="relative -top-8">
            <button onClick={triggerEmergency} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] border-4 border-slate-900 active:scale-90 transition-transform">
              <i className="fas fa-shield-alt text-white text-xl"></i>
            </button>
          </div>
          <button className="p-3 text-slate-500 flex flex-col items-center">
            <i className="fas fa-user-friends text-lg"></i>
            <span className="text-[9px] font-bold uppercase mt-1">Circle</span>
          </button>
          <button className="p-3 text-slate-500 flex flex-col items-center">
            <i className="fas fa-user-cog text-lg"></i>
            <span className="text-[9px] font-bold uppercase mt-1">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
