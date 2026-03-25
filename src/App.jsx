import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, History, Play, Check, Plus, Trophy, Calendar, 
  TrendingUp, Zap, BarChart2, Coffee, Wind, Sun, Flame, Activity, Waves, Calculator, AlertTriangle
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA & THEME ---
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
    rest: '#A855F7', text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.08)', danger: '#EF4444'
  };

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [setCounts, setSetCounts] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPlateCalc, setShowPlateCalc] = useState(null); // stores target weight

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v55_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v55_data', JSON.stringify(history));
  }, [history]);

  // --- 4. COACHING ENGINE ---
  const stats = useMemo(() => {
    const now = new Date();
    const lastSession = history[0];
    const diffHours = lastSession ? (now - new Date(lastSession.fullDate)) / 3600000 : 100;
    
    // Deload Logic: Check if last 2 sessions of same protocol had dropping volume
    const sameProtocolHistory = history.filter(h => h.id === lastSession?.id).slice(0, 3);
    const isFatigued = sameProtocolHistory.length >= 3 && 
                       sameProtocolHistory[0].volume < sameProtocolHistory[1].volume &&
                       sameProtocolHistory[1].volume < sameProtocolHistory[2].volume;

    // Ghost Data: Map exercise IDs to their last recorded sets
    const ghost = {};
    history.forEach(session => {
      session.details.forEach(ex => {
        const exId = EXERCISES.find(e => e.name === ex.name)?.id;
        if (exId && !ghost[exId]) ghost[exId] = ex.sets[0]; // Get last best set
      });
    });

    return { status: isFatigued ? 'DELOAD REQ' : (diffHours < 20 ? 'HEALING' : 'OPTIMAL'), isFatigued, ghost };
  }, [history]);

  // --- 5. PLATE CALCULATOR LOGIC ---
  const calculatePlates = (target) => {
    let weight = (target - 20) / 2; // Subtract 20kg bar, divide by 2 sides
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result = [];
    plates.forEach(p => {
      while (weight >= p) {
        result.push(p);
        weight -= p;
      }
    });
    return result;
  };

  // --- 6. HANDLERS ---
  const startWorkout = (id) => {
    const preset = WORKOUTS[id];
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    const counts = {}; list.forEach(ex => counts[ex.id] = 3);
    setSetCounts(counts);
    setView('train');
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

    const volume = details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0);
    const isPR = volume > (history.find(h => h.id === activeSession.id)?.volume || 0);

    setHistory([{
      id: activeSession.id, fullDate: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      name: activeSession.name, color: activeSession.color, details, volume, isPR
    }, ...history]);
    
    if (isPR && window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]);
    setActiveSession(null); setSessionData({}); setView('log');
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
             <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: stats.isFatigued ? T.danger : T.accent }} />
             <span style={{ fontSize: '10px', color: T.subtext, fontWeight: '900' }}>{stats.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px' }}><Play size={18}/></button>
          <button onClick={() => setView('log')} style={{ border: 'none', padding: '10px', background: view === 'log' ? T.card : 'transparent', color: view === 'log' ? T.accent : T.subtext, borderRadius: '8px' }}><History size={18}/></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: stats.isFatigued ? `${T.danger}22` : T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${stats.isFatigued ? T.danger : T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', fontWeight: '900', color: stats.isFatigued ? T.danger : T.subtext }}>COACH SAYS:</span>
              {stats.isFatigued && <AlertTriangle size={14} color={T.danger}/>}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', margin: '10px 0 20px 0' }}>
              {stats.isFatigued ? 'DELOAD RECOMMENDED' : (history[0]?.id === 'SHRED' ? 'POWER PROTOCOL' : 'SHRED PROTOCOL')}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => startWorkout(history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED')} style={{ flex: 2, background: T.accent, border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '900' }}>START</button>
              <button onClick={() => { /* Log rest logic */ }} style={{ flex: 1, background: T.card, color: T.rest, border: 'none', padding: '16px', borderRadius: '14px' }}><Coffee size={20} style={{margin:'0 auto'}}/></button>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '140px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '16px' }}>{ex.name}</span>
                {stats.ghost[ex.id] && (
                  <span style={{ fontSize: '10px', color: T.subtext, fontWeight: 'bold' }}>LAST: {stats.ghost[ex.id].w}KG × {stats.ghost[ex.id].r}</span>
                )}
              </div>
              {[...Array(setCounts[ex.id] || 3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button type="button" onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input type="number" placeholder="KG" value={sessionData[`${ex.id}-s${i}-w`] || ''} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})} style={{ width: '100%', height: '45px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '10px', color: '#FFF', textAlign: 'center' }} />
                    <button onClick={() => setShowPlateCalc(sessionData[`${ex.id}-s${i}-w`])} style={{ position: 'absolute', right: '5px', top: '12px', background: 'none', border: 'none', color: T.subtext }}><Calculator size={14}/></button>
                  </div>
                  <input type="number" placeholder="REPS" onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})} style={{ flex: 1, height: '45px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '10px', color: T.accent, textAlign: 'center' }} />
                </div>
              ))}
            </div>
          ))}
          <button onClick={finishSession} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.accent, padding: '22px', borderRadius: '18px', fontWeight: '900', color: '#000', border: 'none' }}>FINISH SESSION</button>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '18px', borderRadius: '18px', borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '13px' }}>{h.date}</span>
                {h.isPR && <div style={{ background: T.accent, color: '#000', fontSize: '8px', fontWeight: '900', padding: '2px 6px', borderRadius: '4px' }}>NEW VOLUME PR</div>}
                <span style={{ color: h.color, fontWeight: '900', fontSize: '10px' }}>{h.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PLATE CALCULATOR MODAL */}
      {showPlateCalc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', zIndex: 2000 }} onClick={() => setShowPlateCalc(null)}>
          <div style={{ background: T.surface, width: '100%', padding: '30px', borderRadius: '30px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: T.subtext, fontWeight: '900', marginBottom: '10px' }}>PLATE MATH (PER SIDE)</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: T.accent, marginBottom: '20px' }}>{showPlateCalc} KG</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
              {calculatePlates(showPlateCalc).map((p, i) => (
                <div key={i} style={{ padding: '10px 15px', background: T.card, borderRadius: '10px', fontWeight: '900', border: `1px solid ${T.accent}44` }}>{p}</div>
              ))}
            </div>
            <div style={{ marginTop: '20px', fontSize: '10px', color: T.subtext }}>Excludes 20kg bar</div>
          </div>
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
        if (timeLeft === 0 && history.length > 0) { /* Optional: Play sound or vibrate when rest ends */ }
        return () => clearInterval(timer);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
