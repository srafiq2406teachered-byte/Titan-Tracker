import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, History, Play, Check, Plus, Trophy, Calendar, 
  TrendingUp, Zap, BarChart2, Coffee, Wind, Sun
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA ---
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"], color: '#3B82F6' },
    REST: { id: 'REST', name: "RECOVERY DAY", rest: 0, ids: [], color: '#A855F7' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press" }, { id: "A2", name: "Lat Pulldown" },
    { id: "B1", name: "Chest Press" }, { id: "B2", name: "Leg Curl" },
    { id: "C1", name: "Cable Row" }, { id: "C2", name: "DB Press" },
    { id: "D1", name: "Plank/Core" }, { id: "D2", name: "Walking Lunges" }
  ];

  const EXTRA_ACTIVITIES = [
    { id: 'walk', name: 'Zone 2 Walk', type: 'MIN', icon: <Sun size={14}/> },
    { id: 'stretch', name: 'Mobility/Stretch', type: 'MIN', icon: <Wind size={14}/> },
    { id: 'pool', name: 'Swim/Recovery', type: 'MIN', icon: <Activity size={14}/> }
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
    const saved = localStorage.getItem('titan_v51_data');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v51_data', JSON.stringify(history));
  }, [history]);

  // --- 4. ANALYTICS ---
  const recoveryStatus = useMemo(() => {
    if (history.length === 0) return { status: 'READY', color: T.accent };
    const lastDate = new Date(history[0].fullDate);
    const diffHours = (new Date() - lastDate) / (1000 * 60 * 60);
    
    if (history[0].id === 'REST') return { status: 'RECOVERED', color: T.rest };
    if (diffHours < 20) return { status: 'HEALING', color: '#F59E0B' };
    return { status: 'OPTIMAL', color: T.accent };
  }, [history]);

  const volumeTrend = useMemo(() => {
    const now = new Date();
    return [3, 2, 1, 0].map(w => {
      const start = new Date(now);
      start.setDate(now.getDate() - (w * 7 + now.getDay()));
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const vol = history.filter(h => {
        const d = new Date(h.fullDate);
        return d >= start && d < end;
      }).reduce((acc, h) => acc + (h.volume || 0), 0);
      return { label: w === 0 ? 'THIS' : `W-${w}`, vol };
    });
  }, [history]);

  // --- 5. HANDLERS ---
  const startWorkout = (id) => {
    const preset = WORKOUTS[id];
    if (id === 'REST') {
      logRestDay();
      return;
    }
    const list = EXERCISES.filter(e => preset.ids.includes(e.id));
    setActiveSession({ ...preset, list });
    const counts = {}; list.forEach(ex => counts[ex.id] = 3);
    setSetCounts(counts);
    setView('train');
  };

  const logRestDay = () => {
    const newEntry = {
      id: 'REST',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      fullDate: new Date().toISOString(),
      name: "REST & RECOVER",
      color: T.rest,
      details: [{ name: "Central Nervous System Reset", sets: [{ w: 'RECOVERY', r: '100%' }] }],
      volume: 0
    };
    setHistory([newEntry, ...history]);
    setView('log');
  };

  const addExtra = (act) => {
    const id = `ext-${Date.now()}`;
    const newItem = { id, name: act.name, type: act.type };
    if (activeSession) {
      setActiveSession({ ...activeSession, list: [...activeSession.list, newItem] });
    } else {
      setActiveSession({ name: "ACTIVE RECOVERY", rest: 30, list: [newItem], color: '#60A5FA' });
    }
    setSetCounts(prev => ({ ...prev, [id]: 1 }));
    setView('train');
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < setCounts[ex.id]; i++) {
        const w = parseFloat(sessionData[`${ex.id}-s${i}-w`]) || 0;
        const r = parseFloat(sessionData[`${ex.id}-s${i}-r`]) || 0;
        if (w || r) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    if (details.length === 0) return setView('menu');
    
    setHistory([{
      id: activeSession.id || 'EXTRA',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      fullDate: new Date().toISOString(),
      name: activeSession.name,
      color: activeSession.color || T.accent,
      details,
      volume: details.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + (s.w * s.r), 0), 0)
    }, ...history]);
    setActiveSession(null); setSessionData({}); setView('log');
  };

  // --- 6. RENDER ---
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'system-ui' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', margin: 0 }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: recoveryStatus.color }} />
            <span style={{ fontSize: '10px', color: T.subtext, fontWeight: 'bold' }}>SYSTEM: {recoveryStatus.status}</span>
          </div>
        </div>
        <div style={{ display: 'flex', background: T.surface, padding: '5px', borderRadius: '12px' }}>
          {['menu', 'metrics', 'log'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '8px' }}>
              {v === 'menu' && <Play size={18}/>}
              {v === 'metrics' && <BarChart2 size={18}/>}
              {v === 'log' && <History size={18}/>}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* RECOMMENDATION CARD */}
          <div style={{ background: `linear-gradient(135deg, ${T.surface}, #1e293b)`, padding: '24px', borderRadius: '24px', border: `1px solid ${recoveryStatus.color}44` }}>
            <div style={{ color: recoveryStatus.color, fontWeight: '950', fontSize: '10px', marginBottom: '8px', letterSpacing: '1px' }}>RECOVERY ENGINE SAYS:</div>
            <div style={{ fontSize: '20px', fontWeight: '900' }}>
              {recoveryStatus.status === 'HEALING' ? 'Focus on Mobility' : `Run the ${history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED'} Protocol`}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => startWorkout(history[0]?.id === 'SHRED' ? 'POWER' : 'SHRED')} style={{ flex: 2, background: T.accent, color: '#000', border: 'none', padding: '16px', borderRadius: '14px', fontWeight: '950' }}>TRAIN</button>
              <button onClick={() => startWorkout('REST')} style={{ flex: 1, background: T.surface, color: T.rest, border: `1px solid ${T.rest}44`, padding: '16px', borderRadius: '14px', fontWeight: '950' }}><Coffee size={20} style={{margin:'0 auto'}}/></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {EXTRA_ACTIVITIES.map(act => (
              <button key={act.id} onClick={() => addExtra(act)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '15px', borderRadius: '18px', color: T.text, display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '13px' }}>
                {act.icon} {act.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '120px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: '900', fontSize: '17px', marginBottom: '15px' }}>{ex.name}</div>
              {[...Array(setCounts[ex.id])].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button type="button" onClick={() => { setTimeLeft(activeSession.rest); setSessionData({...sessionData, [`${ex.id}-s${i}-done`]: true}) }} style={{ width: '50px', height: '50px', background: sessionData[`${ex.id}-s${i}-done`] ? T.accent : T.card, borderRadius: '12px', border: 'none', color: sessionData[`${ex.id}-s${i}-done`] ? '#000' : T.subtext, fontWeight: '950' }}>{i + 1}</button>
                  <input type="number" placeholder={ex.type} onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-w`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: '#FFF', textAlign: 'center', fontWeight: 'bold' }} />
                  <input type="number" placeholder="REPS" onChange={e => setSessionData({...sessionData, [`${ex.id}-s${i}-r`]: e.target.value})} style={{ flex: 1, height: '50px', background: '#000', border: `1px solid ${T.border}`, borderRadius: '12px', color: T.accent, textAlign: 'center', fontWeight: 'bold' }} />
                </div>
              ))}
              <button onClick={() => setSetCounts({...setCounts, [ex.id]: setCounts[ex.id] + 1})} style={{ width: '100%', padding: '12px', background: 'transparent', border: `1px dashed ${T.border}`, borderRadius: '12px', color: T.subtext, fontSize: '11px', fontWeight: 'bold' }}>+ ADD SET</button>
            </div>
          ))}
          <button onClick={finishSession} style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.accent, padding: '24px', borderRadius: '18px', fontWeight: '950', color: '#000', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>LOG ACTIVITY</button>
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '24px' }}>
             <div style={{ fontSize: '10px', fontWeight: '900', color: T.subtext, marginBottom: '15px' }}>PROGRESSION (VOLUME KG)</div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '80px', gap: '8px' }}>
                {volumeTrend.reverse().map((w, i) => (
                  <div key={i} style={{ flex: 1, background: i === 3 ? T.accent : T.card, height: `${(w.vol / (Math.max(...volumeTrend.map(v => v.vol)) || 1)) * 100}%`, borderRadius: '4px' }} />
                ))}
             </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: T.surface, padding: '15px', borderRadius: '18px' }}>
              <div style={{ fontSize: '10px', color: T.subtext, fontWeight: 'bold' }}>RECOVERY LOGS</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: T.rest }}>{history.filter(h => h.id === 'REST').length}</div>
            </div>
            <div style={{ background: T.surface, padding: '15px', borderRadius: '18px' }}>
              <div style={{ fontSize: '10px', color: T.subtext, fontWeight: 'bold' }}>WORKOUTS</div>
              <div style={{ fontSize: '20px', fontWeight: '900', color: T.accent }}>{history.filter(h => h.id !== 'REST').length}</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '18px', borderRadius: '18px', borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '13px' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '10px' }}>{h.name}</span>
              </div>
              {h.volume > 0 && <div style={{ fontSize: '10px', color: T.subtext, marginTop: '4px' }}>{h.volume.toLocaleString()} KG VOL</div>}
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '24px', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ fontWeight: '950', fontSize: '36px' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', textAlign: 'right', fontSize: '14px' }}>RESTING</div>
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
