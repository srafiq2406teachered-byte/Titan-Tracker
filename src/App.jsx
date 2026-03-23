import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, CheckCircle, Clock, TrendingUp, Trophy, BarChart3, Target, Dumbbell, Flame, Scale, Zap, Activity, Heart, Edit3, EyeOff, Eye } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('workout'); 
  const [stealth, setStealth] = useState(false);
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

  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('titan-w-sets');
    if (saved) return JSON.parse(saved);
    
    const defaults = { A1: 80, A2: 40, B1: 45, B2: 35, C1: 35, C2: 10 };
    const initial = {};
    
    workout.forEach(ex => {
      const prevSession = JSON.parse(localStorage.getItem('titan-h') || '[]')[0];
      const prevWeights = prevSession?.sessionData?.[ex.id];
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
    <div className={`max-w-md mx-auto min-h-screen transition-colors duration-500 p-4 font-sans pb-32 ${stealth ? 'bg-black text-zinc-600' : 'bg-[#070707] text-white'}`}>
      
      {/* Activity Bar */}
      <div className={`flex justify-center gap-1.5 mb-6 px-2 transition-opacity ${stealth ? 'opacity-10' : 'opacity-60'}`}>
        {[...Array(14)].map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (13 - i));
          const active = history.some(h => new Date(h.ts).toDateString() === d.toDateString());
          return <div key={i} className={`h-1.5 flex-1 rounded-full ${active ? (stealth ? 'bg-zinc-700' : 'bg-orange-500 shadow-[0_0_8px_orange]') : 'bg-zinc-800'}`}></div>
        })}
      </div>

      <nav className={`flex rounded-2xl p-1 mb-6 border sticky top-4 z-30 shadow-2xl transition-colors ${stealth ? 'bg-black border-zinc-900' : 'bg-[#111] border-zinc-800'}`}>
        <button onClick={()=>setView('workout')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='workout' ? (stealth ? 'bg-zinc-900 text-zinc-400' : 'bg-orange-600 text-white') : 'text-zinc-500'}`}>Train</button>
        <button onClick={()=>setView('history')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view==='history' ? (stealth ? 'bg-zinc-900 text-zinc-400' : 'bg-cyan-600 text-white') : 'text-zinc-500'}`}>History</button>
        <button onClick={()=>setStealth(!stealth)} className="px-4 text-zinc-500 hover:text-white transition-colors">
            {stealth ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </nav>

      {view === 'workout' ? (
        <div className="space-y-6">
          {workout.map((ex) => (
            <div key={ex.id} className={`rounded-[32px] border transition-all duration-300 ${completed[ex.id] ? 'opacity-20 grayscale' : (stealth ? 'bg-black border-zinc-900' : 'bg-[#111] border-zinc-800')}`}>
