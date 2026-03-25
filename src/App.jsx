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
            <button key={w.id} onClick={() => handleStart(w.id)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '25px', borderRadius: '24px', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }}><Dumbbell size={80} color={w.color}/></div>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '18px' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '11px', marginTop: '4px' }}>{w.rest}s REST • START SESSION</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '160px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: '900', fontSize: '17px', marginBottom: '15px', color: '#FFF' }}>{ex.name}</div>
              {[...Array(setCounts[ex.id] || 3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '50px', height: '50px', background: T.card, borderRadius: '12px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <Stepper valKey={`${ex.id}-s${i}-w`} label="KG" color="#FFF" />
                  <Stepper valKey={`${ex.id}-s${i}-r`} label="REPS" color={T.accent} />
                </div>
              ))}
            </div>
          ))}

          {/* ADD-ON POOL */}
          <div style={{ padding: '0 10px' }}>
            <div style={{ fontSize: '11px', fontWeight: '900', color: T.subtext, marginBottom: '10px', textTransform: 'uppercase' }}>Add Extra Activity:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {EXTRA_POOL.filter(e => !activeSession.list.find(al => al.id === e.id)).map(ex => (
                <button key={ex.id} onClick={() => addExtra(ex)} style={{ background: T.surface, border: `1px dashed ${T.border}`, padding: '15px', borderRadius: '15px', color: T.subtext, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Plus size={14}/> {ex.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={finishSession} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.accent, padding: '24px', borderRadius: '20px', fontWeight: '900', color: '#000', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>FINISH & LOG</button>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '20px', borderRadius: '20px', borderLeft: `5px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '14px' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '11px' }}>{h.name}</span>
              </div>
            </div>
          ))}
          {history.length === 0 && <div style={{ textAlign: 'center', color: T.subtext, marginTop: '100px' }}>No history found.</div>}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '24px', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ fontWeight: '950', fontSize: '40px' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', textAlign: 'right', lineHeight: '1' }}>RESTING<br/><span style={{fontSize: '10px'}}>TAP TO SKIP</span></div>
        </div>
      )}

      {/* TICKER */}
      {useEffect(() => {
        let timer;
        if (timeLeft > 0) timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
