import React, { useState, useEffect } from 'react';
import { Clock, Plus, History, Play, Check, Trash2, ChevronRight, Save } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA & ADAPTATION LOGIC ---
  const WORKOUTS = {
    SHRED: { name: "TITAN: SHRED", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"] },
    POWER: { name: "TITAN: POWER", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"] }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", type: "KG" },
    { id: "A2", name: "Lat Pulldown", type: "KG" },
    { id: "B1", name: "Chest Press", type: "KG" },
    { id: "B2", name: "Leg Curl", type: "KG" },
    { id: "C1", name: "Cable Row", type: "KG" },
    { id: "C2", name: "DB Press", type: "KG" },
    { id: "D1", name: "Plank/Core", type: "MIN" },
    { id: "D2", name: "Walking Lunges", type: "KG" }
  ];

  const LIBRARY = ["Hip Abductor", "Hip Adductor", "Leg Extension", "Dips", "Treadmill", "Bike"];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); // menu, train, log
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. PERSISTENCE (FIXED) ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v46_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v46_data', JSON.stringify(history));
  }, [history]);

  // --- 4. ENGINE FUNCTIONS ---
  const startWorkout = (type) => {
    const preset = WORKOUTS[type];
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    setView('train');
  };

  const addExtra = (name) => {
    const isCardio = name === "Treadmill" || name === "Bike";
    const newItem = { id: `ext-${Date.now()}`, name, type: isCardio ? "MIN" : "KG" };
    if (activeSession) {
      setActiveSession({ ...activeSession, list: [...activeSession.list, newItem] });
    } else {
      setActiveSession({ name: "Custom Session", rest: 60, list: [newItem] });
    }
    setView('train');
  };

  const logWorkout = () => {
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      val: sessionData[`${ex.id}-v`] || 0,
      reps: sessionData[`${ex.id}-r`] || 0
    })).filter(d => d.val > 0);

    if (details.length === 0) return alert("Enter data first!");

    const newEntry = {
      date: new Date().toLocaleDateString('en-GB'),
      name: activeSession.name,
      details
    };

    setHistory([newEntry, ...history]);
    setActiveSession(null);
    setSessionData({});
    setView('log');
  };

  // --- 5. SMART ADAPTATION (SUGGESTION) ---
  const getSuggestion = (name) => {
    const last = history.find(h => h.details.some(d => d.name === name));
    if (!last) return "NEW";
    const data = last.details.find(d => d.name === name);
    return `${data.val}kg x ${data.reps}`;
  };

  // --- 6. RENDER HELPERS ---
  const UI = {
    bg: '#000',
    accent: '#FF6B00', // High-Vis Orange
    text: '#FFF',
    card: '#111',
    border: '#222'
  };

  return (
    <div style={{ background: UI.bg, minHeight: '100vh', color: UI.text, padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: UI.accent, fontWeight: '900', fontSize: '28px', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: view === 'menu' ? UI.accent : '#555' }}><Play /></button>
          <button onClick={() => setView('log')} style={{ background: 'none', border: 'none', color: view === 'log' ? UI.accent : '#555' }}><History /></button>
        </div>
      </div>

      {/* VIEW: MENU (WORKOUT SELECTION) */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.keys(WORKOUTS).map(k => (
            <button key={k} onClick={() => startWorkout(k)} style={{ background: UI.card, border: `2px solid ${UI.accent}`, padding: '30px', borderRadius: '20px', textAlign: 'left', color: '#FFF' }}>
              <div style={{ fontWeight: '900', fontSize: '20px' }}>{WORKOUTS[k].name}</div>
              <div style={{ color: '#888', fontSize: '14px' }}>{WORKOUTS[k].rest}s REST PROTOCOL</div>
            </button>
          ))}
          
          <div style={{ marginTop: '20px', color: '#555', fontWeight: '900', fontSize: '12px' }}>ADD EXTRA ACTIVITY</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {LIBRARY.map(name => (
              <button key={name} onClick={() => addExtra(name)} style={{ background: UI.card, border: `1px solid ${UI.border}`, padding: '20px', borderRadius: '15px', color: '#FFF', fontWeight: '800' }}>+ {name}</button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN (THE TRACKER) */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: UI.card, padding: '20px', borderRadius: '24px', border: `1px solid ${UI.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '900', color: UI.accent }}>{ex.name}</span>
                <span style={{ fontSize: '12px', color: '#555' }}>LAST: {getSuggestion(ex.name)}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="number" 
                  placeholder={ex.type} 
                  value={sessionData[`${ex.id}-v`] || ''} 
                  onChange={(e) => setSessionData({...sessionData, [`${ex.id}-v`]: e.target.value})}
                  style={{ flex: 1, height: '60px', background: '#000', border: '2px solid #333', borderRadius: '15px', color: '#FFF', textAlign: 'center', fontSize: '24px', fontWeight: '900' }} 
                />
                <input 
                  type="number" 
                  placeholder={ex.type === "MIN" ? "KM" : "REPS"} 
                  value={sessionData[`${ex.id}-r`] || ''} 
                  onChange={(e) => setSessionData({...sessionData, [`${ex.id}-r`]: e.target.value})}
                  onBlur={() => setTimeLeft(activeSession.rest)}
                  style={{ flex: 1,
