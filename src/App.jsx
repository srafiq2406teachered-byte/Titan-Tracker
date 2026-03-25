import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, History, Play, Check, Plus, 
  Trophy, Calendar, TrendingUp, Zap, ChevronRight, BarChart2, Activity
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

  const T = {
    bg: '#0A0F1E', surface: '#161E31', card: '#232D45', accent: '#10B981',
    text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.08)'
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
    const saved = localStorage.getItem('titan_v50_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v50_data', JSON.stringify(history));
  }, [history]);

  // --- 4. ANALYTICS ENGINE ---
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

  const volumeTrend = useMemo(() => {
    const now = new Date();
    const weeks = [0, 1, 2, 3].map(w => {
      const start = new Date(now);
      start.setDate(now.getDate() - (w * 7 + now.getDay()));
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      
      const vol = history
        .filter(h => {
          const d = new Date(h.fullDate);
          return d >= start && d < end;
        })
        .reduce((acc, h) => acc + (h.volume || 0), 0);
      
      return { label: w === 0 ? 'THIS' : `W-${w}`, vol };
    }).reverse();
    return weeks;
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

  const handleSetToggle = (exId, setIdx) => {
    const key = `${exId}-s${setIdx}-done`;
    setSessionData(prev => ({ ...prev, [key]: !prev[key] }));
    if (!sessionData[key]) setTimeLeft(activeSession.rest);
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < setCounts[ex.id]; i++) {
        const w = parseFloat(sessionData[`${ex.id}-s${i}-w`]) || 0;
        const r = parseFloat(sessionData[`${ex.id}-s${i}-r`]) || 0;
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

  // --- 6. UI COMPONENTS ---
  const TrendChart = () => {
    const maxVol = Math.max(...volumeTrend.map(w => w.vol), 1);
    return (
      <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '900', color: T.subtext, marginBottom: '20px', letterSpacing: '1px' }}>WEEKLY VOLUME (KG)</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '120px', gap: '10px' }}>
          {volumeTrend.map((w, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '100%', 
                background: i === 3 ? T.accent : T.card, 
                height: `${(w.vol / maxVol) * 100}%`, 
                borderRadius: '6px',
                transition: 'height 0.5s ease'
              }} />
              <div style={{ fontSize: '9px', fontWeight: 'bold', color: i === 3 ? T.accent : T.subtext }}>{w.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'system-ui' }}>
      
      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0, letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
        <div style={{ display: 'flex', background: T.surface, padding: '5px', borderRadius: '12px' }}>
          {['menu', 'metrics', 'log'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '8px', transition: '0.2s' }}>
              {v === 'menu' && <Play size={18}/>}
              {v === 'metrics' && <BarChart2 size={18}/>}
              {v === 'log' && <History size={18}/>}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: `linear-gradient(135deg, ${T.surface}, #1e293b)`, padding: '24px', borderRadius: '24px', border: `1px solid ${T.accent}22` }}>
            <div style={{ color: T.accent, fontWeight: '900', fontSize: '10px', marginBottom: '8px', letterSpacing: '1px' }}>NEXT UP</div>
            <div style={{ fontSize: '20px', fontWeight: '900' }}>Run the {history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED'} Protocol</div>
            <button onClick={() => startWorkout(history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED')} style={{ marginTop: '20px', width: '100%', background: T.accent, color: '#000', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '950', fontSize: '16px' }}>START SESSION</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {Object.values(WORKOUTS).map(w => (
              <div key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '20px', borderRadius: '20px', border: `1px solid ${T.border}`, cursor: 'pointer' }}>
                <div style={{ color: w.color, fontWeight: '900', fontSize: '14px' }}>{w.name}</div>
                <div style={{ color: T.subtext, fontSize: '10px', marginTop: '4px' }}>{w.rest}s REST INTERVAL</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '17px' }}>{ex.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: T.accent, fontWeight: '900' }}>PB: {personalBests[ex.name] || 0}KG</div>
                </div>
              </div>
              {[...Array(setCounts[ex.id])].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button type="button" onClick={() => handleSetToggle(ex.id, i)} style={{ width: '50px', height: '50px', background: sessionData[`${ex.id}-s${i}-done`] ? T.accent : T.card, borderRadius: '12px', border: 'none', color: sessionData[`${ex.id}-s${i}-done`] ? '#000' : T.subtext, fontWeight: '950' }}>{i + 1}</button>
                  <input type="number" placeholder="KG" value={sessionData[`${ex.id}-s${i}-w`] || ''} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: '#FFF', textAlign: 'center', fontWeight: 'bold' }} />
                  <input type="number" placeholder="REPS" value={sessionData[`${ex.id}-s${i}-r`] || ''} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: T.accent, textAlign: 'center', fontWeight: 'bold' }} />
                </div>
              ))}
              <button onClick={() => setSetCounts({...setCounts, [ex.id]: setCounts[ex.id] + 1})} style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px dashed ${T.border}`, borderRadius: '12px', color: T.subtext, fontSize: '12px', fontWeight: 'bold' }}>+ ADD SET</button>
            </div>
          ))}
          <button onClick={finishSession} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.accent, padding: '24px', borderRadius: '18px', fontWeight: '950', color: '#000', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>FINISH SESSION</button>
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <TrendChart />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
              <div style={{ fontSize: '10px', color: T.subtext, fontWeight: 'bold' }}>SESSIONS</div>
              <div style={{ fontSize: '24px', fontWeight: '900' }}>{history.length}</div>
            </div>
            <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
              <div style={{ fontSize: '10px', color: T.subtext, fontWeight: 'bold' }}>TOTAL KG</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: T.accent }}>{(history.reduce((acc, h) => acc + (h.volume || 0), 0) / 1000).toFixed(1)}k</div>
            </div>
          </div>
          <h3 style={{ fontSize: '12px', fontWeight: '900', color: T.subtext, marginTop: '10px', letterSpacing: '1px' }}>PERSONAL BESTS</h3>
          {EXERCISES.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '800', fontSize: '14px' }}>{ex.name}</span>
              <span style={{ color: T.accent, fontWeight: '900', fontSize: '14px' }}>{personalBests[ex.name] || 0} KG</span>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '20px', borderRadius: '20px', borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '900', fontSize: '14px' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '11px' }}>{h.name}</span>
              </div>
              <div style={{ fontSize: '12px', color: T.subtext, fontWeight: 'bold' }}>{(h.volume || 0).toLocaleString()} KG VOLUME</div>
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '24px', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ fontWeight: '950', fontSize: '36px', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', textAlign: 'right' }}>RESTING<br/><span style={{fontSize: '10px', opacity: 0.7}}>TAP TO SKIP</span></div>
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
