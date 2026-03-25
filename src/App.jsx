import React, { useState, useEffect } from 'react';
import { Clock, Plus, History, Play, Check, Trash2, ChevronRight, Save, PlusCircle } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA ---
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
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); // Stores weights/reps
  const [setCounts, setSetCounts] = useState({}); // Tracks how many sets per exercise
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v47_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v47_data', JSON.stringify(history));
  }, [history]);

  // --- 4. ENGINE FUNCTIONS ---
  const startWorkout = (type) => {
    const preset = WORKOUTS[type];
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    
    // Initialize all exercises with 3 sets by default
    const initialSets = {};
    list.forEach(ex => initialSets[ex.id] = 3);
    setSetCounts(initialSets);
    setView('train');
  };

  const addExtra = (name) => {
    const id = `ext-${Date.now()}`;
    const isCardio = name === "Treadmill" || name === "Bike";
    const newItem = { id, name, type: isCardio ? "MIN" : "KG" };
    
    if (activeSession) {
      setActiveSession({ ...activeSession, list: [...activeSession.list, newItem] });
    } else {
      setActiveSession({ name: "Custom Session", rest: 60, list: [newItem] });
    }
    setSetCounts(prev => ({ ...prev, [id]: 3 }));
    setView('train');
  };

  const incrementSets = (id) => {
    setSetCounts(prev => ({ ...prev, [id]: (prev[id] || 3) + 1 }));
  };

  const logWorkout = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < setCounts[ex.id]; i++) {
        const w = sessionData[`${ex.id}-s${i}-w`];
        const r = sessionData[`${ex.id}-s${i}-r`];
        if (w && r) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    if (details.length === 0) return alert("Enter data first!");

    setHistory([{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, details }, ...history]);
    setActiveSession(null); setSessionData({}); setView('log');
  };

  const getSuggestion = (name) => {
    const last = history.find(h => h.details.some(d => d.name === name));
    if (!last) return "NEW";
    const data = last.details.find(d => d.name === name);
    const firstSet = data.sets[0];
    return `${firstSet.w}${name === "Treadmill" ? 'm' : 'kg'} x ${firstSet.r}`;
  };

  // --- 5. UI CONSTANTS ---
  const UI = { bg: '#000', accent: '#FF6B00', text: '#FFF', card: '#111', border: '#222' };

  return (
    <div style={{ background: UI.bg, minHeight: '100vh', color: UI.text, padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: UI.accent, fontWeight: '900', fontSize: '28px', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setView('menu')} style={{ background: 'none', border: 'none', color: view === 'menu' ? UI.accent : '#555' }}><Play /></button>
          <button onClick={() => setView('log')} style={{ background: 'none', border: 'none', color: view === 'log' ? UI.accent : '#555' }}><History /></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.keys(WORKOUTS).map(k => (
            <button key={k} onClick={() => startWorkout(k)} style={{ background: UI.card, border: `2px solid ${UI.accent}`, padding: '30px', borderRadius: '20px', textAlign: 'left', color: '#FFF' }}>
              <div style={{ fontWeight: '900', fontSize: '22px' }}>{WORKOUTS[k].name}</div>
              <div style={{ color: '#888', fontSize: '14px', marginTop: '5px' }}>{WORKOUTS[k].rest}s REST • RECOMP FOCUS</div>
            </button>
          ))}
          <div style={{ marginTop: '20px', color: '#444', fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>EXTRA ACTIVITY</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {LIBRARY.map(name => (
              <button key={name} onClick={() => addExtra(name)} style={{ background: UI.card, border: `1px solid ${UI.border}`, padding: '20px', borderRadius: '15px', color: '#FFF', fontWeight: '800' }}>+ {name}</button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN (MULTI-SET) */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: UI.card, padding: '20px', borderRadius: '28px', border: `1px solid ${UI.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', color: UI.accent, fontSize: '18px' }}>{ex.name}</span>
                <span style={{ fontSize: '12px', color: '#444', fontWeight: '800' }}>TARGET: {getSuggestion(ex.name)}</span>
              </div>
              
              {/* SET ROWS */}
              {[...Array(setCounts[ex.id])].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => setTimeLeft(activeSession.rest)}
                    style={{ width: '55px', height: '55px', background: sessionData[`${ex.id}-s${i}-w`] ? UI.accent : '#222', borderRadius: '15px', border: 'none', color: '#000', fontWeight: '950', fontSize: '20px' }}
                  >
                    {i + 1}
                  </button>
                  <input 
                    type="number" placeholder={ex.type} 
                    value={sessionData[`${ex.id}-s${i}-w`] || ''} 
                    onChange={(e) => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})}
                    style={{ flex: 1, height: '55px', background: '#000', border: '2px solid #333', borderRadius: '15px', color: '#FFF', textAlign: 'center', fontSize: '20px', fontWeight: '900' }} 
                  />
                  <input 
                    type="number" placeholder="REPS" 
                    value={sessionData[`${ex.id}-s${i}-r`] || ''} 
                    onChange={(e) => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})}
                    style={{ flex: 1, height: '55px', background: '#000', border: `2px solid ${UI.border}`, borderRadius: '15px', color: UI.accent, textAlign: 'center', fontSize: '20px', fontWeight: '900' }} 
                  />
                </div>
              ))}

              <button 
                onClick={() => incrementSets(ex.id)}
                style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px dashed #444`, borderRadius: '12px', color: '#666', fontWeight: '800', fontSize: '12px', marginTop: '5px' }}
              >
                + ADD SET
              </button>
            </div>
          ))}
          <button onClick={logWorkout} style={{ background: UI.accent, padding: '30px', borderRadius: '24px', fontWeight: '900', fontSize: '22px', border: 'none', marginTop: '10px', color: '#000' }}>FINISH & LOG</button>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {history.length === 0 && <div style={{ color: '#444', textAlign: 'center', marginTop: '60px', fontWeight: '800' }}>NO SESSIONS LOGGED</div>}
          {history.map((h, i) => (
            <div key={i} style={{ background: UI.card, padding: '20px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #222', paddingBottom: '12px', marginBottom: '12px' }}>
                <span style={{ fontWeight: '900', fontSize: '18px' }}>{h.date}</span>
                <span style={{ color: UI.accent, fontWeight: '800' }}>{h.name.split(': ')[1]}</span>
              </div>
              {h.details.map((d, j) => (
                <div key={j} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: UI.accent }}>{d.name}</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {d.sets.map((s, si) => (
                      <span key={si} style={{ color: '#888', fontSize: '12px' }}>S{si+1}: <b style={{color: '#FFF'}}>{s.w}x{s.r}</b></span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button onClick={() => { if(window.confirm('Wipe History?')) setHistory([]); }} style={{ color: '#F00', background: 'none', border: 'none', marginTop: '30px', fontWeight: '900', opacity: 0.3 }}>WIPE ALL DATA</button>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: UI.accent, color: '#000', padding: '25px', borderRadius: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
          <span style={{ fontWeight: '950', fontSize: '38px', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}s</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <span style={{ fontWeight: '900' }}>RESTING</span>
             <Check size={32} strokeWidth={3} />
          </div>
        </div>
      )}

      {/* TIMER TICKER */}
      {useEffect(() => {
        let timer;
        if (timeLeft > 0) { timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000); }
        return () => clearInterval(timer);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
