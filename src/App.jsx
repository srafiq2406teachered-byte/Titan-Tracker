import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, History, Play, Check, Plus, Trophy, Calendar, 
  TrendingUp, Zap, BarChart2, Coffee, Wind, Sun, Flame
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA ---
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", type: "KG" }, { id: "A2", name: "Lat Pulldown", type: "KG" },
    { id: "B1", name: "Chest Press", type: "KG" }, { id: "B2", name: "Leg Curl", type: "KG" },
    { id: "C1", name: "Cable Row", type: "KG" }, { id: "C2", name: "DB Press", type: "KG" },
    { id: "D1", name: "Plank/Core", type: "MIN" }, { id: "D2", name: "Walking Lunges", type: "KG" }
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

  // --- 3. PERSISTENCE (V52 Fresh Key) ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('titan_v52_final');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { console.error("History Load Error", e); }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v52_final', JSON.stringify(history));
  }, [history]);

  // --- 4. ENGINE (STREAKS & RECOVERY) ---
  const stats = useMemo(() => {
    const now = new Date();
    const lastSession = history[0];
    const diffHours = lastSession ? (now - new Date(lastSession.fullDate)) / 3600000 : 100;
    
    // Calculate Streak (Weeks with 3+ workouts)
    let streak = 0;
    for (let i = 0; i < 12; i++) {
      const weekStart = new Date(); weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
      const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
      const count = history.filter(h => {
        const d = new Date(h.fullDate);
        return d >= weekStart && d < weekEnd && h.id !== 'REST';
      }).length;
      if (count >= 3) streak++; else break;
    }

    return { 
      status: diffHours < 20 ? 'HEALING' : 'OPTIMAL',
      statusColor: diffHours < 20 ? '#F59E0B' : T.accent,
      streak 
    };
  }, [history]);

  // --- 5. HANDLERS ---
  const startWorkout = (id) => {
    const preset = WORKOUTS[id];
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    const counts = {}; list.forEach(ex => counts[ex.id] = 3);
    setSetCounts(counts);
    setView('train');
  };

  const logRest = () => {
    const entry = {
      id: 'REST', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      fullDate: new Date().toISOString(), name: "REST & RECOVERY", color: T.rest, details: [], volume: 0
    };
    setHistory([entry, ...history]);
    setView('log');
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
      id: activeSession.id, fullDate: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      name: activeSession.name, color: activeSession.color, details,
      volume: details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0)
    }, ...history]);
    setActiveSession(null); setSessionData({}); setView('log');
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', color: stats.statusColor, fontWeight: '900' }}>{stats.status}</span>
            <span style={{ fontSize: '10px', color: T.subtext, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Flame size={10} fill={stats.streak > 0 ? '#FF6B00' : 'none'}/> {stats.streak} WEEK STREAK
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
          {['menu', 'log'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '8px' }}>
              {v === 'menu' ? <Play size={20}/> : <History size={20}/>}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: '900', color: T.subtext, marginBottom: '8px' }}>DAILY TARGET</div>
            <div style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>
              {history[0]?.id === 'SHRED' ? 'POWER PROTOCOL' : 'SHRED PROTOCOL'}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => startWorkout(history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED')} style={{ flex: 2, background: T.accent, border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900' }}>START</button>
              <button onClick={logRest} style={{ flex: 1, background: T.card, color: T.rest, border: 'none', padding: '16px', borderRadius: '14px' }}><Coffee size={20} style={{margin:'0 auto'}}/></button>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Object.values(WORKOUTS).map(w => (
              <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '20px', borderRadius: '20px', textAlign: 'left', color: '#FFF' }}>
                <div style={{ color: w.color, fontWeight: '900', fontSize: '14px' }}>{w.name}</div>
                <div style={{ color: T.subtext, fontSize: '10px', marginTop: '4px' }}>{w.rest}s REST</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: '900', fontSize: '17px', marginBottom: '15px' }}>{ex.name}</div>
              {[...Array(setCounts[ex.id] || 3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button type="button" onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '50px', height: '50px', background: T.card, borderRadius: '12px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <input type="number" placeholder="KG" onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: '#FFF', textAlign: 'center' }} />
                  <input type="number" placeholder="REPS" onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: T.accent, textAlign: 'center' }} />
                </div>
              ))}
              <button onClick={() => setSetCounts({...setCounts, [ex.id]: (setCounts[ex.id] || 3) + 1})} style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px dashed ${T.border}`, borderRadius: '10px', color: T.subtext, fontSize: '11px' }}>+ ADD SET</button>
            </div>
          ))}
          <button onClick={finishSession} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.accent, padding: '20px', borderRadius: '18px', fontWeight: '900', color: '#000', border: 'none' }}>LOG SESSION</button>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.length === 0 && <div style={{ textAlign: 'center', color: T.subtext, marginTop: '50px' }}>No sessions yet.</div>}
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '18px', borderRadius: '18px', borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '900', fontSize: '14px' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '10px' }}>{h.name}</span>
              </div>
              {h.volume > 0 && <div style={{ fontSize: '11px', color: T.subtext, marginTop: '5px' }}>{h.volume.toLocaleString()} KG VOLUME</div>}
            </div>
          ))}
          <button onClick={() => { if(confirm('Wipe?')) setHistory([]); }} style={{ opacity: 0.2, marginTop: '20px', color: '#F00', background: 'none', border: 'none' }}>Wipe Data</button>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '24px', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ fontWeight: '950', fontSize: '36px' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', textAlign: 'right' }}>RESTING</div>
        </div>
      )}

      {/* TIMER LOGIC */}
      {useEffect(() => {
        let timer;
        if (timeLeft > 0) timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
