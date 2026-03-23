import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Trophy, BarChart3, Scale, Zap, Flame, Calendar, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('workout');
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // --- 1. PORTFOLIO ANALYTICS LOGIC ---
  const getVolumeDistribution = () => {
    const totals = { Push: 0, Pull: 0, Legs: 0 };
    history.forEach(entry => {
      const type = entry.split?.split(' ')[0]; // Matches "Push", "Pull", or "Titan" (Legs)
      const key = type === 'Titan' ? 'Legs' : type;
      if (totals[key] !== undefined) totals[key] += entry.volume || 0;
    });
    
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    return Object.entries(totals).map(([name, val]) => ({
      name,
      value: val,
      percentage: grandTotal ? Math.round((val / grandTotal) * 100) : 0
    }));
  };

  const portfolio = getVolumeDistribution();

  // --- 2. DYNAMIC WORKOUT SPLIT ---
  const getWorkoutForDay = () => {
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
  };

  const currentWorkout = getWorkoutForDay();
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('titan-w-sets-v4')) || {});

  const updateSetWeight = (exId, setIdx, val) => {
    const newWeights = [...(session[exId] || [])];
    newWeights[setIdx] = Math.max(0, parseFloat(val) || 0);
    setSession({ ...session, [exId]: newWeights });
  };

  const calcVol = () => currentWorkout.exercises.reduce((acc, ex) => 
    completed[ex.id] ? acc + (session[ex.id]?.reduce((sum, w) => sum + (w * ex.reps), 0) || 0) : acc, 0
  );

  const saveWorkout = () => {
    const v = calcVol(); if (v === 0) return;
    const entry = { type: 'lift', split: currentWorkout.name, volume: v, calories: Math.round((bodyWeight * 4.2) + (v/1000 * 28)), bw: bodyWeight, ts: new Date().toISOString(), id: Date.now() };
    setHistory([entry, ...history].slice(0, 30));
    localStorage.setItem('titan-h', JSON.stringify([entry, ...history]));
    setShowSummary(true);
  };

  // Haptics & Timer Logic
  useEffect(() => {
    if (timeLeft === 1 && "vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    if (timeLeft > 0) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); }
  }, [timeLeft]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#070707] text-white p-4 font-sans pb-32 selection:bg-orange-500">
      
      {/* 3. THE MUSCLE PORTFOLIO HEADER (HISTORY VIEW ONLY) */}
      {view === 'history' && (
        <div className="bg-[#111] p-6 rounded-[32px] mb-6 border border-zinc-800 shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
            <PieChart size={14} className="text-orange-500" /> Muscle Asset Allocation
          </div>
          <div className="flex items-end justify-around gap-2 h-24 mb-4">
            {portfolio.map((group) => (
              <div key={group.name} className="flex flex-col items-center flex-1 gap-2">
                <div 
                  className={`w-full rounded-t-xl transition-all duration-1000 ${group.name === 'Push' ? 'bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]' : group.name === 'Pull' ? 'bg-cyan-500' : 'bg-zinc-700'}`} 
                  style={{ height: `${Math.max(group.percentage, 10)}%` }}
                ></div>
                <span className="text-[9px] font-black uppercase text-zinc-600 tracking-tighter">{group.name}</span>
                <span className="text-[10px] font-mono font-bold text-white">{group.percentage}%</span>
              </div>
            ))}
          </div>
          {portfolio.some(p => p.percentage > 60) && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-orange-950/20 rounded-xl border border-orange-900/30 text-[9px] text-orange-400 font-bold uppercase italic">
              <AlertCircle size={12} /> Portfolio Overweight: Adjust Split Balance
            </div>
          )}
        </div>
      )}

      {/* Main Stats Header */}
      <div className="bg-[#111] p-6 rounded-[32px] mb-6 border border-zinc-800 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-600/20 flex items-center justify-center text-orange-500"><Zap size={24} fill="currentColor"/></div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{new Date().toLocaleDateString('en-GB', { weekday: 'long' })}</p>
            <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{currentWorkout.name}</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest leading-none mb-1">Mass Target</p>
          <p className="text-xl font-black italic text-cyan-400">93.0kg</p>
        </div>
      </div>

      <nav className="flex bg-[#111] rounded-2xl p-1 mb-8 border border-zinc-800 sticky top-4 z-30 shadow-2xl backdrop-blur-md">
        <button onClick={()=>setView('workout')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='workout'?'bg-orange-600 text-white shadow-lg shadow-orange-900/40':'text-zinc-500'}`}>The Protocol</button>
        <button onClick={()=>setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='history'?'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40':'text-zinc-500'}`}>Logbook</button>
      </nav>

      {view === 'workout' && (
        <div className="space-y-6">
          {currentWorkout.exercises.length > 0 ? (
            currentWorkout.exercises.map((ex) => (
              <div key={ex.id} className={`rounded-[32px] border transition-all duration-300 ${completed[ex.id] ? 'opacity-30 bg-black border-zinc-900' : 'bg-[#111] border-zinc-800 shadow-lg'}`}>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6" onClick={()=>{setCompleted({...completed,[ex.id]:!completed[ex.id]}); if(!completed[ex.id]) setTimeLeft(60);}}>
                     <div className="flex gap-4 items-center">
                        <div className={`h-10 w-10 rounded-2xl border-2 flex items-center justify-center transition-all ${completed[ex.id]?'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/30':'border-zinc-700'}`}>{completed[ex.id]&&<CheckCircle size={20}/>}</div>
                        <h3 className="font-black text-sm uppercase italic tracking-tighter leading-none">{ex.name}</h3>
                     </div>
                  </div>
                  <div className="space-y-3">
                    {(session[ex.id] || Array(ex.sets).fill(40)).map((weight, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-black/50 p-2 rounded-2xl border border-zinc-900">
                        <span className="text-[10px] font-black text-zinc-700 w-10 text-center italic">SET {idx+1}</span>
                        <div className="flex-1 flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800 px-2">
                          <input type="number" step="0.1" value={weight} onChange={(e) => updateSetWeight(ex.id, idx, e.target.value)} className="w-full bg-transparent text-center font-mono font-black italic text-lg text-orange-500 focus:outline-none py-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
             <div className="bg-[#111] p-10 rounded-[40px] border border-zinc-800 text-center space-y-4">
                <p className="font-black italic uppercase text-zinc-500">Active Recovery Only</p>
             </div>
          )}
          {currentWorkout.exercises.length > 0 && <button onClick={saveWorkout} className="w-full bg-orange-600 text-white py-6 rounded-[32px] font-black uppercase italic tracking-tighter shadow-2xl shadow-orange-900/30 active:scale-95 transition-all">Submit Session</button>}
        </div>
      )}

      {view === 'history' && (
        <div className="space-y-3 animate-in slide-in-from-bottom duration-500">
          {history.length > 0 ? history.map(e => (
            <div key={e.id} className="bg-[#111] border border-zinc-900 p-5 rounded-[24px] flex justify-between items-center group active:scale-[0.98] transition-all">
              <div>
                <p className="text-[9px] text-zinc-600 font-black mb-1 uppercase italic tracking-widest">{e.split}</p>
                <p className="text-xl font-black italic text-white tracking-tighter">{e.volume?.toLocaleString()}<span className="text-xs text-cyan-500 ml-1">kg</span></p>
              </div>
              <div className="text-right">
                <div className="text-orange-500 font-black italic text-xl flex items-center gap-1 leading-none"><Flame size={16} fill="currentColor" />{e.calories}</div>
                <span className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Kcal Destroyed</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 opacity-20 italic font-black uppercase tracking-[0.4em]">Empty Portfolio</div>
          )}
        </div>
      )}

      {/* Modern Floating Timer with Pulse */}
      {timeLeft > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white text-black rounded-[24px] px-10 py-5 shadow-2xl flex items-center gap-6 z-50 font-mono font-black italic text-5xl tracking-tighter border-4 border-black animate-pulse">
          <Clock size={32} /> {timeLeft}
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-6 text-center animate-in zoom-in duration-300">
          <div className="bg-[#111] border border-orange-600/30 rounded-[48px] p-10 w-full shadow-[0_0_80px_rgba(234,88,12,0.1)]">
            <Trophy size={60} className="text-cyan-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <h2 className="text-3xl font-black italic uppercase text-white leading-tight">Titan Session<br/>Submitted</h2>
            <div className="my-8 py-6 bg-black rounded-3xl border border-zinc-800">
              <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-1 italic">Total Tonnage</p>
              <p className="text-5xl font-mono font-black italic text-cyan-400 leading-none">{calcVol().toLocaleString()}kg</p>
            </div>
            <button onClick={()=>{setShowSummary(false);setCompleted({});setView('history');}} className="w-full bg-white text-black font-black py-5 rounded-[24px] uppercase italic tracking-tighter active:scale-95 transition-all">Review Distribution</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
