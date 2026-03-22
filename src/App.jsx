import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, CheckCircle, Clock, TrendingUp, Trophy, BarChart3, Target, Dumbbell, Flame, Scale, Zap, Activity, Heart } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('workout'); 
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [minWeight, setMinWeight] = useState(() => JSON.parse(localStorage.getItem('titan-min-bw') || '93.0'));
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('titan-w') || '{"A1":80,"A2":40,"B1":45,"B2":35,"C1":35,"C2":10}'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [heartRate, setHeartRate] = useState(135);

  // 1. WAKE LOCK: Keep screen on during workout
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try { if ('wakeLock' in navigator && view === 'workout') { wakeLock = await navigator.wakeLock.request('screen'); } } 
      catch (err) { console.error(err); }
    };
    requestWakeLock();
    return () => { if (wakeLock !== null) wakeLock.release().then(() => { wakeLock = null; }); };
  }, [view]);

  const workout = [
    { id: "A1", name: "Leg Press", sets: 3, reps: 10, goal: "80-100kg" },
    { id: "A2", name: "Lat Pulldown", sets: 3, reps: 12, goal: "40-50kg" },
    { id: "B1", name: "Chest Press", sets: 3, reps: 10, goal: "45-55kg" },
    { id: "B2", name: "Seated Leg Curl", sets: 3, reps: 15, goal: "35-45kg" },
    { id: "C1", name: "Cable Row", sets: 3, reps: 12, goal: "35-45kg" },
    { id: "C2", name: "DB Shoulder Press", sets: 3, reps: 12, goal: "10-12kg" }
  ];

  // 2. GHOST LIFT: Get the last recorded weight for each exercise
  const getPrevLift = (id) => {
    if (history.length === 0) return null;
    return history[0].sessionData?.[id] || null;
  };

  const adjustBW = (v) => {
    const n = Math.round((bodyWeight + v) * 10) / 10;
    setBodyWeight(n);
    if (n < minWeight) { setMinWeight(n); localStorage.setItem('titan-min-bw', n); }
    localStorage.setItem('titan-bw', n);
  };

  const calcVol = () => workout.reduce((a, e) => completed[e.id] ? a + (session[e.id] * e.sets * e.reps) : a, 0);
  
  const save = () => {
    const v = calcVol(); if (v === 0) return;
    const entry = { 
      date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short'}), 
      volume: v, 
      calories: Math.round((bodyWeight * 4.2) + (v/1000 * 28)), 
      bw: bodyWeight,
      hr: heartRate,
      sessionData: session, // Saving ghost data for next time
      ts: new Date().toISOString(), 
      id: Date.now() 
    };
    const h = [entry, ...history].slice(0, 30);
    setHistory(h); localStorage.setItem('titan-h', JSON.stringify(h));
    setShowSummary(true);
  };

  useEffect(() => { localStorage.setItem('titan-w', JSON.stringify(session)); }, [session]);
  useEffect(() => { if (timeLeft > 0) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); } }, [timeLeft]);

  const weeklyProg = history.filter(h => new Date(h.ts) >= new Date(new Date().setDate(new Date().getDate() - new Date().getDay()))).reduce((a, h) => a + h.volume, 0);

  // 3. HEAT MAP LOGIC: Create 14-day activity grid
  const last14Days = [...Array(14)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const hasData = history.some(h => new Date(h.ts).toDateString() === d.toDateString());
    return { date: d, active: hasData };
  });

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#070707] text-white p-4 font-sans pb-32">
      {/* 4. ACTIVITY HEAT MAP COMPONENT */}
      <div className="flex justify-center gap-1.5 mb-6 px-2">
        {last14Days.map((day, i) => (
          <div key={i} className={`h-2.5 flex-1 rounded-sm border ${day.active ? 'bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(234,88,12,0.4)]' : 'bg-zinc-900 border-zinc-800'}`}></div>
        ))}
      </div>

      <div className="bg-[#111] p-6 rounded-[32px] mb-6 border border-zinc-800 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">
            <Target size={14} className="text-orange-500" /> Weekly Effort
          </div>
          <span className="text-xs font-mono font-bold text-orange-400">{(weeklyProg/1000).toFixed(1)}T / 12T</span>
        </div>
        <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000" style={{ width: `${Math.min((weeklyProg/12000)*100, 100)}%` }}></div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
          <div>
            <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mb-1">Body Mass (93kg Goal)</p>
            <div className="flex items-center gap-2 text-2xl font-black italic text-cyan-400 leading-none">
              <Scale size={18}/>{bodyWeight}<span className="text-xs text-zinc-700 font-bold uppercase">kg</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={()=>adjustBW(-0.1)} className="w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800 font-bold active:bg-white active:text-black">-</button>
            <button onClick={()=>adjustBW(0.1)} className="w-10 h-10 bg-zinc-900 rounded-xl border border-zinc-800 font-bold active:bg-white active:text-black">+</button>
          </div>
        </div>
      </div>

      <nav className="flex bg-[#111] rounded-2xl p-1 mb-8 border border-zinc-800 sticky top-4 z-30 shadow-2xl">
        <button onClick={()=>setView('workout')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view==='workout'?'bg-orange-600 text-white shadow-lg shadow-orange-900/40':'text-zinc-500'}`}><Zap size={14}/> Train</button>
        <button onClick={()=>setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${view==='history'?'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40':'text-zinc-500'}`}><BarChart3 size={14}/> Progress</button>
      </nav>

      {view === 'workout' ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          {workout.map((ex) => {
            const prev = getPrevLift(ex.id);
            const isBeating = session[ex.id] > (prev || 0);
            return (
              <div key={ex.id} className={`rounded-[32px] border transition-all duration-300 ${completed[ex.id] ? 'opacity-20 bg-black border-zinc-900' : 'bg-[#111] border-zinc-800'}`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6" onClick={()=>{setCompleted({...completed,[ex.id]:!completed[ex.id]}); if(!completed[ex.id]) setTimeLeft(60);}}>
                    <div className="flex gap-4">
                      <div className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all ${completed[ex.id]?'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/30':'border-zinc-800'}`}>{completed[ex.id]&&<CheckCircle size={18} className="text-white"/>}</div>
                      <div>
                        <h3 className="font-black text-sm uppercase italic tracking-tighter leading-none">{ex.name}</h3>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1.5 tracking-widest">Sets: {ex.sets} • Goal: {ex.goal}</p>
                      </div>
                    </div>
                    {/* GHOST INDICATOR */}
                    {prev && (
                      <div className="text-right">
                        <p className="text-[8px] text-zinc-600 font-black uppercase italic">Last Time</p>
                        <p className={`text-xs font-mono font-black italic ${isBeating ? 'text-cyan-400' : 'text-zinc-500'}`}>{prev}kg</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-black rounded-3xl p-2 border border-zinc-800 shadow-inner">
                    <button onClick={()=>setSession({...session,[ex.id]:Math.max(0,session[ex.id]-2.5)})} className="w-14 h-12 bg-zinc-900 rounded-2xl font-black text-xl hover:bg-zinc-800">-</button>
                    <div className="text-center font-mono font-black italic">
                      <span className={`text-3xl ${isBeating ? 'text-cyan-400' : 'text-orange-500'}`}>{session[ex.id]}</span>
                      <span className="text-[10px] text-zinc-600 block uppercase tracking-tighter">kg</span>
                    </div>
                    <button onClick={()=>setSession({...session,[ex.id]:session[ex.id]+2.5})} className="w-14 h-12 bg-zinc-900 rounded-2xl font-black text-xl hover:bg-zinc-800">+</button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* HEART RATE RECOVERY SLIDER */}
          <div className="bg-[#111] p-6 rounded-[32px] border border-zinc-800 mt-8">
            <div className="flex justify-between items-center mb-4">
               <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2"><Heart size={14} className="text-rose-600"/> Recovery HR</span>
               <span className="text-xl font-black italic text-rose-500">{heartRate}<span className="text-[10px] ml-1">BPM</span></span>
            </div>
            <input type="range" min="80" max="180" value={heartRate} onChange={(e)=>setHeartRate(parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-600" />
          </div>

          <button onClick={save} className="w-full mt-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white py-6 rounded-[32px] font-black uppercase italic tracking-tighter shadow-2xl shadow-orange-600/30 active:scale-95 transition-all">End Titan Protocol</button>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div className="bg-gradient-to-br from-[#111] to-[#070707] p-8 rounded-[40px] border border-zinc-800 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={100} className="text-cyan-500" /></div>
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-2 italic tracking-[0.3em]">Mass Personal Best</p>
            <p className="text-7xl font-black italic tracking-tighter text-cyan-500">{minWeight}<span className="text-xl text-zinc-300 ml-1 italic">KG</span></p>
            <div className="flex items-center justify-center gap-2 mt-4 text-yellow-500 font-black italic text-xs uppercase tracking-widest">
              <Trophy size={14} /> Peak Performance
            </div>
          </div>
          <div className="space-y-3">
            {history.map(e => (
              <div key={e.id} className="bg-[#111] border border-zinc-800 p-6 rounded-[32px] flex justify-between items-center group">
                <div>
                  <p className="text-[10px] text-zinc-600 font-black mb-1 uppercase tracking-widest">{e.date}</p>
                  <p className="text-2xl font-black italic tracking-tighter text-white leading-none">{e.volume.toLocaleString()}<span className="text-xs text-cyan-500 ml-1">kg</span></p>
                  <div className="flex gap-3 mt-2">
                    <span className="text-[9px] text-zinc-700 uppercase font-bold italic flex items-center gap-1"><Scale size={10}/> {e.bw}kg</span>
                    <span className="text-[9px] text-zinc-700 uppercase font-bold italic flex items-center gap-1"><Heart size={10}/> {e.hr}bpm</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-orange-500 font-black italic text-2xl tracking-tighter flex items-center justify-end gap-1 leading-none mb-1">
                    <Flame size={18} fill="currentColor" />{e.calories}
                  </div>
                  <span className="text-[8px] text-zinc-700 font-black uppercase">kcal Destroyed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black/98 z-50 flex items-center justify-center p-6 text-center animate-in zoom-in duration-300">
          <div className="bg-[#111] border border-zinc-800 rounded-[48px] p-10 w-full shadow-2xl">
            <div className="w-20 h-20 bg-cyan-600 rounded-[24px] flex items-center justify-center mx-auto mb-8 rotate-6 shadow-xl shadow-cyan-900/40"><Trophy size={40} className="text-white" /></div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Log Complete</h2>
            <div className="mt-8 mb-10 space-y-4">
              <div className="p-6 bg-black rounded-3xl border border-zinc-800">
                <p className="text-[9px] font-black text-zinc-600 uppercase mb-1 tracking-widest italic text-center">Tonnage Moved</p>
                <p className="text-5xl font-mono font-black italic tracking-tighter text-cyan-400">{calcVol().toLocaleString()}kg</p>
              </div>
              <p className="text-orange-500 font-black italic text-xl tracking-widest leading-none">+{Math.round((bodyWeight * 4.2) + (calcVol()/1000 * 28))} CALORIES BURNED</p>
            </div>
            <button onClick={()=>{setShowSummary(false);setCompleted({});setView('history');}} className="w-full bg-white text-black font-black py-5 rounded-[24px] uppercase italic tracking-tighter transition-all hover:bg-cyan-500 hover:text-white">Analyze Data</button>
          </div>
        </div>
      )}

      {/* Modern Floating Timer */}
      {timeLeft > 0 && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-orange-600 text-white rounded-[24px] px-12 py-5 shadow-2xl flex items-center gap-6 z-50 font-mono font-black italic text-5xl tracking-tighter border-4 border-black animate-pulse">
          <Clock size={32} /> {timeLeft}
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
