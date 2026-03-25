import React, { useState, useEffect, useMemo } from 'react';
import { Play, History, Coffee, Plus, Minus, Flame, Dumbbell, ChevronUp, ChevronDown } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. PROTOCOL DEFINITIONS ---
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press" }, { id: "A2", name: "Lat Pulldown" },
    { id: "B1", name: "Chest Press" }, { id: "B2", name: "Leg Curl" },
    { id: "C1", name: "Cable Row" }, { id: "C2", name: "DB Press" },
    { id: "D1", name: "Plank/Core" }, { id: "D2", name: "Walking Lunges" }
  ];

  const EXTRA_POOL = [
    { id: "E1", name: "Bicep Curls" }, { id: "E2", name: "Tricep Pushdown" },
    { id: "E3", name: "Lateral Raises" }, { id: "E4", name: "Face Pulls" }
  ];

  const T = {
    bg: '#0A0F1E', surface: '#161E31', card: '#232D45', accent: '#10B981',
    text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.1)'
  };

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); // Stores { "id-s0-w": 50, "id-s0-r": 10 }
  const [setCounts, setSetCounts] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. PERSISTENCE (FORCED REFRESH KEY) ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v58_hard_sync');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v58_hard_sync', JSON.stringify(history));
  }, [history]);

  // --- 4. CORE ENGINE ---
  const handleStart = (id) => {
    const protocol = WORKOUTS[id];
    const list = EXERCISES.filter(ex => protocol.ids.includes(ex.id));
    
    // Force Reps to 10 for every set in the protocol
    const initialData = {};
    const initialCounts = {};
    list.forEach(ex => {
      initialCounts[ex.id] = 3;
      for(let s=0; s<3; s++) {
        initialData[`${ex.id}-s${s}-r`] = 10;
        initialData[`${ex.id}-s${s}-w`] = 0;
      }
    });

    setSessionData(initialData);
    setSetCounts(initialCounts);
    setActiveSession({ ...protocol, list });
    setView('train');
  };

  const addExtra = (ex) => {
    setActiveSession(prev => ({ ...prev, list: [...prev.list, ex] }));
    setSetCounts(prev => ({ ...prev, [ex.id]: 3 }));
    const extraData = {};
    for(let s=0; s<3; s++) {
      extraData[`${ex.id}-s${s}-r`] = 10;
      extraData[`${ex.id}-s${s}-w`] = 0;
    }
    setSessionData(prev => ({ ...prev, ...extraData }));
  };

  const updateVal = (key, delta) => {
    setSessionData(prev => ({
      ...prev,
      [key]: Math.max(0, (parseFloat(prev[key]) || 0) + delta)
    }));
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      const count = setCounts[ex.id] || 3;
      for (let i = 0; i < count; i++) {
        const w = parseFloat(sessionData[`${ex.id}-s${i}-w`]);
        const r = parseFloat(sessionData[`${ex.id}-s${i}-r`]);
        if (w > 0 || r > 0) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    setHistory([{
      id: activeSession.id, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      fullDate: new Date().toISOString(), name: activeSession.name, color: activeSession.color, details
    }, ...history]);
    
    setActiveSession(null); setView('log');
  };

  // --- 5. UI COMPONENTS ---
  const Stepper = ({ valKey, label, color }) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#000', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${T.border}` }}>
      <button onClick={() => updateVal(valKey, -1)} style={{ padding: '12px', background: 'none', border: 'none', color: T.subtext }}><Minus size={16}/></button>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: '900', color: color }}>{sessionData[valKey] || 0}</div>
        <div style={{ fontSize: '8px', color: T.subtext, marginTop: '-2px' }}>{label}</div>
      </div>
      <button onClick={() => updateVal(valKey, 1)} style={{ padding: '12px', background: 'none', border: 'none', color: T.subtext }}><Plus size={16}/></button>
    </div>
  );

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px' }}><Play size={20}/></button>
          <button onClick={() => setView('log')} style={{ border: 'none', padding: '10px', background: view === 'log' ? T.card : 'transparent', color: view === 'log' ? T.accent : T.subtext, borderRadius: '8px' }}><History size={20}/></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick
