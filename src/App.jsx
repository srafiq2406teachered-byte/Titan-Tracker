import React, { useState, useEffect } from 'react';
import { 
  Play, History, Settings, BarChart2, ChevronLeft, 
  Plus, Minus, Zap, Flame, Timer, Pause, RotateCcw 
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG & DATA (Original 2-Exercise System) ---
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "B1"], color: '#3B82F6' }
  };
  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs", type: "reps" }, 
    { id: "A2", name: "Lat Pulldown", muscle: "Back", type: "reps" },
    { id: "B1", name: "Chest Press", muscle: "Chest", type: "reps" }
  ];
  const EXTRA_POOL = [
    { id: "C1", name: "Treadmill", muscle: "Cardio", type: "time" },
    { id: "E1", name: "Bicep Curls", muscle: "Arms", type: "reps" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [accent, setAccent] = useState('#10B981');
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30 });

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v75_master');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.accent) setAccent(d.accent);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v75_master', JSON.stringify({ history, accent, bio }));
  }, [history, accent, bio]);

  // --- 4. ENGINE LOGIC (Timer Fix) ---
  useEffect(() => {
    let t;
    if (isTimerActive && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(t);
  }, [isTimerActive, timeLeft]);

  const startWorkout = (id) => {
    const p = WORKOUTS[id] || { name: "Manual", rest: 60, ids: [] };
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id)).map(e => ({
      ...e, instanceId: `${e.id}-${Date.now()}`
    }));
    
    // Initialize 3 empty sets per exercise
    const initData = {};
    list.forEach(ex => { initData[ex.instanceId] = [{w:'', r:''}, {w:'', r:''}, {w:'', r:''}]; });
    
    setSessionData(initData);
    setActiveSession({ ...p, list });
    setView('train');
  };

  const updateSet = (id, idx, field, val) => {
    setSessionData(prev => ({
      ...prev,
      [id]: prev[id].map((s, i) => i === idx ? { ...s, [field]: val } : s)
    }));
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: (sessionData[ex.instanceId] || []).filter(s => s.w !== '' || s.r !== '')
    })).filter(d => d.sets.length > 0);
    
    setHistory(prev => [{ 
      date: new Date().toLocaleDateString('en-GB'), 
      name: activeSession.name, 
      details 
    }, ...prev]);
    setActiveSession(null); 
    setView('metrics');
  };

  const T = { bg: '#050810', surface: '#111827', card: '#1F2937', accent, text: '#F9FAFB', subtext: '#9CA3AF' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '16px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* HEADER */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontWeight: '950', fontSize: '1.2em' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <nav style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
            {['menu', 'metrics', 'settings'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '8px' }}>
                {v === 'menu' && <Play size={18}/>}
                {v === 'metrics' && <BarChart2 size={18}/>}
                {v === 'settings' && <Settings size={18}/>}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* UNIFIED TIMER DISPLAY */}
      {view === 'train' && (
        <div style={{ 
          background: isTimerActive ? T.accent : T.surface, 
          color: isTimerActive ? '#000' : T.text,
          padding: '20px', borderRadius: '24px', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          transition: 'all 0.3s ease'
        }}>
          <div>
            <div style={{ fontSize: '0.7em', fontWeight: '900', opacity: 0.7 }}>ENGINE STATUS</div>
            <div style={{ fontSize: '2.5em', fontWeight: '950', fontFamily: 'monospace' }}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button onClick={() => setIsTimerActive(!isTimerActive)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '12px', borderRadius: '15px' }}>
               {isTimerActive ? <Pause size={20}/> : <Play size={20}/>}
             </button>
             <button onClick={() => {setIsTimerActive(false); setTimeLeft(0);}} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '12px', borderRadius: '15px' }}>
               <RotateCcw size={20} />
             </button>
          </div>
        </div>
      )}

      {/* TRAINING VIEW */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '140px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '16px', borderRadius: '20px', marginBottom: '15px' }}>
              <div style={{ fontWeight: '900', fontSize: '0.85em', marginBottom: '12px', color: T.accent }}>{ex.name.toUpperCase()}</div>
              
              {(sessionData[ex.instanceId] || []).map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button 
                    onClick={() => { setTimeLeft(activeSession.rest); setIsTimerActive(true); }}
                    style={{ width: '45px', background: T.card, border: 'none', borderRadius: '10px', color: T.accent, fontWeight: '900' }}>
                    {i+1}
                  </button>
                  <input 
                    type="number" placeholder="KG" value={set.w}
                    onChange={e => updateSet(ex.instanceId, i, 'w', e.target.value)} 
                    style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', borderRadius: '10px', fontWeight: 'bold' }} 
                  />
                  <input 
                    type="number" placeholder="REPS" value={set.r}
                    onChange={e => updateSet(ex.instanceId, i, 'r', e.target.value)} 
                    style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', borderRadius: '10px', fontWeight: 'bold' }} 
                  />
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: T.bg, display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, padding: '16px', borderRadius: '14px', background: T.surface, color: '#FFF', border: 'none', fontWeight: 'bold' }}>+ ADD</button>
            <button onClick={finishSession} style={{ flex: 2, padding: '16px', borderRadius: '14px', background: T.accent, color: '#000', fontWeight: '950', border: 'none' }}>FINISH</button>
          </div>
        </div>
      )}

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '30px', borderRadius: '24px', border: 'none', textAlign: 'left' }}>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '1.1em' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '0.7em', marginTop: '5px' }}>{w.ids.length} EXERCISES • {w.rest}s REST</div>
            </button>
          ))}
        </div>
      )}

      {/* METRICS VIEW */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '16px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: '900' }}>{log.name}</span>
                <span style={{ fontSize: '0.7em', color: T.subtext }}>{log.date}</span>
              </div>
              {log.details.map((d, j) => (
                <div key={j} style={{ fontSize: '0.8em', color: T.subtext }}>{d.name}: {d.sets.length} sets</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TitanTracker;