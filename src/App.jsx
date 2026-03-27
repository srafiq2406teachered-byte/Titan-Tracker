import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, History, Settings, BarChart2, ChevronLeft, 
  Plus, Minus, Zap, Flame, Timer, Pause, RotateCcw 
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG & DATA ---
  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2"], color: '#3B82F6' }
  };
  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs", type: "reps" }, 
    { id: "A2", name: "Lat Pulldown", muscle: "Back", type: "reps" },
    { id: "B1", name: "Chest Press", muscle: "Chest", type: "reps" }
  ];
  const EXTRA_POOL = [
    { id: "C1", name: "Treadmill", muscle: "Cardio", type: "time" },
    { id: "C2", name: "Elliptical", muscle: "Cardio", type: "time" },
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
    const saved = localStorage.getItem('titan_v8_master');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.accent) setAccent(d.accent);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v8_master', JSON.stringify({ history, accent, bio }));
  }, [history, accent, bio]);

  // --- 4. ENGINE LOGIC (TIMER) ---
  useEffect(() => {
    let t;
    if (isTimerActive && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(t);
  }, [isTimerActive, timeLeft]);

  const triggerRest = (seconds) => {
    setTimeLeft(seconds);
    setIsTimerActive(true);
  };

  // --- 5. WORKOUT LOGIC ---
  const startWorkout = (id) => {
    const p = WORKOUTS[id] || { name: "Manual", rest: 60, ids: [] };
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id)).map(e => ({...e, instanceId: `${e.id}-${Date.now()}`}));
    setSessionData({});
    setActiveSession({ ...p, list });
    setView('train');
  };

  const addSet = (id) => {
    setSessionData(prev => ({...prev, [id]: [...(prev[id] || []), {w:0, r:0, c:0}]}));
  };

  const updateSet = (id, idx, field, val) => {
    setSessionData(prev => {
      const copy = { ...prev };
      if(!copy[id]) copy[id] = [{w:0, r:0, c:0}];
      const set = { ...copy[id][idx] };
      set[field] = Math.max(0, (parseFloat(val) || 0));
      copy[id][idx] = set;
      return copy;
    });
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: sessionData[ex.instanceId] || []
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
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '16px', fontFamily: '-apple-system, sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* HEADER NAVIGATION */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} fill={T.accent} color={T.accent} />
            <h1 style={{ fontWeight: '950', fontSize: '1.2em', letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          </div>
          <nav style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
            {['menu', 'metrics', 'settings'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '8px', transition: '0.2s' }}>
                {v === 'menu' && <Play size={18} fill={view === v ? T.accent : 'none'}/>}
                {v === 'metrics' && <BarChart2 size={18}/>}
                {v === 'settings' && <Settings size={18}/>}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* REST ENGINE MODULE (Integrated Timer) */}
      {view === 'train' && (
        <div style={{ 
          background: isTimerActive ? T.accent : T.surface, 
          color: isTimerActive ? '#000' : T.text,
          padding: '20px', borderRadius: '24px', marginBottom: '20px',
          position: 'relative', overflow: 'hidden', transition: '0.4s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.7em', fontWeight: '900', opacity: 0.6, textTransform: 'uppercase' }}>Rest Engine</div>
              <div style={{ fontSize: '3em', fontWeight: '950', fontFamily: 'monospace', lineHeight: '1' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
               <button onClick={() => setIsTimerActive(!isTimerActive)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '12px', borderRadius: '15px' }}>
                 {isTimerActive ? <Pause size={20} fill="currentColor"/> : <Play size={20} fill="currentColor"/>}
               </button>
               <button onClick={() => {setIsTimerActive(false); setTimeLeft(0);}} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '12px', borderRadius: '15px' }}>
                 <RotateCcw size={20} />
               </button>
            </div>
          </div>
          {/* Progress Bar */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: isTimerActive ? 'rgba(0,0,0,0.3)' : T.accent, width: `${(timeLeft / (activeSession?.rest || 60)) * 100}%`, transition: '1s linear' }} />
        </div>
      )}

      {/* TRAINING VIEW */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '140px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '16px', borderRadius: '24px', marginBottom: '16px', border: '1px solid #ffffff05' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: '900', fontSize: '0.9em', color: T.accent }}>{ex.name.toUpperCase()}</span>
                <div style={{ display: 'flex', gap: '4px', background: T.bg, padding: '4px', borderRadius: '10px' }}>
                  <button onClick={() => addSet(ex.instanceId)} style={{ background: 'none', border: 'none', color: T.text, padding: '4px' }}><Plus size={16}/></button>
                </div>
              </div>

              {(sessionData[ex.instanceId] || [{w:0, r:0}]).map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={() => triggerRest(activeSession.rest)}
                    style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: T.card, color: T.subtext, fontWeight: 'bold' }}>
                    {i+1}
                  </button>
                  <input 
                    type="number" placeholder="KG" 
                    onChange={e => updateSet(ex.instanceId, i, 'w', e.target.value)}
                    style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: '900' }} 
                  />
                  <input 
                    type="number" placeholder="REPS" 
                    onChange={e => updateSet(ex.instanceId, i, 'r', e.target.value)}
                    style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', padding: '12px', borderRadius: '12px', textAlign: 'center', fontWeight: '900' }} 
                  />
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: `linear-gradient(transparent, ${T.bg} 30%)`, display: 'flex', gap: '10px', zIndex: 10 }}>
            <button onClick={() => setView('library')} style={{ flex: 1, padding: '18px', borderRadius: '18px', background: T.surface, color: '#FFF', border: 'none', fontWeight: 'bold' }}>+ ADD</button>
            <button onClick={finishSession} style={{ flex: 2, padding: '18px', borderRadius: '18px', background: T.accent, color: '#000', fontWeight: '950', border: 'none' }}>FINISH SESSION</button>
          </div>
        </div>
      )}

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '30px', borderRadius: '28px', border: '1px solid #ffffff05', textAlign: 'left', position: 'relative', overflow: 'hidden' }}>
              <div style={{ color: w.color, fontWeight: '950', fontSize: '1.1em' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '0.7em', marginTop: '4px' }}>{w.ids.length} EXERCISES • {w.rest}s REST</div>
            </button>
          ))}
        </div>
      )}

      {/* LIBRARY VIEW */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setView('train')} style={{ background: T.surface, border: 'none', color: '#FFF', padding: '12px', borderRadius: '12px', width: 'fit-content', marginBottom: '10px' }}><ChevronLeft/></button>
          {EXTRA_POOL.map(ex => (
            <button key={ex.id} onClick={() => {
                const id = `${ex.id}-${Date.now()}`;
                setActiveSession(p => ({...p, list: [...p.list, {...ex, instanceId: id}]}));
                setView('train');
              }} style={{ background: T.surface, padding: '20px', borderRadius: '18px', border: 'none', color: '#FFF', textAlign: 'left' }}>
              <span style={{fontWeight: 'bold'}}>{ex.name}</span>
              <span style={{float: 'right', color: T.accent, fontSize: '0.7em', fontWeight: '900'}}>{ex.muscle.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}

      {/* METRICS VIEW */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.length === 0 && <div style={{textAlign: 'center', padding: '40px', color: T.subtext}}>No sessions recorded.</div>}
          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '16px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '950', color: T.accent }}>{log.name}</span>
                <span style={{ fontSize: '0.7em', color: T.subtext }}>{log.date}</span>
              </div>
              {log.details.map((d, j) => (
                <div key={j} style={{fontSize: '0.8em', color: T.subtext}}>{d.sets.length} sets of {d.name}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TitanTracker;