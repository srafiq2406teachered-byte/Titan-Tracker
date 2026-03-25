import React, { useState, useEffect } from 'react';
import { Play, History, Coffee, Plus, Minus, Dumbbell, ChevronUp, ChevronDown, Activity, Zap } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE CONFIGURATION ---
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"], color: '#3B82F6' }
  }

  const EXERCISES = [
    { id: "A1", name: "Leg Press" }, { id: "A2", name: "Lat Pulldown" },
    { id: "B1", name: "Chest Press" }, { id: "B2", name: "Leg Curl" },
    { id: "C1", name: "Cable Row" }, { id: "C2", name: "DB Press" },
    { id: "D1", name: "Plank/Core" }, { id: "D2", name: "Walking Lunges" }
  ]

  const EXTRA_POOL = [
    { id: "E1", name: "Bicep Curls" }, { id: "E2", name: "Tricep Pushdown" },
    { id: "E3", name: "Lateral Raises" }, { id: "E4", name: "Face Pulls" }
  ]

  const T = {
    bg: '#0A0F1E', surface: '#161E31', card: '#232D45', accent: '#10B981',
    text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.1)'
  }

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. PERSISTENCE & RESET ---
  useEffect(() => {
    // NEW: Version Check to prevent "Nothing Shown" error
    const VERSION = "v59_FINAL";
    const savedVersion = localStorage.getItem('titan_version');
    
    if (savedVersion !== VERSION) {
      localStorage.clear(); // Safety wipe
      localStorage.setItem('titan_version', VERSION);
    }

    const saved = localStorage.getItem('titan_v59_data');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } 
      catch(e) { setHistory([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v59_data', JSON.stringify(history));
  }, [history]);

  // --- 4. ENGINE ---
  const startWorkout = (id) => {
    const protocol = WORKOUTS[id];
    const list = EXERCISES.filter(ex => protocol.ids.includes(ex.id));
    const initialData = {};
    
    list.forEach(ex => {
      for(let s=0; s<3; s++) {
        initialData[`${ex.id}-s${s}-r`] = 10; // FORCED: 10 Reps default
        initialData[`${ex.id}-s${s}-w`] = 0;  // 0 Weight default
      }
    });

    setSessionData(initialData);
    setActiveSession({ ...protocol, list });
    setView('train');
  }

  const addExtra = (ex) => {
    setActiveSession(prev => ({ ...prev, list: [...prev.list, ex] }));
    const extraData = {};
    for(let s=0; s<3; s++) {
      extraData[`${ex.id}-s${s}-r`] = 10;
      extraData[`${ex.id}-s${s}-w`] = 0;
    }
    setSessionData(prev => ({ ...prev, ...extraData }));
  }

  const updateVal = (key, delta) => {
    setSessionData(prev => ({
      ...prev,
      [key]: Math.max(0, (parseFloat(prev[key]) || 0) + delta)
    }));
  }

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < 3; i++) {
        const w = parseFloat(sessionData[`${ex.id}-s${i}-w`]);
        const r = parseFloat(sessionData[`${ex.id}-s${i}-r`]);
        if (w > 0 || r > 0) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    setHistory([{
      id: activeSession.id, 
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      name: activeSession.name, 
      color: activeSession.color, 
      details
    }, ...history]);
    
    setActiveSession(null); 
    setView('log');
  }

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1.5px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px', cursor: 'pointer' }}><Play size={20}/></button>
          <button onClick={() => setView('log')} style={{ border: 'none', padding: '1
