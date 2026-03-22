import React, { useState, useEffect } from 'react';
import { Plus, Minus, CheckCircle, Clock, RotateCcw, TrendingUp, Trophy, BarChart3, Target, Dumbbell, Flame, Scale } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('workout'); 
  const [weeklyGoal] = useState(12000); 
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [minWeight, setMinWeight] = useState(() => JSON.parse(localStorage.getItem('titan-min-bw') || '93.0'));
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('titan-w') || '{"A1":80,"A2":40,"B1":45,"B2":35,"C1":35,"C2":10}'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const workout = [
    { id: "A1", name: "Leg Press", sets: 3, reps: 10, goal: "80-100kg" },
    { id: "A2", name: "Lat Pulldown", sets: 3, reps: 12, goal: "40-50kg" },
    { id: "B1", name: "Chest Press", sets: 3, reps: 10, goal: "45-55kg" },
    { id: "B2", name: "Seated Leg Curl", sets: 3, reps: 15, goal: "35-45kg" },
    { id: "C1", name: "Cable Row", sets: 3, reps: 12, goal: "35-45kg" },
    { id: "C2", name: "DB Shoulder Press", sets: 3, reps: 12, goal: "10-12kg" }
  ];

  const adjustBW = (v) => {
    const n = Math.round((bodyWeight + v) * 10) / 10;
    setBodyWeight(n);
    if (n < minWeight) { setMinWeight(n); localStorage.setItem('titan-min-bw', n); }
    localStorage.setItem('titan-bw', n);
  };

  const calcVol = () => workout.reduce((a, e) => completed[e.id] ? a + (session[e.id] * e.sets * e.reps) : a, 0);
  
  const save = () => {
    const v = calcVol(); if (v === 0) return;
    const entry = { date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short'}), volume: v, calories: Math.round((bodyWeight * 4.2) + (v/1000 * 28)), bw: bodyWeight, ts: new Date().toISOString(), id: Date.now() };
    const h = [entry, ...history].slice(0, 15);
    setHistory(h); localStorage.setItem('titan-h', JSON.stringify(h));
    setShowSummary(true);
  };

  useEffect(() => { localStorage.setItem('titan-w', JSON.stringify(session)); }, [session]);
  useEffect(() => { if (timeLeft > 0) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); } }, [timeLeft]);

  const weeklyProg = history.filter(h => new Date(h.ts) >= new Date(new Date().setDate(new Date().getDate() - new Date().getDay()))).reduce((a, h) => a + h.volume, 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-zinc-100 p-4 font-sans pb-32">
      <div className="bg-zinc-900 p-6 rounded-[32px] mb-6 border border-zinc-800 shadow-2xl">
        <div className="flex justify-between items-center mb-4 text-[10px] font-black uppercase text-zinc-500 italic tracking-widest">
          <span>Weekly: {(weeklyProg/1000).toFixed(1)}T / 12T</span>
          <span className="text-blue-500">{bodyWeight}KG</span>
        </div>
        <div className="h-2 bg-black rounded-full overflow-hidden border border-zinc-800 mb-6">
          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Math.min((weeklyProg/12000)*100, 100)}%` }}></div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
          <div className="flex items-center gap-2"><Scale size={16} className="text-blue-500"/><span className="text-xl font-black italic">{bodyWeight}</span></div>
          <div className="flex gap-2">
            <button onClick={()=>adjustBW(-0.1)} className="w-10 h-10 bg-black rounded-xl border border-zinc-800 font-bold">-0.1</button>
            <button onClick={()=>adjustBW(0.1)} className="w-10 h-10 bg-black rounded-xl border border-zinc-800 font-bold">+0.1</button>
          </div>
        </div>
      </div>

      <nav className="flex bg-zinc-900 rounded-2xl p-1 mb-6 border border-zinc-800 sticky top-4 z-30 shadow-xl">
        <button onClick={()=>setView('workout')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${view==='workout'?'bg-blue-600':'text-zinc-500'}`}>Train</button>
        <button onClick={()=>setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${view==='history'?'bg-blue-600':'text-zinc-500'}`}>Progress</button>
      </nav>

      {view === 'workout' ? (
        <div className="space-y-4">
          {workout.map((ex) => (
            <div key={ex.id} className={`rounded-[32px] border-2 transition-all ${completed[ex.id] ? 'opacity-40 bg-zinc-950 border-blue-900/20' : 'bg-zinc-900 border-zinc-800'}`}>
              <div className="p-6">
                <div className="flex gap-4 mb-5" onClick={()=>{setCompleted({...completed,[ex.id]:!completed[ex.id]}); if(!completed[ex.id]) setTimeLeft(60);}}>
                  <div className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center ${completed[ex.id]?'bg-blue-600 border-blue-600':'border-zinc-700'}`}>{completed[ex.id]&&<CheckCircle size={18}/>}</div>
                  <div><h3 className="font-black text-sm uppercase italic leading-none">{ex.name}</h3><p className="text-[10px] text-zinc-500 font-bold uppercase mt-1.5">{ex.sets}x{ex.reps} • {ex.goal}</p></div>
                </div>
                <div className="flex items-center justify-between bg-black rounded-[24px] p-2 border border-zinc-800">
                  <button onClick={()=>setSession({...session,[ex.id]:Math.max(0,session[ex.id]-2.5)})} className="w-14 h-12 bg-zinc-900 rounded-2xl font-bold">-</button>
                  <div className="text-center font-mono font-black italic"><span className="text-2xl">{session[ex.id]}</span><span className="text-xs text-blue-500 block uppercase">kg</span></div>
                  <button onClick={()=>setSession({...session,[ex.id]:session[ex.id]+2.5})} className="w-14 h-12 bg-zinc-900 rounded-2xl font-bold">+</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={save} className="w-full mt-10 bg-blue-600 py-6 rounded-[32px] font-black uppercase italic tracking-tighter shadow-2xl shadow-blue-900/40">Log Session</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 text-center">
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-2 italic tracking-widest">Weight PB</p>
            <p className="text-6xl font-black italic">{minWeight}<span className="text-xl text-blue-500 ml-1">KG</span></p>
          </div>
          {history.map(e => (
            <div key={e.id} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-[32px] flex justify-between">
              <div><p className="text-[10px] text-zinc-600 font-black mb-1">{e.date}</p><p className="text-xl font-black italic">{e.volume.toLocaleString()}kg</p><p className="text-[9px] text-zinc-600 uppercase font-bold">At {e.bw}kg BW</p></div>
              <div className="text-right text-rose-500 font-black italic text-xl"><Flame size={16} fill="currentColor" className="inline mb-1 mr-1"/>{e.calories}</div>
            </div>
          ))}
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-6 text-center">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[48px] p-10 w-full">
            <Trophy size={60} className="text-blue-500 mx-auto mb-6" />
            <h2 className="text-3xl font-black italic uppercase">Logged</h2>
            <p className="text-5xl font-mono font-black italic text-blue-500 mt-6">{calcVol().toLocaleString()}kg</p>
            <button onClick={()=>{setShowSummary(false);setCompleted({});setView('history');}} className="w-full mt-12 bg-white text-black font-black py-5 rounded-3xl uppercase italic">Analyze</button>
          </div>
        </div>
      )}

      {timeLeft > 0 && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full px-12 py-5 shadow-2xl flex items-center gap-5 border-4 border-black z-50 animate-pulse font-mono font-black italic text-4xl">{timeLeft}</div>}
    </div>
  );
};

export default TitanTracker;
