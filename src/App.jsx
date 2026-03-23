import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, Clock, Trophy, BarChart3, Scale, Zap, 
  Flame, Calendar, PieChart, AlertCircle, ZapOff, TrendingUp 
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE STATE ---
  const [view, setView] = useState('workout'); 
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // --- 2. DYNAMIC TITAN PROTOCOLS (By Day) ---
  const currentWorkout = useMemo(() => {
    const day = new Date().getDay(); 
    const splits = {
      1: { name: "Push Alpha", type: "Push", exercises: [{ id: "P1", name: "Chest Press", sets: 3, reps: 10 }, { id: "P2", name: "DB Shoulder Press", sets: 3, reps: 12 }] },
      2: { name: "Pull Alpha", type: "Pull", exercises: [{ id: "L1", name: "Lat Pulldown", sets: 3, reps: 12 }, { id: "L2", name: "Cable Row", sets: 3, reps: 12 }] },
      3: { name: "Titan Legs", type: "Legs", exercises: [{ id: "A1", name: "Leg Press", sets: 4, reps: 10 }, { id: "B2", name: "Seated Leg Curl", sets: 3, reps: 15 }] },
      4: { name: "Push Beta", type: "Push", exercises: [{ id: "P1", name: "Chest Press", sets: 4, reps: 8 }, { id: "P5", name: "Dips", sets: 3, reps: 10 }] },
      5: { name: "Pull Beta", type: "Pull", exercises: [{ id: "L4", name: "Pull Ups", sets: 3, reps: 8 }, { id: "L6", name: "Hammer Curls", sets: 3, reps: 12 }] },
      6: { name: "Titan Legs", type: "Legs", exercises: [{ id: "A1", name: "Leg Press", sets: 3, reps: 12 }, { id: "G2", name: "Leg Extensions", sets: 3, reps: 15 }] },
      0: { name: "Rest & Recovery", type: "Rest", exercises: [] }
    };
    return splits[day] || splits[0];
  }, []);

  // --- 3. GHOST WEIGHTS & SESSION STATE ---
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('titan-w-sets-v5');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const newSession = { ...session };
    let needsUpdate = false;
    currentWorkout.exercises.forEach(ex => {
      if (!newSession[ex.id]) {
        const lastEntry = history.find(h => h.sessionData?.[ex.id])?.sessionData?.[ex.id];
        newSession[ex.id] = lastEntry || Array(ex.sets).fill(40);
        needsUpdate = true;
      }
    });
    if (needsUpdate) setSession(newSession);
  }, [currentWorkout, history]);

  // --- 4. ANALYTICS: MUSCLE PORTFOLIO ---
  const portfolio = useMemo(() => {
    const totals = { Push: 0, Pull: 0, Legs: 0 };
    history.slice(0, 15).forEach(entry => {
      const type = entry.split?.split(' ')[0];
      const key = type === 'Titan' ? 'Legs' : type;
      if (totals[key] !== undefined) totals[key] += entry.volume || 0;
    });
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    return Object.entries(totals).map(([name, val]) => ({
      name,
      value: val,
      percent: grandTotal ? Math.round((val / grandTotal) * 100) : 0
    }));
  }, [history]);

  // --- 5. LOGIC HANDLERS (FIXED) ---
  const updateWeight = (exId, sIdx, val) => {
    const updated = [...(session[exId] || [])];
    updated[sIdx] = parseFloat(val) || 0;
    setSession({ ...session, [exId]: updated });
  };

  const calcVol = () => currentWorkout.exercises.reduce((acc, ex) => 
    completed[ex.id] ? acc + (session[ex.id]?.reduce((sum, w) => sum + (w * ex.reps), 0) || 0) : acc, 0
  );

  const saveSession = () => {
    const volume = calcVol(); if (volume === 0) return;
    const calories = Math.round((bodyWeight * 4.2) + (volume / 1000 * 28));
    const entry = { 
      id: Date.now(), type: 'lift', split: currentWorkout.name, 
      volume, calories, bw: bodyWeight, ts: new Date().toISOString(),
      sessionData: session, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    };
    const newHistory = [entry, ...history].slice(0, 30);
    setHistory(newHistory);
    localStorage.setItem('titan-h', JSON.stringify(newHistory));
    localStorage.setItem('titan-w-sets-v5', JSON.stringify(session));
    setShowSummary(true);
  };

  // --- 6. HAPTICS & TIMER ---
  useEffect(() => {
    if (timeLeft === 1 && "vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#070707] text-white p-4 font-sans pb-32">
      
      {/* HEADER */}
      <div className="bg-[#111] p-6 rounded-[32px] mb-6 border border-zinc-800 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-600/20 flex items-center justify-center text-orange-500"><Zap size={24} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest leading-none mb-1 italic">Protocol</p>
            <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{currentWorkout.name}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest leading-none mb-1 italic">Titan Mass</p>
          <p className="text-xl font-black italic text-cyan-400">{bodyWeight}kg</p>
        </div>
      </div>

      <nav className="flex bg-[#111] rounded-2xl p-1 mb-8 border border-zinc-800 sticky top-4 z-30 shadow-2xl backdrop-blur-md">
        <button onClick={()=>setView('workout')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='workout'?'bg-orange-600 text-white shadow-lg':'text-zinc-500'}`}>The Protocol</button>
        <button onClick={()=>setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='history'?'bg-cyan-600 text-white shadow-lg':'text-zinc-500'}`}>Logbook</button>
      </nav>

      {view === 'workout' ? (
        <div className="space-y-6">
          {currentWorkout.exercises.length > 0 ? (
            currentWorkout.exercises.map((ex) => (
              <div key={ex.id} className={`rounded-[32px] border transition-all duration-300 ${completed[ex.id] ? 'opacity-30 bg-black border-zinc-900 shadow-none' : 'bg-[#111] border-zinc-800 shadow-xl'}`}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6" onClick={()=>{setCompleted({...completed,[ex.id]:!completed[ex.id]}); if(!completed[ex.id]) setTimeLeft(60);}}>
                     <div className="flex gap-4 items-center">
                        <div className={`h-10 w-10 rounded-2xl border-2 flex items-center justify-center transition-all ${completed[ex.id]?'bg-orange-500 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]':'border-zinc-700'}`}>{completed[ex.id]&&<CheckCircle size={20}/>}</div>
                        <h3 className="font-black text-sm uppercase italic tracking-tighter leading-none">{ex.name}</h3>
                     </div>
                  </div>
                  <div className="space-y-3">
                    {session[ex.id]?.map((weight, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-black/50 p-2 rounded-2xl border border-zinc-900 focus-within:border-orange-500/50 transition-colors">
                        <span className="text-[10px] font-black text-zinc-700 w-10 text-center italic leading-none">SET {idx+1}</span>
                        <div className="flex-1 flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800 px-2">
                          <input type="number" step="0.1" value={weight} onChange={(e) => updateWeight(ex.id, idx, e.target.value)} className="w-full bg-transparent text-center font-mono font-black italic text-lg text-orange-500 focus:outline-none py-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="bg-[#111] p-12 rounded-[40px] border border-zinc-800 text-center space-y-4">
                <ZapOff size={48} className="mx-auto text-zinc-800" />
                <p className="font-black italic uppercase text-zinc-600 tracking-widest">Active Recovery Only</p>
             </div>
          )}
          {currentWorkout.exercises.length > 0 && (
            <button onClick={saveSession} className="w-full bg-orange-600 text-white py-6 rounded-[32px] font-black uppercase italic tracking-tighter shadow-2xl shadow-orange-900/30 active:scale-95 transition-all">Submit Protocol</button>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
          <div className="bg-[#111] p-6 rounded-[32px] border border-zinc-800">
            <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              <PieChart size={14} className
