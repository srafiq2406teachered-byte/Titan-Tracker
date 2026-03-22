import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, CheckCircle, Clock, TrendingUp, Trophy, BarChart3, Target, Dumbbell, Flame, Scale, Zap, Activity, Heart, Edit3 } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('workout'); 
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [minWeight, setMinWeight] = useState(() => JSON.parse(localStorage.getItem('titan-min-bw') || '93.0'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [heartRate, setHeartRate] = useState(135);

  const workout = [
    { id: "A1", name: "Leg Press", sets: 3, reps: 10 },
    { id: "A2", name: "Lat Pulldown", sets: 3, reps: 12 },
    { id: "B1", name: "Chest Press", sets: 3, reps: 10 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, reps: 15 },
    { id: "C1", name: "Cable Row", sets: 3, reps: 12 },
    { id: "C2", name: "DB Shoulder Press", sets: 3, reps: 12 }
  ];

  // Initialize Session: Pre-fill with Ghost Weights or Defaults
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('titan-w-sets');
    if (saved) return JSON.parse(saved);
    
    // Default fallback if no history
    const defaults = { A1: 80, A2: 40, B1: 45, B2: 35, C1: 35, C2: 10 };
    const initial = {};
    
    workout.forEach(ex => {
      const prevSession = JSON.parse(localStorage.getItem('titan-h') || '[]')[0];
      const prevWeights = prevSession?.sessionData?.[ex.id];
      // Pre-fill each set with previous data or default
      initial[ex.id] = prevWeights || Array(ex.sets).fill(defaults[ex.id]);
    });
    return initial;
  });

  useEffect(() => { localStorage.setItem('titan-w-sets', JSON.stringify(session)); }, [session]);

  const updateSetWeight = (exId, setIdx, val) => {
    const newWeights = [...session[exId]];
    newWeights[setIdx] = Math.max(0, Math.round((parseFloat(val) || 0) * 10) / 10);
    setSession({ ...session, [exId]: newWeights });
  };

  const adjustSetWeight = (exId, setIdx, delta) => {
    const newWeights = [...session[exId]];
    newWeights[setIdx] = Math.max(0, (newWeights[setIdx] || 0) + delta);
    setSession({ ...session, [exId]: newWeights });
  };

  const calcVol = () => workout.reduce((acc, ex) => {
    if (!completed[ex.id]) return acc;
    const exVolume = session[ex.id].reduce((sum, w) => sum + (w * ex.reps), 0);
    return acc + exVolume;
  }, 0);

  const save = () => {
    const v = calcVol(); if (v === 0) return;
    const entry = { 
      date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short'}), 
      volume: v, 
      calories: Math.round((bodyWeight * 4.2) + (v/1000 * 28)), 
      bw: bodyWeight,
      hr: heartRate,
      sessionData: session,
      ts: new Date().toISOString(), 
      id: Date.now() 
    };
    setHistory([entry, ...history].slice(0, 30));
    localStorage.setItem('titan-h', JSON.stringify([entry, ...history]));
    setShowSummary(true);
  };

  useEffect(() => { if (timeLeft > 0) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); } }, [timeLeft]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#070707] text-white p-4 font-sans pb-32">
      {/* Activity Bar */}
      <div className="flex justify-center gap-1.5 mb-6 px-2 opacity-60">
        {[...Array(14)].map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (13 - i));
          const active = history.some(h => new Date(h.ts).toDateString() === d.toDateString());
          return <div key={i} className={`h-1.5 flex-1 rounded-full ${active ? 'bg-orange-500 shadow-[0_0_8px_orange]' : 'bg-zinc-800'}`}></div>
        })}
      </div>

      <nav className="flex bg-[#111] rounded-2xl p-1 mb-6 border border-zinc-800 sticky top-4 z-30 shadow-2xl">
        <button onClick={()=>setView('workout')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='workout'?'bg-orange-600 text-white':'text-zinc-500'}`}>Train</button>
        <button onClick={()=>setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='history'?'bg-cyan-600 text-white':'text-zinc-500'}`}>History</button>
      </nav>

      {view === 'workout' ? (
        <div className="space-y-6">
          {workout.map((ex) => (
            <div key={ex.id} className={`rounded-[32px] border transition-all duration-300 ${completed[ex.id] ? 'opacity-30 bg-black border-zinc-900' : 'bg-[#111] border-zinc-800'}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6" onClick={()=>{setCompleted({...completed,[ex.id]:!completed[ex.id]}); if(!completed[ex.id]) setTimeLeft(60);}}>
                   <div className="flex gap-4 items-center">
                      <div className={`h-10 w-10 rounded-2xl border-2 flex items-center justify-center transition-all ${completed[ex.id]?'bg-orange-500 border-orange-500':'border-zinc-700'}`}>{completed[ex.id]&&<CheckCircle size={20}/>}</div>
                      <h3 className="font-black text-sm uppercase italic tracking-tighter">{ex.name}</h3>
                   </div>
                   <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{ex.reps} REPS</span>
                </div>

                {/* Individual Set Controls */}
                <div className="space-y-3">
                  {session[ex.id].map((weight, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-black/50 p-2 rounded-2xl border border-zinc-900">
                      <span className="text-[10px] font-black text-zinc-700 w-8 text-center italic">SET {idx+1}</span>
                      <button onClick={()=>adjustSetWeight(ex.id, idx, -2.5)} className="w-10 h-10 bg-zinc-900 rounded-xl font-bold border border-zinc-800">-</button>
                      <div className="flex-1 flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden px-2">
                        <input 
                          type="number" 
                          step="0.1"
                          value={weight} 
                          onChange={(e) => updateSetWeight(ex.id, idx, e.target.value)}
                          className="w-full bg-transparent text-center font-mono font-black italic text-lg text-orange-500 focus:outline-none py-1"
                        />
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter">kg</span>
                      </div>
                      <button onClick={()=>adjustSetWeight(ex.id, idx, 2.5)} className="w-10 h-10 bg-zinc-900 rounded-xl font-bold border border-zinc-800">+</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-[#111] p-6 rounded-[32px] border border-zinc-800">
            <div className="flex justify-between mb-4"><span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic flex items-center gap-2"><Scale size={14}/> Body Weight</span><span className="font-black italic text-cyan-400">{bodyWeight}kg</span></div>
            <div className="flex gap-2">
              <button onClick={()=>setBodyWeight(Math.round((bodyWeight-0.1)*10)/10)} className="flex-1 bg-zinc-900 py-3 rounded-xl border border-zinc-800 font-bold">- 0.1</button>
              <button onClick={()=>setBodyWeight(Math.round((bodyWeight+0.1)*10)/10)} className="flex-1 bg-zinc-900 py-3 rounded-xl border border-zinc-800 font-bold">+ 0.1</button>
            </div>
          </div>

          <button onClick={save} className="w-full mt-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-6 rounded-[32px] font-black uppercase italic tracking-tighter shadow-2xl shadow-orange-600/30 active:scale-95 transition-all">End Protocol</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#111] p-8 rounded-[40px] border border-zinc-800 text-center">
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-2 italic tracking-[0.3em]">Mass PB</p>
            <p className="text-7xl font-black italic text-cyan-500 leading-none">{minWeight}<span className="text-xl text-zinc-300 ml-1">KG</span></p>
          </div>
          {history.map(e => (
            <div key={e.id} className="bg-[#111] border border-zinc-900 p-6 rounded-[32px] flex justify-between items-center group">
              <div>
                <p className="text-[10px] text-zinc-600 font-black mb-1 uppercase tracking-widest">{e.date}</p>
                <p className="text-2xl font-black italic text-white tracking-tighter">{e.volume.toLocaleString()}<span className="text-xs text-cyan-500 ml-1">kg</span></p>
                <p className="text-[9px] text-zinc-700 uppercase font-bold mt-2">Weight: {e.bw}kg</p>
              </div>
              <div className="text-right">
                <div className="text-orange-500 font-black italic text-2xl flex items-center justify-end gap-1 mb-1 leading-none"><Flame size={18} fill="currentColor" />{e.calories}</div>
                <span className="text-[8px] text-zinc-700 font-black uppercase">kcal Burned</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timer Overlay */}
      {timeLeft > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black rounded-3xl px-12 py-5 shadow-2xl flex items-center gap-6 z-50 font-mono font-black italic text-5xl tracking-tighter border-4 border-black animate-pulse">
          <Clock size={32} /> {timeLeft}
        </div>
      )}

      {/* Success Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 text-center animate-in zoom-in duration-300">
          <div className="bg-[#111] border border-zinc-800 rounded-[48px] p-10 w-full">
            <Trophy size={60} className="text-cyan-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black italic uppercase text-white leading-none">Mission<br/>Complete</h2>
            <p className="text-5xl font-mono font-black italic text-cyan-400 mt-8 leading-none">{calcVol().toLocaleString()}kg</p>
            <p className="text-orange-500 font-black italic text-xl mt-4 tracking-widest leading-none">+{Math.round((bodyWeight * 4.2) + (calcVol()/1000 * 28))} KCAL</p>
            <button onClick={()=>{setShowSummary(false);setCompleted({});setView('history');}} className="w-full mt-12 bg-white text-black font-black py-5 rounded-[24px] uppercase italic tracking-tighter">View Trends</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
