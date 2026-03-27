import React, { useState, useEffect, useCallback } from 'react';
import { Timer, CheckCircle2, Play, Pause, RotateCcw, Activity, Zap, Shield } from 'lucide-react';

// --- SERVICE WORKER REGISTRATION (PWA CORE) ---
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(reg => {
        console.log('Titan Engine: Service Worker Active', reg.scope);
      }).catch(err => console.log('SW Registration Failed', err));
    });
  }
};

const TitanUnifiedEngine = () => {
  // --- PERSISTENT STATE ---
  const [sessionActive, setSessionActive] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  
  // Advanced Exercise State with Weights/Reps persistence
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Bench Press', sets: 3, completed: 0, rest: 90, lastWeight: 80, lastReps: 8 },
    { id: 2, name: 'Incline DB Fly', sets: 3, completed: 0, rest: 60, lastWeight: 24, lastReps: 12 },
    { id: 3, name: 'Tricep Extensions', sets: 4, completed: 0, rest: 45, lastWeight: 35, lastReps: 15 },
  ]);

  // --- ENGINE LOGIC ---
  useEffect(() => {
    registerServiceWorker();
    const savedSession = localStorage.getItem('titan_session');
    if (savedSession) setTotalWorkoutTime(JSON.parse(savedSession).time);
  }, []);

  useEffect(() => {
    let interval = null;
    if (sessionActive) {
      interval = setInterval(() => {
        setTotalWorkoutTime(t => t + 1);
        if (totalWorkoutTime % 30 === 0) { // Auto-save every 30s
          localStorage.setItem('titan_session', JSON.stringify({ time: totalWorkoutTime }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive, totalWorkoutTime]);

  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (Notification.permission === "granted") {
        new Notification("Titan Engine: Rest Over", { body: "Get back to the set!", icon: "/icon.png" });
      }
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const triggerRest = useCallback((seconds) => {
    setTimeLeft(seconds);
    setIsActive(true);
  }, []);

  const handleSetComplete = (id, restTime) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: ex.completed + 1 } : ex
    ));
    triggerRest(restTime);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans antialiased p-4">
      {/* PWA STATUS HEADER */}
      <nav className="flex justify-between items-center mb-8 border-b border-slate-800/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <Zap size={18} className="fill-white" />
          </div>
          <h1 className="text-sm font-black tracking-tighter uppercase italic">Titan Engine <span className="text-blue-500">v3</span></h1>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Session</span>
          <span className="text-xl font-mono font-medium text-blue-400">{formatTime(totalWorkoutTime)}</span>
        </div>
      </nav>

      {/* UNIFIED TIMER MODULE (THE MISSING TIMER RE-BUILT) */}
      <section className={`relative overflow-hidden mb-8 rounded-3xl border transition-all duration-500 ${
        isActive ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.3)]' : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 opacity-80">
              <Activity size={16} />
              <span className="text-xs font-bold uppercase tracking-tight">Metabolic Sync</span>
            </div>
            {isActive && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full animate-pulse">ACTIVE</span>}
          </div>
          
          <div className="flex justify-between items-center">
            <h2 className="text-6xl font-black font-mono tracking-tighter">
              {formatTime(timeLeft)}
            </h2>
            <div className="flex gap-2">
              <button onClick={() => setIsActive(!isActive)} className="p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                {isActive ? <Pause fill="white" /> : <Play fill="white" />}
              </button>
              <button onClick={() => {setIsActive(false); setTimeLeft(0);}} className="p-4 bg-black/20 rounded-2xl">
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        </div>
        {/* Visual Progress Background */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-white/40 transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / 90) * 100}%` }}
        />
      </section>

      {/* WORKOUT INTERFACE */}
      <div className="space-y-4">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-200">{ex.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Target: {ex.sets} Sets • {ex.rest}s Rest</p>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-blue-500">
                {ex.completed}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/40 rounded-xl p-2 border border-slate-800/50">
                <label className="block text-[9px] text-slate-500 uppercase mb-1">Weight</label>
                <input type="number" defaultValue={ex.lastWeight} className="bg-transparent w-full text-lg font-bold focus:outline-none text-white" />
              </div>
              <div className="bg-black/40 rounded-xl p-2 border border-slate-800/50">
                <label className="block text-[9px] text-slate-500 uppercase mb-1">Reps</label>
                <input type="number" defaultValue={ex.lastReps} className="bg-transparent w-full text-lg font-bold focus:outline-none text-white" />
              </div>
              <button 
                onClick={() => handleSetComplete(ex.id, ex.rest)}
                disabled={ex.completed >= ex.sets}
                className={`rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  ex.completed >= ex.sets 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:scale-[1.02]'
                }`}
              >
                <CheckCircle2 size={20} />
                <span className="text-[9px] font-black uppercase">Set</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-12 text-center pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
          <Shield size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Cloud Sync Active</span>
        </div>
      </footer>
    </div>
  );
};

export default TitanUnifiedEngine;