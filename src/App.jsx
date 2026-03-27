import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, Trash2, Zap, TrendingUp, Check
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG ---
  const THEMES = { EMERALD: '#10B981', SAPPHIRE: '#3B82F6', CRIMSON: '#EF4444' };
  
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs" }, { id: "A2", name: "Lat Pulldown", muscle: "Back" },
    { id: "B1", name: "Chest Press", muscle: "Chest" }, { id: "B2", name: "Leg Curl", muscle: "Legs" }
  ];

  const EXTRA_POOL = [
    // Cardio
    { id: "C1", name: "Treadmill", muscle: "Cardio" },
    { id: "C2", name: "Elliptical", muscle: "Cardio" },
    { id: "C3", name: "Stationary Bike", muscle: "Cardio" },
    { id: "C4", name: "Rowing Machine", muscle: "Cardio" },
    { id: "C5", name: "Stair Climber", muscle: "Cardio" },
    // Arms
    { id: "E1", name: "Bicep Curls", muscle: "Arms" }, 
    { id: "E2", name: "Tricep Pushdown", muscle: "Arms" },
    { id: "E6", name: "Hammer Curls", muscle: "Arms" },
    { id: "E7", name: "Preacher Curls", muscle: "Arms" },
    { id: "E8", name: "Skull Crushers", muscle: "Arms" },
    // Shoulders
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" },
    { id: "E9", name: "Shoulder Press", muscle: "Shoulders" },
    { id: "E10", name: "Front Raises", muscle: "Shoulders" },
    // Back
    { id: "E4", name: "Face Pulls", muscle: "Back" },
    { id: "E11", name: "Seated Row", muscle: "Back" },
    { id: "E12", name: "Pull Ups", muscle: "Back" },
    // Chest
    { id: "E13", name: "Chest Fly", muscle: "Chest" },
    { id: "E14", name: "Incline Press", muscle: "Chest" },
    { id: "E15", name: "Push Ups", muscle: "Chest" },
    // Legs
    { id: "E5", name: "Calf Raises", muscle: "Legs" },
    { id: "E16", name: "Leg Extension", muscle: "Legs" },
    { id: "E17", name: "Lunges", muscle: "Legs" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });

  // --- 3. PERSISTENCE & EFFECTS ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v71_engine');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.accent) setAccent(d.accent);
      if (d.fontSize) setFontSize(d.fontSize);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v71_engine', JSON.stringify({ history, accent, fontSize, bio }));
  }, [history, accent, fontSize, bio]);

  useEffect(() => {
    let t;
    if (timeLeft > 0) {
      t = setInterval(() => {
        setTimeLeft((p) => p - 1);
      }, 1000);
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [timeLeft]);

  // --- 4. CALCULATIONS & UTILS ---
  const triggerHaptic = (type = 50) => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(type);
  };

  const bmi = (bio.weight / ((bio.height / 100) ** 2)).toFixed(1);
  const bmr = bio.sex === 'm' 
    ? Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5) 
    : Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age - 161);

  const getLastLog = (name) => {
    for (let entry of history) {
      const ex = entry.details?.find(d => d.name === name);
      if (ex && ex.sets[0]) return `${ex.sets[0].w}${ex.isCardio ? ' Lvl' : 'kg'} x ${ex.sets[0].r}${ex.isCardio ? 'm' : ''}`;
    }
    return "No history";
  };

  const filteredLib = EXTRA_POOL.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- 5. LOGIC ENGINES ---
  const startWorkout = (id) => {
    triggerHaptic(100);
    const p = WORKOUTS[id];
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id)).map(e => ({...e, instanceId: `${e.id}-${Date.now()}`}));
    const initData = {};
    list.forEach(ex => { initData[ex.instanceId] = [{w:0, r:10}, {w:0, r:10}, {w:0, r:10}]; });
    setSessionData(initData);
    setActiveSession({ ...p, list });
    setView('train');
  };

  const addExtra = (ex) => {
    triggerHaptic(40);
    const instanceId = `${ex.id}-${Date.now()}`;
    setActiveSession(prev => ({ ...prev, list: [...prev.list, { ...ex, instanceId }] }));
    setSessionData(prev => ({
      ...prev,
      [instanceId]: [{w:0, r:10}, {w:0, r:10}, {w:0, r:10}]
    }));
    setSearchQuery('');
    setView('train');
  };

  const updateSet = (instanceId, setIdx, field, val) => {
    const newData = { ...sessionData };
    const currentSet = { ...newData[instanceId][setIdx] };
    currentSet[field] = Math.max(0, (parseFloat(currentSet[field]) || 0) + val);
    newData[instanceId][setIdx] = currentSet;
    setSessionData(newData);
  };

  const finishSession = () => {
    triggerHaptic([50, 30, 50]);
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      isCardio: ex.muscle === 'Cardio',
      sets: sessionData[ex.instanceId].filter(s => s.w > 0 || s.r > 0)
    })).filter(d => d.sets.length > 0);
    
    const vol = details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0);
    setHistory([{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, volume: vol, details }, ...history]);
    setActiveSession(null); 
    setView('metrics');
  };

  const T = { bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent, text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.1)' };

  // --- 6. RENDER ---
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontSize: `${fontSize}px`, fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* PERSISTENT NAV */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontWeight: '900', fontSize: '1.2em' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px' }}><Play size={18}/></button>
            <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '10px' }}><Calculator size={18}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px' }}><BarChart2 size={18}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px' }}><Settings size={18}/></button>
          </div>
        </div>
      )}

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '30px', borderRadius: '24px', border: `1px solid ${T.border}`, textAlign: 'left' }}>
              <div style={{ color: w.color, fontWeight: '950', fontSize: '1.3em' }}>{w.name}</div>
              <div style={{ fontSize: '0.7em', color: T.subtext, marginTop: '5px' }}>START PROTOCOL</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          {activeSession.list.map((ex) => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '900' }}>{ex.name}</span>
                <button onClick={() => setActiveSession(p => ({...p, list: p.list.filter(i => i.instanceId !== ex.instanceId)}))} style={{ background: 'none', border: 'none', color: '#EF4444' }}><Trash2 size={16}/></button>
              </div>
              <div style={{ fontSize: '0.7em', color: T.accent, fontWeight: '800', marginBottom: '12px' }}>LAST: {getLastLog(ex.name)}</div>
              {sessionData[ex.instanceId]?.map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setTimeLeft(activeSession.rest); triggerHaptic(30); }} style={{ width: '40px', height: '40px', background: T.card, border: 'none', borderRadius: '8px', color: T.accent, fontWeight: '900' }}>{i+1}</button>
                  <div style={{ flex: 1, display: 'flex', background: T.bg, borderRadius: '8px', overflow: 'hidden' }}>
                    <button onClick={() => updateSet(ex.instanceId, i, 'w', -2.5)} style={{ padding: '10px', border: 'none', background: 'none', color: T.subtext }}><Minus size={14}/></button>
                    <input type="number" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', parseFloat(e.target.value) - set.w)} style={{ width: '100%', background: 'none', border: 'none', color: '#FFF', textAlign: 'center', fontWeight: '900' }} />
                    <button onClick={() => { updateSet(ex.instanceId, i, 'w', 2.5); triggerHaptic(10); }} style={{ padding: '10px', border: 'none', background: 'none', color: T.accent }}><Plus size={14}/></button>
                  </div>
                  <div style={{ flex: 0.7, background: T.bg, borderRadius: '8px' }}>
                    <input type="number" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', parseInt(e.