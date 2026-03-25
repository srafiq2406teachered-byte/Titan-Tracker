import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Coffee, Plus, ChevronUp, ChevronDown, 
  Flame, Sun, Waves, Wind, X, Activity, Dumbbell
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA ---
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
    rest: '#A855F7', text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.08)'
  };

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [setCounts, setSetCounts] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v57_engine');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v57_engine', JSON.stringify(history));
  }, [history]);

  // --- 4. ENGINE ---
  const stats = useMemo(() => {
    const ghost = {};
    history.forEach(session => {
      if (session.details) {
        session.details.forEach(ex => {
          const exId = [...EXERCISES, ...EXTRA_POOL].find(e => e.name === ex.name)?.id;
          if (exId && !ghost[exId]) ghost[exId] = ex.sets[0];
        });
      }
    });
    return { ghost };
  }, [history]);

  // --- 5. HANDLERS ---
  const startWorkout = (id) => {
    const preset = WORKOUTS[id];
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    const counts = {}; 
    const initialData = {};
    list.forEach(ex => {
      counts[ex.id] = 3;
      for(let i=0; i<3; i++) initialData[`${ex.id}-s${i}-r`] = 10; // Default reps to 10
    });
    setSessionData(initialData);
    setSetCounts(counts);
    setView('train');
  };

  const addExtraToSession = (ex) => {
    setActiveSession(prev => ({ ...prev, list: [...prev.list, ex] }));
    setSetCounts(prev => ({ ...prev, [ex.id]: 3 }));
    const extraData = {};
    for(let i=0; i<3; i++) extraData[`${ex.id}-s${i}-r`] = 10;
    setSessionData(prev => ({ ...prev, ...extraData }));
  };

  const adjustVal = (key, delta) => {
    setSessionData(prev => ({
      ...prev,
      [key]: Math.max(0, (parseFloat(prev[key]) || 0) + delta)
    }));
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < (setCounts[ex.id] || 3); i++) {
        const w = parseFloat(sessionData[`${ex.id}-s${i}-w`]) || 0;
        const r = parseFloat(sessionData[`${ex.id}-s${i}-r`]) || 0;
        if (w || r) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    setHistory([{
      id: activeSession.id || 'CUSTOM', fullDate: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      name: activeSession.name, color: activeSession.color || T.accent, details,
      volume: details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0)
    }, ...history]);
    
    setActiveSession(null); setSessionData({}); setView('log');
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>TITAN<span style={{color: T.accent}}>+</span></h1>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px' }}><Play size={18}/></button>
          <button onClick={() => setView('log')} style={{ border: 'none', padding: '10px', background: view === 'log' ? T.card : 'transparent', color: view === 'log' ? T.accent : T.subtext, borderRadius: '8px' }}><History size={18}/></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
             <div style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>
              {history[0]?.id === 'SHRED' ? 'POWER PROTOCOL' : 'SHRED PROTOCOL'}
            </div>
            <button onClick={() => startWorkout(history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED')} style={{ width: '100%', background: T.accent, border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900', color: '#000' }}>START SESSION</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Object.values(WORKOUTS).map(w => (
              <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '20px', borderRadius: '20px', textAlign: 'left', color: '#FFF' }}>
                <div style={{ color: w.color, fontWeight: '900', fontSize: '14px' }}>{w.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '160px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '16px' }}>{ex.name}</span>
                {stats.ghost
