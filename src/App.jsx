import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, Trash2, Zap, TrendingUp, Check
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG ---
  const THEMES = { EMERALD: '#10B981', SAPPHIRE: '#3B82F6', CRIMSON: '#EF4444' };
  
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs" }, { id: "A2", name: "Lat Pulldown", muscle: "Back" },
    { id: "B1", name: "Chest Press", muscle: "Chest" }, { id: "B2", name: "Leg Curl", muscle: "Legs" }
  ];

  const EXTRA_POOL = [
    { id: "E1", name: "Bicep Curls", muscle: "Arms" }, { id: "E2", name: "Tricep Pushdown", muscle: "Arms" },
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" }, { id: "E4", name: "Face Pulls", muscle: "Back" }
  ];

  // --- 2. UNIFIED STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); // Structured: { [instanceId]: [{w, r}, {w, r}, {w, r}] }
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });

  // --- 3. UTILS & HAPTICS ---
  const triggerHaptic = (type = 50) => {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(type);
  };

  // --- 4. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v71_engine');
    if (saved) {
      const d = JSON.parse(saved);
      setHistory(d.history || []); setAccent(d.accent || '#10B981');
      setFontSize(d.fontSize || 16); setBio(d.bio || { weight: 80, height: 180, age: 30, sex: 'm' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v71_engine', JSON.stringify({ history, accent, fontSize, bio }));
  }, [history, accent, fontSize, bio]);

  // --- 5. CALCULATIONS ---
  const bmi = useMemo(() => (bio.weight / ((bio.height / 100) ** 2)).toFixed(1), [bio]);
  const bmr = useMemo(() => bio.sex === 'm' 
    ? Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5) 
    : Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age - 161), [bio]);

  const getLastLog = (name) => {
    for (let entry of history) {
      const ex = entry.details?.find(d => d.name === name);
      if (ex && ex.sets[0]) return `${ex.sets[0].w}kg x ${ex.sets[0].r}`;
    }
    return "No history";
  };

  // --- 6. CORE ENGINES ---
  const startWorkout = (id) => {
    triggerHaptic(100);
    const p = WORKOUTS[id];
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id)).map(e => ({...e, instanceId: `${e.id}-${Date.now()}`}));
    const initData = {};
    list.forEach(ex => { initData[ex.instanceId] = [{w:0, r:10}, {w:0, r:10}, {w:0, r:10}]; });
    setSessionData(initData);
    setActiveSession({ ...p, list });
    setView('train');
  };

  const updateSet = (instanceId, setIdx, field, val) => {
    const newData = { ...sessionData };
    const currentVal = parseFloat(newData[instanceId][setIdx][field]) || 0;
    newData[instanceId][setIdx][field] = Math.max(0, currentVal + val);
    setSessionData(newData);
  };

  const finishSession = () => {
    triggerHaptic([50, 30, 50]);
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: sessionData[ex.instanceId].filter(s => s.w > 0 || s.r > 0)
    })).filter(d => d.sets.length > 0);

    const vol = details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0);
    setHistory([{ 
      date: new Date().toLocaleDateString('en-GB'), 
      name: activeSession.name, 
      volume: vol,
      details 
    }, ...history]);
    setActiveSession(null); setView('metrics');
  };

  const T = { bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent, text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.1)' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontSize: `${fontSize}px`, fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* PERSISTENT NAV */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontWeight: '900', fontSize: '1.2em' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px' }}><Play size={18}/></button>
            <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '10px' }}><Calculator size={18}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px' }}><BarChart2 size={18}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px' }}><Settings size={18}/></button>
          </div>
        </div>
      )}

      {/* VIEW: TRAIN - REFINED UX */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          {activeSession.list.map((ex) => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '900' }}>{ex.name}</span>
                <button onClick={() => { triggerHaptic(20); setActiveSession(p => ({...p, list: p.list.filter(i => i.instanceId !== ex.instanceId)})); }} style={{ background: 'none', border: 'none', color: '#EF4444' }}><Trash2 size={16}/></button>
              </div>
              <div style={{ fontSize: '0.7em', color: T.accent, fontWeight: '800', marginBottom: '12px' }}>LAST: {getLastLog(ex.name)}</div>
              
              {sessionData[ex.instanceId]?.map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setTimeLeft(activeSession.rest); triggerHaptic(30); }} style={{ width: '40px', height: '40px', background: T.card, border: 'none', borderRadius: '8px', color: T.accent, fontWeight: '900' }}>{i+1}</button>
                  
                  <div style={{ flex: 1, display: 'flex', background: T.bg, borderRadius: '8px', overflow: 'hidden' }}>
                    <button onClick={() => updateSet(ex.instanceId, i, 'w', -2.5)} style={{ padding: '10px', border: 'none', background: 'none', color: T.subtext }}><Minus size={14}/></button>
                    <input type="number" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', parseFloat(e.target.value) - set.w)} style={{ width: '100%', background: 'none', border: 'none', color: '#FFF', textAlign: 'center', fontWeight: '900' }} />
                    <button onClick={() => { updateSet(ex.instanceId, i, 'w', 2.5); triggerHaptic(10); }} style={{ padding: '10px', border: 'none', background: 'none', color: T.accent }}><Plus size={14}/></button>
                  </div>

                  <div style={{ flex: 0.7, display: 'flex', background: T.bg, borderRadius: '8px', overflow: 'hidden' }}>
                    <input type="number" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', parseInt(e.target.value) - set.r)} style={{ width: '100%', background: 'none', border: 'none', color: T.accent, textAlign: 'center', fontWeight: '900' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '460px', margin: '0 auto' }}>
            <button onClick={() => setView('library')} style={{ background: T.surface, border: `2px solid ${T.accent}`, padding: '18px', borderRadius: '18px', color: T.accent, fontWeight: '900' }}>+ EXTRA</button>
            <button onClick={finishSession} style={{ background: T.accent, border: 'none', padding: '18px', borderRadius: '18px', color: '#000', fontWeight: '950' }}>FINISH LOG</button>
          </div>
        </div>
      )}

      {/* VIEW: METRICS - ADDED VOLUME CHART */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: '0.7em', fontWeight: '900', color: T.subtext, marginBottom: '10px' }}>VOLUME TREND (LAST 5)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '100px', padding: '10px 0' }}>
              {history.slice(0, 5).reverse().map((h, i) => {
                const maxVol = Math.max(...history.map(x => x.volume)) || 1;
                const height = (h.volume / maxVol) * 100;
                return <div key={i} style={{ flex: 1, background: T.accent, height: `${height}%`, borderRadius: '4px 4px 0 0', opacity: 0.6 + (i * 0.1) }} />;
              })}
            </div>
          </div>
          <h3 style={{ fontWeight: '900' }}>HISTORY</h3>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{fontWeight: '900'}}>{h.name}</div><div style={{fontSize: '0.7em', opacity: 0.5}}>{h.date}</div></div>
              <div style={{fontWeight: '950', color: T.accent}}>{h.volume.toLocaleString()}kg</div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: BIOMETRICS & MENU (Kept for integrity) */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '30px', borderRadius: '24px', border: `1px solid ${T.border}`, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ color: w.color, fontWeight: '950', fontSize: '1.3em' }}>{w.name}</div>
              <div style={{ fontSize: '0.7em', color: T.subtext, marginTop: '5px', letterSpacing: '1px' }}>CLICK TO COMMENCE</div>
            </button>
          ))}
        </div>
      )}

      {view === 'biometrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
            {['weight', 'height', 'age'].map(k => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{textTransform: 'capitalize', fontWeight: '800'}}>{k}</span>
                <input type="number" value={bio[k]} onChange={e => setBio({...bio, [k]: parseFloat(e.target.value)})} style={{ width: '80px', background: T.bg, border: 'none', color: T.accent, textAlign: 'center', padding: '8px', borderRadius: '8px', fontWeight: '900' }} />
              </div>
            ))}
          </div>
          <div style={{ background: T.accent, color: '#000', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{fontSize: '0.7em', fontWeight: '900'}}>BMI</div><div style={{fontSize: '1.8em', fontWeight: '950'}}>{bmi}</div></div>
            <div style={{textAlign: 'right'}}><div style={{fontSize: '0.7em', fontWeight: '900'}}>BMR</div><div style={{fontSize: '1.8em', fontWeight: '950'}}>{bmr}</div></div>
          </div>
        </div>
      )}

      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
            <div style={{fontWeight: '900', marginBottom: '10px'}}>ACCENT COLOR</div>
            <div style={{display: 'flex', gap: '15px'}}>
              {Object.entries(THEMES).map(([name, hex]) => (
                <div key={name} onClick={() => { setAccent(hex); triggerHaptic(10); }} style={{ width: '40px', height: '40px', borderRadius: '50%', background: hex, border: accent === hex ? '3px solid white' : 'none' }} />
              ))}
            </div>
          </div>
          <button onClick={() => { if(confirm("Wipe all logs?")) { localStorage.clear(); window.location.reload(); }}} style={{ background: '#EF444422', color: '#EF4444', border: 'none', padding: '20px', borderRadius: '15px', fontWeight: '900' }}>RESET ENGINE</button>
        </div>
      )}

      {/* REST TIMER */}
      {timeLeft > 0 && (
        <div onClick={() => { setTimeLeft(0); triggerHaptic(20); }} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.accent, color: '#000', padding: '60px', borderRadius: '50px', textAlign: 'center', boxShadow: `0 0 40px ${T.accent}44` }}>
            <div style={{ fontSize: '5em', fontWeight: '950' }}>{timeLeft}s</div>
            <div style={{ fontWeight: '900', letterSpacing: '2px' }}>BREATHE</div>
          </div>
        </div>
      )}

      {useEffect(() => {
        let t; if (timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        if (timeLeft === 0 && t) triggerHaptic([100, 50, 100]);
        return () => clearInterval(t);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
