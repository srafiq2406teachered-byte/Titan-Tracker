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
          <button onClick={() => setView('log')} style={{ border: 'none', padding: '10px', background: view === 'log' ? T.card : 'transparent', color: view === 'log' ? T.accent : T.subtext, borderRadius: '8px', cursor: 'pointer' }}><History size={20}/></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '25px', borderRadius: '24px', textAlign: 'left', cursor: 'pointer', transition: 'transform 0.1s' }}>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '18px' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '11px', marginTop: '4px' }}>LOG SESSION</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '140px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: '900', fontSize: '16px', marginBottom: '12px', color: '#FFF' }}>{ex.name}</div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  
                  {/* KG STEPPER (1KG) */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#000', borderRadius: '10px', border: `1px solid ${T.border}` }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, -1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: '900', fontSize: '14px' }}>{sessionData[`${ex.id}-s${i}-w`] || 0}kg</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, 1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Plus size={14}/></button>
                  </div>

                  {/* REPS STEPPER (1UNIT) */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#000', borderRadius: '10px', border: `1px solid ${T.border}` }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, -1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: '900', fontSize: '14px', color: T.accent }}>{sessionData[`${ex.id}-s${i}-r`] || 0}</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, 1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* ADD EXTRAS */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '900', color: T.subtext, marginBottom: '8px', paddingLeft: '5px' }}>EXPAND SESSION:</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {EXTRA_POOL.filter(e => !activeSession.list.find(al => al.id === e.id)).map(ex => (
                <button key={ex.id} onClick={() => addExtra(ex)} style={{ background: T.surface, border: `1px dashed ${T.border}`, padding: '12px', borderRadius: '12px', color: T.subtext, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                  <Plus size={12}/> {ex.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={finishSession} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: T.accent, padding: '20px', borderRadius: '18px', fontWeight: '950', color: '#000', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', maxWidth: '460px', margin: '0 auto' }}>FINISH & SAVE HISTORY</button>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '15px', borderRadius: '15px', borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '14px' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '11px' }}>{h.name}</span>
              </div>
            </div>
          ))}
          {history.length === 0 && <div style={{ textAlign: 'center', color: T.subtext, marginTop: '80px' }}>No training logs yet.</div>}
        </div>
      )}

      {/* REST OVERLAY */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '20px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, maxWidth: '460px', margin: '0 auto' }}>
          <span style={{ fontWeight: '950', fontSize: '32px' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', textAlign: 'right' }}>RESTING</div>
        </div>
      )}

      {/* TIMER LOGIC */}
      {useEffect(() => {
        let t;
        if (timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
      }, [timeLeft])}

    </div>
  )
}

export default TitanTracker;
