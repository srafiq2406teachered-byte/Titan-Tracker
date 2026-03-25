import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, History, Play, Check, Plus, Trophy, Calendar, 
  TrendingUp, Zap, BarChart2, Coffee, Wind, Sun, Flame, Activity, Waves
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIGURATION ---
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

  const EXTRAS = [
    { id: 'WALK', name: 'Zone 2 Walk', type: 'MIN', color: '#FACC15', icon: <Sun size={14}/> },
    { id: 'SWIM', name: 'Recovery Swim', type: 'MIN', color: '#38BDF8', icon: <Waves size={14}/> },
    { id: 'STRETCH', name: 'Mobility/Yoga', type: 'MIN', color: '#FB7185', icon: <Wind size={14}/> }
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
    const saved = localStorage.getItem('titan_v53_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v53_data', JSON.stringify(history));
  }, [history]);

  // --- 4. ENGINE (STREAKS & LOGIC) ---
  const stats = useMemo(() => {
    if (!history.length) return { status: 'READY', streak: 0 };
    const now = new Date();
    const diffHours = (now - new Date(history[0].fullDate)) / 3600000;
    
    let streak = 0;
    for (let i = 0; i < 8; i++) {
      const start = new Date(); start.setDate(now.getDate() - (i * 7 + now.getDay()));
      const end = new Date(start); end.setDate(start.getDate() + 7);
      const count = history.filter(h => {
        const d = new Date(h.fullDate);
        return d >= start && d < end && !['REST', 'WALK', 'SWIM', 'STRETCH'].includes(h.id);
      }).length;
      if (count >= 3) streak++; else break;
    }
    return { status: diffHours < 20 ? 'HEALING' : 'OPTIMAL', streak };
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

  const startExtra = (ext) => {
    setActiveSession({ id: ext.id, name: ext.name, color: ext.color, rest: 0, list: [{ id: ext.id, name: ext.name, type: ext.type }] });
    setSetCounts({ [ext.id]: 1 });
    setView('train');
  };

  const logRest = () => {
    const entry = {
      id: 'REST', date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      fullDate: new Date().toISOString(), name: "REST DAY", color: T.rest, details: [], volume: 0
    };
    setHistory([entry, ...history]);
    setView('log');
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < (setCounts[ex.id] || 1); i++) {
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
            <span style={{ fontSize: '10px', color: stats.status === 'HEALING' ? '#F59E0B' : T.accent, fontWeight: '900' }}>{stats.status}</span>
            <span style={{ fontSize: '10px', color: T.subtext, fontWeight: '900', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Flame size={10} fill={stats.streak > 0 ? '#FF6B00' : 'none'}/> {stats.streak} WK STREAK
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px' }}><Play size={20}/></button>
          <button onClick={() => setView('log')} style={{ border: 'none', padding: '10px', background: view === 'log' ? T.card : 'transparent', color: view === 'log' ? T.accent : T.subtext, borderRadius: '8px' }}><History size={20}/></button>
        </div>
      </div>

      {/* MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: '10px', fontWeight: '900', color: T.subtext, marginBottom: '8px' }}>SUGGESTED SESSION</div>
            <div style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px' }}>
              {history[0]?.id === 'SHRED' ? 'POWER PROTOCOL' : 'SHRED PROTOCOL'}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => startWorkout(history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED')} style={{ flex: 2, background: T.accent, border: 'none', padding: '18px', borderRadius: '15px', fontWeight: '900' }}>TRAIN</button>
              <button onClick={logRest} style={{ flex: 1, background: T.card, color: T.rest, border: 'none', padding: '18px', borderRadius: '15px' }}><Coffee size={20} style={{margin:'0 auto'}}/></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
             {EXTRAS.map(ext => (
               <button key={ext.id} onClick={() => startExtra(ext)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '16px', borderRadius: '18px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{color: ext.color}}>{ext.icon}</div>
                 <div style={{fontSize: '13px', fontWeight: '700', color: '#FFF'}}>{ext.name}</div>
               </button>
             ))}
          </div>
        </div>
      )}

      {/* TRAINING */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: '900', fontSize: '17px', marginBottom: '15px' }}>{ex.name}</div>
              {[...Array(setCounts[ex.id] || 1)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button type="button" onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '50px', height: '50px', background: T.card, borderRadius: '12px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <input type="number" placeholder={ex.type === 'MIN' ? 'MIN' : 'KG'} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: '#FFF', textAlign: 'center' }} />
                  <input type="number" placeholder={ex.type === 'MIN' ? 'BPM' : 'REPS'} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: T.accent, textAlign: 'center' }} />
                </div>
              ))}
              {activeSession.rest > 0 && (
                <button onClick={() => setSetCounts({...setCounts, [ex.id]: (setCounts[ex.id] || 3) + 1})} style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px dashed ${T.border}`, borderRadius: '10px', color: T.subtext, fontSize: '11px' }}>+ ADD SET</button>
              )}
            </div>
          ))}
          <button onClick={finishSession} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.accent, padding: '24px', borderRadius: '18px', fontWeight: '900', color: '#000', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>LOG SESSION</button>
        </div>
      )}

      {/* LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '18px', borderRadius: '18px', borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '900', fontSize: '14px' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '10px' }}>{h.name}</span>
              </div>
              {h.volume > 0 && <div style={{ fontSize: '11px', color: T.subtext, marginTop: '5px' }}>{h.volume.toLocaleString()} KG VOLUME</div>}
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '24px', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ fontWeight: '950', fontSize: '36px' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', textAlign: 'right' }}>RESTING</div>
        </div>
      )}

      {/* TIMER TICKER */}
      {useEffect(() => {
        let timer;
        if (timeLeft > 0) timer = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(timer);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
