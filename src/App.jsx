import React, { useState, useEffect } from 'react';
import { Check, Clock, Flame, Scale, Trophy, Activity } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('workout'); 
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

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

  useEffect(() => { 
    localStorage.setItem('titan-w-sets', JSON.stringify(session)); 
  }, [session]);

  const adjustSetWeight = (exId, setIdx, delta) => {
    const newWeights = [...session[exId]];
    newWeights[setIdx] = Math.max(0, Math.round(((newWeights[setIdx] || 0) + delta) * 10) / 10);
    setSession({ ...session, [exId]: newWeights });
  };

  const calcVol = () => workout.reduce((acc, ex) => {
    if (!completed[ex.id]) return acc;
    return acc + session[ex.id].reduce((sum, w) => sum + (w * ex.reps), 0);
  }, 0);

  const save = () => {
    const v = calcVol(); if (v === 0) return;
    const entry = { 
      date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short'}), 
      volume: v, 
      calories: Math.round((bodyWeight * 4.2) + (v/1000 * 28)), 
      bw: bodyWeight,
      sessionData: session,
      ts: new Date().toISOString(), 
      id: Date.now() 
    };
    const newHistory = [entry, ...history].slice(0, 30);
    setHistory(newHistory);
    localStorage.setItem('titan-h', JSON.stringify(newHistory));
    setShowSummary(true);
  };

  useEffect(() => { 
    if (timeLeft > 0) { 
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); 
      return () => clearTimeout(t); 
    } 
  }, [timeLeft]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#000] text-zinc-100 font-sans pb-10">
      <header className="p-6 pt-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase text-white leading-none">Titan</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold mt-1">Performance Protocol</p>
        </div>
        <Activity size={20} className="text-orange-500 mb-1" />
      </header>

      <div className="px-6 mb-8">
        <div className="flex p-1 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
          <button onClick={() => setView('workout')} className={`flex-1 py-3 rounded-xl text-xs font-bold