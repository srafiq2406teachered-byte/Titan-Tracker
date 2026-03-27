import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, Trash2, Zap, TrendingUp, Check
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG & RECOVERY ---
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs" }, { id: "A2", name: "Lat Pulldown", muscle: "Back" },
    { id: "B1", name: "Chest Press", muscle: "Chest" }, { id: "B2", name: "Leg Curl", muscle: "Legs" }
  ];

  const EXTRA_POOL = [
    { id: "C1", name: "Treadmill", muscle: "Cardio" }, { id: "C2", name: "Elliptical", muscle: "Cardio" },
    { id: "C3", name: "Stationary Bike", muscle: "Cardio" }, { id: "C4", name: "Rowing Machine", muscle: "Cardio" },
    { id: "C5", name: "Stair Climber", muscle: "Cardio" }, { id: "E1", name: "Bicep Curls", muscle: "Arms" }, 
    { id: "E2", name: "Tricep Pushdown", muscle: "Arms" }, { id: "E6", name: "Hammer Curls", muscle: "Arms" },
    { id: "E7", name: "Preacher Curls", muscle: "Arms" }, { id: "E8", name: "Skull Crushers", muscle: "Arms" },
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" }, { id: "E9", name: "Shoulder Press", muscle: "Shoulders" },
    { id: "E10", name: "Front Raises", muscle: "Shoulders" }, { id: "E4", name: "Face Pulls", muscle: "Back" },
    { id: "E11", name: "Seated Row", muscle: "Back" }, { id: "E12", name: "Pull Ups", muscle: "Back" },
    { id: "E13", name: "Chest Fly", muscle: "Chest" }, { id: "E14", name: "Incline Press", muscle: "Chest" },
    { id: "E15", name: "Push Ups", muscle: "Chest" }, { id: "E5", name: "Calf Raises", muscle: "Legs" },
    { id: "E16", name: "Leg Extension", muscle: "Legs" }, { id: "E17", name: "Lunges", muscle: "Legs" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });

  // --- 3. PERSISTENCE & TIMER ---
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

  // --- 4. ENGINE LOGIC ---
  const triggerHaptic = (type = 50) => { if (window.navigator?.vibrate) window.navigator.vibrate(type); };
  
  const bmi = (bio.weight / ((bio.height / 100) ** 2)).toFixed(1);
  const bmr = bio.sex === 'm' 
    ? Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5) 
    : Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age - 161);

  const filteredLib = EXTRA_POOL.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const addExtra = (ex) => {
    const instanceId = `${ex.id}-${Date.now()}`;
    setActiveSession(prev => ({ ...prev, list: [...prev.list, { ...ex, instanceId }] }));
    setSessionData(prev => ({ ...prev, [instanceId]: [{w:0, r:10}, {w:0, r:10}, {w:0, r:10}] }));
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
    const vol = details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0);
    setHistory([{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, volume: vol, details }, ...history]);
    setActiveSession(null); 
    setView('metrics');
  };

  const T = { bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent, text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.1)' };

  // --- 5. RENDER ---
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontSize: `${fontSize}px`, fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* PERSISTENT NAV */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontWeight: '950' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            {['menu', 'biometrics', 'metrics', 'settings'].map((v) => (
              <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '10px' }}>
                {v === 'menu' && <Play size={18}/>}
                {v === 'biometrics' && <Calculator size={18}/>}
                {v === 'metrics' && <BarChart2 size={18}/>}
                {v === 'settings' && <Settings size={18}/>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '30px', borderRadius: '24px', border: `1px solid ${T.border}`, textAlign: 'left', color: '#FFF' }}>
              <div style={{ color: w.color, fontWeight: '950', fontSize: '1.2em' }}>{w.name}</div>
              <div style={{ fontSize: '0.7em', color: T.subtext, marginTop: '5px' }}>START PROTOCOL</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          {activeSession.list.map((ex) => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '900' }}>{ex.name}</span>
                <button onClick={() => setActiveSession(p => ({...p, list: p.list.filter(i => i.instanceId !== ex.instanceId)}))} style={{ background: 'none', border: 'none', color: '#EF4444' }}><Trash2 size={16}/></button>
              </div>
              {sessionData[ex.instanceId]?.map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => { setTimeLeft(activeSession.rest); triggerHaptic(30); }} style={{ width: '40px', background: T.card, border: 'none', borderRadius: '8px', color: T.accent, fontWeight: '900' }}>{i+1}</button>
                  <input type="number" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', parseFloat(e.target.value) - set.w)} style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', borderRadius: '8px', padding: '10px' }} />
                  <input type="number" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', parseInt(e.target.value) - set.r)} style={{ flex: 0.7, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', borderRadius: '8px', padding: '10px' }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.bg, padding: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, background: T.surface, padding: '15px', borderRadius: '15px', color: '#FFF', border: 'none' }}>+ ADD</button>
            <button onClick={finishSession} style={{ flex: 2, background: T.accent, padding: '15px', borderRadius: '15px', color: '#000', fontWeight: '900', border: 'none' }}>FINISH</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setView('train')} style={{ background: 'none', border: 'none', color: '#FFF' }}><ChevronLeft/></button>
            <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ flex: 1, background: T.surface, border: 'none', padding: '12px', borderRadius: '10px', color: '#FFF' }} />
          </div>
          {filteredLib.map(ex => (
            <button key={ex.id} onClick={() => addExtra(ex)} style={{ width: '100%', background: T.surface, padding: '15px', borderRadius: '12px', border: 'none', color: '#FFF', textAlign: 'left', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{ex.name}</span><span style={{color: T.accent, fontSize: '0.8em'}}>{ex.muscle}</span>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: BIOMETRICS */}
      {view === 'biometrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: T.surface, padding: '30px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ color: T.subtext, fontSize: '0.8em' }}>CURRENT BMI</div>
            <div style={{ fontSize: '3.5em', fontWeight: '900', color: T.accent }}>{bmi}</div>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>BMR (Basal Meta)</span>
              <span style={{ fontWeight: 'bold' }}>{bmr} kcal</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {['weight', 'height', 'age'].map(field => (
            <div key={field}>
              <label style={{ display: 'block', marginBottom: '8px', textTransform: 'capitalize' }}>{field}</label>
              <input type="number" value={bio[field]} onChange={e => setBio({...bio, [field]: parseFloat(e.target.value)})} style={{ width: '100%', padding: '12px', background: T.surface, color: '#FFF', border: 'none', borderRadius: '10px' }} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Theme</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['#10B981', '#3B82F6', '#EF4444'].map(c => (
                <div key={c} onClick={() => setAccent(c)} style={{ width: '45px', height: '45px', background: c, borderRadius: '12px', border: accent === c ? '3px solid #FFF' : 'none' }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: METRICS (HISTORY) */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '15px', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{log.name}</span>
                <span style={{ fontSize: '0.8em', color: T.subtext }}>{log.date}</span>
              </div>
              <div style={{ color: T.accent, fontSize: '0.9em', marginTop: '5px' }}>Volume: {log.volume}kg</div>
            </div>
          ))}
        </div>
      )}

      {/* REST OVERLAY */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#000', padding: '10px 30px', borderRadius: '50px', fontWeight: '900', zIndex: 100 }}>
          REST: {timeLeft}s
        </div>
      )}
    </div>
  );
};

export default TitanTracker;