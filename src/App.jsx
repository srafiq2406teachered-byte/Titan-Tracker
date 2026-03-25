import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, History, Play, Check, Plus, 
  Trophy, Calendar, TrendingUp, Zap, ChevronRight, BarChart2
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

  // --- 2. THEME ---
  const T = {
    bg: '#0A0F1E', surface: '#161E31', card: '#232D45', accent: '#10B981',
    text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.08)'
  };

  // --- 3. STATE ---
  const [view, setView] = useState('menu'); // menu, train, log, metrics
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [setCounts, setSetCounts] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 4. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v49_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v49_data', JSON.stringify(history));
  }, [history]);

  // --- 5. INTELLIGENCE (PB & SUGGESTIONS) ---
  const personalBests = useMemo(() => {
    const pbs = {};
    history.forEach(session => {
      session.details.forEach(ex => {
        const maxWeight = Math.max(...ex.sets.map(s => parseFloat(s.w) || 0));
        if (!pbs[ex.name] || maxWeight > pbs[ex.name]) pbs[ex.name] = maxWeight;
      });
    });
    return pbs;
  }, [history]);

  const getSmartSuggestion = (exName) => {
    const pb = personalBests[exName];
    if (!pb) return "EVALUATING...";
    return `${pb + 2.5}KG`; // Suggest a 2.5kg increase over PB
  };

  const nextWorkoutSuggestion = useMemo(() => {
    if (history.length === 0) return "SHRED";
    return history[0].id === 'SHRED' ? 'POWER' : 'SHRED';
  }, [history]);

  // --- 6. HANDLERS ---
  const startWorkout = (id) => {
    const preset = WORKOUTS[id];
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    const counts = {}; list.forEach(ex => counts[ex.id] = 3);
    setSetCounts(counts);
    setView('train');
  };

  const handleSetToggle = (exId, setIdx) => {
    const key = `${exId}-s${setIdx}-done`;
    setSessionData(prev => ({ ...prev, [key]: !prev[key] }));
    if (!sessionData[key]) setTimeLeft(activeSession.rest);
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < setCounts[ex.id]; i++) {
        const w = sessionData[`${ex.id}-s${i}-w`];
        const r = sessionData[`${ex.id}-s${i}-r`];
        if (w && r) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    if (details.length === 0) return setView('menu');
    
    const newEntry = {
      id: activeSession.id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      fullDate: new Date().toISOString(),
      name: activeSession.name,
      color: activeSession.color,
      details,
      volume: details.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + (s.w * s.r), 0), 0)
    };

    setHistory([newEntry, ...history]);
    setActiveSession(null); setSessionData({}); setView('log');
  };

  // --- 7. UI COMPONENTS ---
  const CalendarStrip = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const today = new Date().getDay();
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: `1px solid ${T.border}` }}>
        {days.map((d, i) => {
          const workedOut = history.some(h => new Date(h.fullDate).getDay() === i && (new Date() - new Date(h.fullDate)) < 604800000);
          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: T.subtext, marginBottom: '5px' }}>{d}</div>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: workedOut ? T.accent : T.surface, border: i === today ? `2px solid ${T.accent}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                {workedOut && <Check size={14} color="#000" />}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'system-ui' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <span style={{ fontSize: '10px', color: T.subtext, fontWeight: 'bold' }}>Q1 2026 RECOMP</span>
        </div>
        <div style={{ display: 'flex', background: T.surface, padding: '5px', borderRadius: '12px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: T.text, borderRadius: '8px' }}><Play size={18}/></button>
          <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: T.text, borderRadius: '8px' }}><BarChart2 size={18}/></button>
          <button onClick={() => setView('log')} style={{ border: 'none', padding: '10px', background: view === 'log' ? T.card : 'transparent', color: T.text, borderRadius: '8px' }}><History size={18}/></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CalendarStrip />
          
          <div style={{ background: `linear-gradient(135deg, ${T.surface}, ${T.bg})`, padding: '20px', borderRadius: '20px', border: `1px solid ${T.accent}33` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: T.accent, marginBottom: '5px' }}>
              <Zap size={16} fill={T.accent} />
              <span style={{ fontSize: '12px', fontWeight: '900' }}>DAILY SUGGESTION</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>Run the {nextWorkoutSuggestion} Protocol</div>
            <button onClick={() => startWorkout(nextWorkoutSuggestion)} style={{ marginTop: '15px', width: '100%', background: T.accent, border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '900' }}>START NOW</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {Object.values(WORKOUTS).map(w => (
              <div key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '20px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
                <div style={{ color: w.color, fontWeight: '900', fontSize: '14px' }}>{w.name}</div>
                <div style={{ color: T.subtext, fontSize: '10px', marginTop: '5px' }}>{w.rest}s REST</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '100px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '16px' }}>{ex.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: T.accent, fontWeight: '900' }}>PB: {personalBests[ex.name] || 0}KG</div>
                  <div style={{ fontSize: '10px', color: T.subtext }}>NEXT: {getSmartSuggestion(ex.name)}</div>
                </div>
              </div>
              
              {[...Array(setCounts[ex.id])].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button 
                    type="button"
                    onClick={() => handleSetToggle(ex.id, i)}
                    style={{ width: '50px', height: '50px', background: sessionData[`${ex.id}-s${i}-done`] ? T.accent : T.card, borderRadius: '12px', border: 'none', color: sessionData[`${ex.id}-s${i}-done`] ? '#000' : T.subtext, fontWeight: '900' }}
                  >
                    {i + 1}
                  </button>
                  <input type="number" placeholder="KG" value={sessionData[`${ex.id}-s${i}-w`] || ''} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})} style={{ flex: 1, height: '50px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: '12px', color: '#FFF', textAlign: 'center', fontWeight: 'bold' }} />
                  <input type="number" placeholder="REPS" value={sessionData[`${ex.id}-s${i}-r`] || ''} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})} style={{ flex: 1, height: '50px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: '12px', color: T.accent, textAlign: 'center', fontWeight: 'bold' }} />
                </div>
              ))}
              <button onClick={() => setSetCounts({...setCounts, [ex.id]: setCounts[ex.id] + 1})} style={{ width: '100%', padding: '10px', background: 'transparent', border: `1px dashed ${T.border}`, borderRadius: '10px', color: T.subtext, fontSize: '12px' }}>+ ADD SET</button>
            </div>
          ))}
          <button onClick={finishSession} style={{ background: T.accent, padding: '20px', borderRadius: '15px', fontWeight: '900', color: '#000', border: 'none' }}>LOG SESSION</button>
        </div>
      )}

      {/* VIEW: METRICS (PB & VOLUME) */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '900', color: T.subtext }}>PERSONAL BESTS</h3>
          {EXERCISES.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '800' }}>{ex.name}</span>
              <span style={{ color: T.accent, fontWeight: '900' }}>{personalBests[ex.name] || 0} KG</span>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '20px', background: T.surface, borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: T.subtext }}>TOTAL LIFETIME VOLUME</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: T.accent }}>{history.reduce((acc, curr) => acc + (curr.volume || 0), 0).toLocaleString()} KG</div>
          </div>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '900' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '12px' }}>{h.name}</span>
              </div>
              <div style={{ fontSize: '11px', color: T.subtext }}>Session Volume: {h.volume?.toLocaleString()} KG</div>
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '20px', borderRadius: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ fontWeight: '900', fontSize: '32px' }}>{timeLeft}s</span>
          <span style={{ fontWeight: '900' }}>RESTING</span>
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
