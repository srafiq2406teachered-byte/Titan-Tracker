import React, { useState, useEffect } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, Trash2, Activity, TrendingUp, Check
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG ---
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
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" }, { id: "E5", name: "Calf Raises", muscle: "Legs" },
    { id: "E12", name: "Pull Ups", muscle: "Back" }, { id: "E15", name: "Push Ups", muscle: "Chest" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [accent, setAccent] = useState('#10B981');
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem('titan_v71_engine');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.history) setHistory(d.history);
        if (d.accent) setAccent(d.accent);
        if (d.bio) setBio(d.bio);
      }
    } catch (e) { console.error("Load failed", e); }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v71_engine', JSON.stringify({ history, accent, bio }));
  }, [history, accent, bio]);

  useEffect(() => {
    let t;
    if (timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // --- 4. ENGINE LOGIC ---
  const triggerHaptic = (n = 50) => { if (window.navigator?.vibrate) window.navigator.vibrate(n); };

  const bmi = bio.height > 0 ? (bio.weight / ((bio.height / 100) ** 2)).toFixed(1) : 0;

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

  const updateSet = (id, idx, field, val) => {
    setSessionData(prev => {
      const copy = { ...prev };
      const set = { ...copy[id][idx] };
      set[field] = Math.max(0, (parseFloat(set[field]) || 0) + val);
      copy[id][idx] = set;
      return copy;
    });
  };

  const finishSession = () => {
    triggerHaptic([50, 30, 50]);
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: (sessionData[ex.instanceId] || []).filter(s => s.w > 0 || s.r > 0)
    })).filter(d => d.sets.length > 0);
    
    const vol = details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0);
    setHistory(prev => [{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, volume: vol, details }, ...prev]);
    setActiveSession(null); 
    setView('metrics');
  };

  const T = { bg: '#050810', surface: '#111827', card: '#1F2937', accent, text: '#F9FAFB', subtext: '#9CA3AF' };

  // --- 5. RENDER ---
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '16px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontWeight: '900', fontSize: '1.2em' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
            {['menu', 'biometrics', 'metrics', 'settings'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '8px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '25px', borderRadius: '20px', border: 'none', textAlign: 'left', color: '#FFF' }}>
              <div style={{ color: w.color, fontWeight: '900' }}>{w.name}</div>
              <div style={{ fontSize: '0.7em', color: T.subtext }}>START SESSION</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '120px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '16px', borderRadius: '16px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{ex.name}</span>
                <button onClick={() => setActiveSession(p => ({...p, list: p.list.filter(i => i.instanceId !== ex.instanceId)}))} style={{ background: 'none', border: 'none', color: '#EF4444' }}><X size={16}/></button>
              </div>
              {sessionData[ex.instanceId]?.map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '40px', background: T.card, border: 'none', borderRadius: '8px', color: T.accent, fontWeight: 'bold' }}>{i+1}</button>
                  <input type="number" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', parseFloat(e.target.value) - set.w)} style={{ flex: 1, minWidth: '0', background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', borderRadius: '8px', padding: '10px' }} />
                  <input type="number" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', parseInt(e.target.value) - set.r)} style={{ flex: 1, minWidth: '0', background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', borderRadius: '8px', padding: '10px' }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: T.bg, display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, padding: '15px', borderRadius: '12px', background: T.surface, color: '#FFF', border: 'none' }}>+ ADD</button>
            <button onClick={finishSession} style={{ flex: 2, padding: '15px', borderRadius: '12px', background: T.accent, color: '#000', fontWeight: 'bold', border: 'none' }}>FINISH</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div>
          <button onClick={() => setView('train')} style={{ color: '#FFF', background: 'none', border: 'none', marginBottom: '20px' }}><ChevronLeft/></button>
          {EXTRA_POOL.map(ex => (
            <button key={ex.id} onClick={() => { 
                const id = `${ex.id}-${Date.now()}`;
                setActiveSession(p => ({...p, list: [...p.list, {...ex, instanceId: id}]}));
                setSessionData(p => ({...p, [id]: [{w:0, r:10}, {w:0, r:10}, {w:0, r:10}]}));
                setView('train');
              }} style={{ width: '100%', background: T.surface, padding: '15px', borderRadius: '12px', color: '#FFF', border: 'none', marginBottom: '8px', textAlign: 'left' }}>
              {ex.name} <span style={{color: T.accent, float: 'right', fontSize: '0.8em'}}>{ex.muscle}</span>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
            <div style={{ color: T.subtext, fontSize: '0.8em' }}>PROGRESS</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', marginTop: '10px' }}>
              {history.slice(0, 7).reverse().map((h, i) => (
                <div key={i} style={{ flex: 1, background: T.accent, height: `${Math.min(100, (h.volume / 5000) * 100)}%`, borderRadius: '2px' }} />
              ))}
            </div>
          </div>
          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '15px', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{log.name}</span>
                <span style={{ fontSize: '0.8em', color: T.subtext }}>{log.date}</span>
              </div>
              <div style={{ color: T.accent, fontSize: '0.9em' }}><Activity size={12} style={{marginRight: '4px'}}/>{log.volume} kg</div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: BIOMETRICS & SETTINGS */}
      {view === 'biometrics' && (
        <div style={{ background: T.surface, padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
          <div style={{ color: T.subtext }}>BMI</div>
          <div style={{ fontSize: '3em', fontWeight: '950', color: T.accent }}>{bmi}</div>
        </div>
      )}

      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {['weight', 'height', 'age'].map(f => (
            <div key={f}>
              <label style={{textTransform: 'capitalize', fontSize: '0.8em'}}>{f}</label>
              <input type="number" value={bio[f]} onChange={e => setBio({...bio, [f]: e.target.value})} style={{ width: '100%', padding: '12px', background: T.surface, border: 'none', color: '#FFF', borderRadius: '10px', marginTop: '5px' }} />
            </div>
          ))}
          <button onClick={() => { if(confirm('Clear all?')){ localStorage.clear(); window.location.reload(); }}} style={{ color: '#EF4444', background: 'none', border: 'none', marginTop: '20px' }}>Reset App Data</button>
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#000', padding: '10px 25px', borderRadius: '50px', fontWeight: '900', zIndex: 1000 }}>
          REST: {timeLeft}s
        </div>
      )}
    </div>
  );
};

export default TitanTracker;