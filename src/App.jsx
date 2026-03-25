import React, { useState, useEffect } from 'react';
import { 
  Clock, Plus, History, Play, Check, Trash2, 
  PlusCircle, Activity, BarChart3, Settings, Dumbbell 
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA ---
  const WORKOUTS = {
    SHRED: { name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"], color: '#4ADE80' },
    POWER: { name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"], color: '#60A5FA' }
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

  // --- 2. THEME DEFINITION (Refined Readability) ---
  const T = {
    bg: '#0F172A',         // Deep Slate Blue
    surface: '#1E293B',    // Slate
    card: '#334155',       // Lighter Slate
    accent: '#2DD4BF',     // Mint/Cyan
    text: '#F8FAFC',       // Off-White
    subtext: '#94A3B8',    // Muted Slate
    border: 'rgba(255,255,255,0.05)',
    shadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
  };

  // --- 3. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [setCounts, setSetCounts] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 4. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v48_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v48_data', JSON.stringify(history));
  }, [history]);

  // --- 5. LOGIC ---
  const startWorkout = (type) => {
    const preset = WORKOUTS[type];
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    const initialSets = {};
    list.forEach(ex => initialSets[ex.id] = 3);
    setSetCounts(initialSets);
    setView('train');
  };

  const addExtra = (name) => {
    const id = `ext-${Date.now()}`;
    const newItem = { id, name, type: (name === "Treadmill" || name === "Bike") ? "MIN" : "KG" };
    if (activeSession) {
      setActiveSession({ ...activeSession, list: [...activeSession.list, newItem] });
    } else {
      setActiveSession({ name: "CUSTOM SESSION", rest: 60, list: [newItem], color: T.accent });
    }
    setSetCounts(prev => ({ ...prev, [id]: 3 }));
    setView('train');
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

    if (details.length === 0) return;
    setHistory([{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, details, color: activeSession.color }, ...history]);
    setActiveSession(null); setSessionData({}); setView('log');
  };

  // --- 6. RENDER ---
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '24px 20px 120px 20px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* GLASS HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', margin: 0, color: T.text }}>TITAN<span style={{color: T.accent}}>.</span></h1>
          <p style={{ fontSize: '10px', fontWeight: '700', color: T.subtext, margin: 0 }}>METABOLIC ENGINE</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: T.surface, padding: '6px', borderRadius: '16px', border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', background: view === 'menu' ? T.accent : 'transparent', padding: '10px', borderRadius: '12px', color: view === 'menu' ? T.bg : T.subtext }}><Play size={20}/></button>
          <button onClick={() => setView('log')} style={{ border: 'none', background: view === 'log' ? T.accent : 'transparent', padding: '10px', borderRadius: '12px', color: view === 'log' ? T.bg : T.subtext }}><History size={20}/></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.keys(WORKOUTS).map(k => (
            <button key={k} onClick={() => startWorkout(k)} style={{ 
              background: T.surface, border: `1px solid ${T.border}`, padding: '32px 24px', borderRadius: '28px', textAlign: 'left', position: 'relative', overflow: 'hidden', boxShadow: T.shadow
            }}>
              <div style={{ position: 'absolute', right: '-10px', top: '-10px', color: WORKOUTS[k].color, opacity: 0.1 }}><Dumbbell size={100}/></div>
              <div style={{ fontWeight: '900', fontSize: '20px', color: WORKOUTS[k].color }}>{WORKOUTS[k].name}</div>
              <div style={{ color: T.subtext, fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>{WORKOUTS[k].rest}s AUTOMATIC REST</div>
            </button>
          ))}

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '12px', color: T.subtext, fontWeight: '800', marginBottom: '15px', letterSpacing: '1px' }}>LIBRARY / EXTRA</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {LIBRARY.map(name => (
                <button key={name} onClick={() => addExtra(name)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '18px', borderRadius: '20px', color: T.text, fontWeight: '700', fontSize: '14px', textAlign: 'center' }}>{name}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '24px', borderRadius: '32px', border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ fontWeight: '900', color: T.text, fontSize: '18px' }}>{ex.name}</span>
                <Activity size={18} color={T.accent} opacity={0.5} />
              </div>
              
              {[...Array(setCounts[ex.id])].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <button 
                    onClick={() => setTimeLeft(activeSession.rest)}
                    style={{ width: '55px', height: '55px', background: sessionData[`${ex.id}-s${i}-w`] ? T.accent : T.card, borderRadius: '18px', border: 'none', color: sessionData[`${ex.id}-s${i}-w`] ? T.bg : T.subtext, fontWeight: '900', fontSize: '18px' }}
                  >
                    {i + 1}
                  </button>
                  <input 
                    type="number" placeholder={ex.type} value={sessionData[`${ex.id}-s${i}-w`] || ''} 
                    onChange={(e) => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})}
                    style={{ flex: 1, height: '55px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${T.border}`, borderRadius: '18px', color: '#FFF', textAlign: 'center', fontSize: '18px', fontWeight: '700' }} 
                  />
                  <input 
                    type="number" placeholder="REPS" value={sessionData[`${ex.id}-s${i}-r`] || ''} 
                    onChange={(e) => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})}
                    style={{ flex: 1, height: '55px', background: 'rgba(0,0,0,0.2)', border: `1px solid ${T.border}`, borderRadius: '18px', color: T.accent, textAlign: 'center', fontSize: '18px', fontWeight: '700' }} 
                  />
                </div>
              ))}

              <button 
                onClick={() => setSetCounts(prev => ({ ...prev, [ex.id]: (prev[ex.id] || 3) + 1 }))}
                style={{ width: '100%', padding: '14px', background: 'transparent', border: `2px dashed ${T.card}`, borderRadius: '18px', color: T.subtext, fontWeight: '800', fontSize: '12px', marginTop: '8px' }}
              >
                + ADD SET
              </button>
            </div>
          ))}
          <button onClick={logWorkout} style={{ background: T.accent, padding: '24px', borderRadius: '24px', fontWeight: '900', fontSize: '18px', border: 'none', color: T.bg, boxShadow: `0 20px 40px -10px ${T.accent}44` }}>LOG COMPLETION</button>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '24px', borderRadius: '28px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '14px', color: T.subtext }}>{h.date}</span>
                <span style={{ color: h.color || T.accent, fontWeight: '900', fontSize: '14px' }}>{h.name}</span>
              </div>
              {h.details.map((d, j) => (
                <div key={j} style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>{d.name}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {d.sets.map((s, si) => (
                      <span key={si} style={{ background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: T.subtext }}>{s.w}x{s.r}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD (Glassmorphism) */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ 
          position: 'fixed', bottom: '30px', left: '20px', right: '20px', 
          background: 'rgba(45, 212, 191, 0.95)', backdropFilter: 'blur(10px)', color: T.bg, padding: '20px 30px', 
          borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' 
        }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: '900', opacity: 0.7 }}>REST TIMER</div>
            <div style={{ fontSize: '42px', fontWeight: '900', lineHeight: 1 }}>{timeLeft}s</div>
          </div>
          <Check size={40} strokeWidth={3} />
        </div>
      )}

      {/* TIMER LOGIC */}
      {useEffect(() => {
        let timer;
        if (timeLeft > 0) { timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000); }
        return () => clearInterval(timer);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
