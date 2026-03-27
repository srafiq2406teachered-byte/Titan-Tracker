/* --- 1. FULL IMPORTS & CONFIG --- */
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, Trash2, Zap, TrendingUp, Check
} from 'lucide-react';

const TitanTracker = () => {
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs" }, { id: "A2", name: "Lat Pulldown", muscle: "Back" },
    { id: "B1", name: "Chest Press", muscle: "Chest" }, { id: "B2", name: "Leg Curl", muscle: "Legs" }
  ];

  const EXTRA_POOL = [
    { id: "C1", name: "Treadmill", muscle: "Cardio" }, { id: "E1", name: "Bicep Curls", muscle: "Arms" },
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" }, { id: "E5", name: "Calf Raises", muscle: "Legs" }
  ];

  /* --- 2. STATE --- */
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });

  /* --- 3. PERSISTENCE & TIMER --- */
  useEffect(() => {
    const saved = localStorage.getItem('titan_v71_engine');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.accent) setAccent(d.accent);
      if (d.fontSize) setFontSize(d.fontSize);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v71_engine', JSON.stringify({ history, accent, fontSize, bio }));
  }, [history, accent, fontSize, bio]);

  useEffect(() => {
    let t;
    if (timeLeft > 0) {
      t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    }
    return () => clearInterval(t);
  }, [timeLeft]);

  /* --- 4. LOGIC --- */
  const triggerHaptic = (type = 50) => { if (window.navigator?.vibrate) window.navigator.vibrate(type); };
  
  const bmi = (bio.weight / ((bio.height / 100) ** 2)).toFixed(1);

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
    const currentSet = { ...newData[instanceId][setIdx] };
    currentSet[field] = Math.max(0, (parseFloat(currentSet[field]) || 0) + val);
    newData[instanceId][setIdx] = currentSet;
    setSessionData(newData);
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: sessionData[ex.instanceId].filter(s => s.w > 0 || s.r > 0)
    })).filter(d => d.sets.length > 0);
    setHistory([{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, details }, ...history]);
    setActiveSession(null); 
    setView('metrics');
  };

  const T = { bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent, text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.1)' };

  /* --- 5. RENDER --- */
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontSize: `${fontSize}px`, fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* NAV */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
        <h1 style={{ fontWeight: '950' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px' }}><Play size={18}/></button>
          <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '10px' }}><Calculator size={18}/></button>
          <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px' }}><BarChart2 size={18}/></button>
          <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px' }}><Settings size={18}/></button>
        </div>
      </div>

      {/* VIEWS */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '25px', borderRadius: '20px', border: 'none', textAlign: 'left', color: '#FFF' }}>
              <div style={{ color: w.color, fontWeight: '900' }}>{w.name}</div>
            </button>
          ))}
        </div>
      )}

      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '100px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '15px', borderRadius: '15px', marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{ex.name}</div>
              {sessionData[ex.instanceId]?.map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                  <input type="number" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', parseFloat(e.target.value) - set.w)} style={{ width: '50%', background: T.bg, border: 'none', color: '#FFF', padding: '8px', textAlign: 'center' }} />
                  <input type="number" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', parseInt(e.target.value) - set.r)} style={{ width: '50%', background: T.bg, border: 'none', color: '#FFF', padding: '8px', textAlign: 'center' }} />
                </div>
              ))}
            </div>
          ))}
          <button onClick={finishSession} style={{ width: '100%', background: T.accent, padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>FINISH</button>
        </div>
      )}

      {view === 'biometrics' && (
        <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
          <h2 style={{ marginBottom: '15px' }}>BIOMETRICS</h2>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: T.accent }}>BMI: {bmi}</div>
          <p style={{ color: T.subtext }}>Ensure height/weight are accurate in Settings.</p>
        </div>
      )}

      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label>Weight (kg)</label>
            <input type="number" value={bio.weight} onChange={e => setBio({...bio, weight: e.target.value})} style={{ width: '100%', padding: '10px', background: T.surface, color: '#FFF', border: 'none' }} />
          </div>
          <div>
            <label>Accent Color</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {['#10B981', '#3B82F6', '#EF4444'].map(c => (
                <div key={c} onClick={() => setAccent(c)} style={{ width: '40px', height: '40px', background: c, borderRadius: '50%', border: accent === c ? '3px solid #FFF' : 'none' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#000', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold' }}>REST: {timeLeft}s</div>}
      
    </div>
  );
};

export default TitanTracker;