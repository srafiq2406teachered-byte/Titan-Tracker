import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, History, Settings, BarChart2, ChevronLeft, 
  Plus, Minus, Zap, Flame, Timer, Pause, RotateCcw, Activity
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. RESEARCH-BACKED RECOMP PROTOCOLS ---
  const WORKOUTS = {
    ALPHA: { 
      id: 'ALPHA', name: "ALPHA: RECOMP STRENGTH", rest: 90, 
      ids: ["A1", "B1", "D1"], color: '#3B82F6', desc: "Heavy Load / Long Rest" 
    },
    OMEGA: { 
      id: 'OMEGA', name: "OMEGA: METABOLIC BURN", rest: 45, 
      ids: ["A2", "E1", "F1"], color: '#F59E0B', desc: "High Rep / Short Rest" 
    }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs", type: "reps" }, 
    { id: "B1", name: "Chest Press", muscle: "Chest", type: "reps" },
    { id: "D1", name: "Deadlift", muscle: "Posterior", type: "reps" },
    { id: "A2", name: "Lat Pulldown", muscle: "Back", type: "reps" },
    { id: "E1", name: "Bicep Curls", muscle: "Arms", type: "reps" },
    { id: "F1", name: "Goblet Squat", muscle: "Full Body", type: "reps" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [accent, setAccent] = useState('#3B82F6');
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30 });

  // --- 3. PERSISTENCE & INITIALIZATION ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v85_master');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v85_master', JSON.stringify({ history, bio }));
  }, [history, bio]);

  // --- 4. ENGINE LOGIC (Timer + Haptics) ---
  useEffect(() => {
    let t;
    if (isTimerActive && timeLeft > 0) {
      t = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      // Haptic Alert: Double Pulse (200ms on, 100ms off, 200ms on)
      if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(t);
  }, [isTimerActive, timeLeft]);

  // Metabolic Burn Formula
  const calculateBurn = (w, r) => {
    if (!w || !r) return 0;
    const factor = bio.age > 30 ? 0.9 : 1.1;
    return (parseFloat(w) * parseInt(r) * 0.02 * factor).toFixed(1);
  };

  const startWorkout = (id) => {
    const p = WORKOUTS[id] || { name: "Manual", rest: 60, ids: [] };
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id)).map(e => ({
      ...e, instanceId: `${e.id}-${Date.now()}`
    }));
    setSessionData({});
    setActiveSession({ ...p, list });
    setAccent(p.color);
    setView('train');
  };

  const updateSet = (id, idx, field, val) => {
    setSessionData(prev => {
      const copy = { ...prev };
      if (!copy[id]) copy[id] = [{w:'', r:'', c:0}, {w:'', r:'', c:0}, {w:'', r:'', c:0}];
      const updatedSet = { ...copy[id][idx], [field]: val };
      // Auto-update calories if weight or reps change
      updatedSet.c = calculateBurn(updatedSet.w, updatedSet.r);
      copy[id][idx] = updatedSet;
      return copy;
    });
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: (sessionData[ex.instanceId] || []).filter(s => s.w !== '' || s.r !== '')
    })).filter(d => d.sets.length > 0);
    
    const totalCals = details.reduce((acc, ex) => 
      acc + ex.sets.reduce((sA, s) => sA + parseFloat(s.c || 0), 0), 0
    );

    setHistory(prev => [{ 
      date: new Date().toLocaleDateString('en-GB'), 
      name: activeSession.name, 
      calories: totalCals.toFixed(0),
      details 
    }, ...prev]);
    setActiveSession(null); 
    setView('metrics');
  };

  const T = { bg: '#050810', surface: '#111827', card: '#1F2937', accent, text: '#F9FAFB', subtext: '#9CA3AF' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '16px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* GLOBAL HEADER */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={18} fill={T.accent} color={T.accent} />
            <h1 style={{ fontWeight: '950', fontSize: '1.2em', letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          </div>
          <nav style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
            {['menu', 'metrics', 'settings'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ border: 'none', padding: '10px', background: view === v ? T.card : 'transparent', color: view === v ? T.accent : T.subtext, borderRadius: '8px' }}>
                {v === 'menu' && <Play size={18} fill={view === v ? T.accent : 'none'}/>}
                {v === 'metrics' && <BarChart2 size={18}/>}
                {v === 'settings' && <Settings size={18}/>}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* TITAN+ UNIFIED ENGINE (REST TIMER) */}
      {view === 'train' && (
        <div style={{ 
          background: isTimerActive ? T.accent : T.surface, 
          color: isTimerActive ? '#000' : T.text,
          padding: '20px', borderRadius: '24px', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          boxShadow: isTimerActive ? `0 10px 30px -10px ${T.accent}66` : 'none'
        }}>
          <div>
            <div style={{ fontSize: '0.65em', fontWeight: '900', opacity: 0.8, textTransform: 'uppercase' }}>Metabolic Engine</div>
            <div style={{ fontSize: '2.8em', fontWeight: '950', fontFamily: 'monospace' }}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             <button onClick={() => setIsTimerActive(!isTimerActive)} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '12px', borderRadius: '15px' }}>
               {isTimerActive ? <Pause size={22} fill="currentColor"/> : <Play size={22} fill="currentColor"/>}
             </button>
             <button onClick={() => {setIsTimerActive(false); setTimeLeft(0);}} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', padding: '12px', borderRadius: '15px' }}>
               <RotateCcw size={22} />
             </button>
          </div>
        </div>
      )}

      {/* TRAINING VIEW */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '140px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '18px', borderRadius: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: '900', fontSize: '0.85em', color: T.accent }}>{ex.name.toUpperCase()}</span>
                <span style={{ fontSize: '0.65em', color: T.subtext, fontWeight: 'bold' }}>{ex.muscle}</span>
              </div>
              
              {(sessionData[ex.instanceId] || [{w:'', r:'', c:0}, {w:'', r:'', c:0}, {w:'', r:'', c:0}]).map((set, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={() => { setTimeLeft(activeSession.rest); setIsTimerActive(true); }}
                      style={{ width: '45px', height: '45px', background: T.card, border: 'none', borderRadius: '12px', color: T.accent, fontWeight: '950' }}>
                      {i+1}
                    </button>
                    <input 
                      type="number" placeholder="KG" value={set.w}
                      onChange={e => updateSet(ex.instanceId, i, 'w', e.target.value)} 
                      style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', height: '45px', borderRadius: '12px', fontWeight: '900' }} 
                    />
                    <input 
                      type="number" placeholder="REPS" value={set.r}
                      onChange={e => updateSet(ex.instanceId, i, 'r', e.target.value)} 
                      style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', height: '45px', borderRadius: '12px', fontWeight: '900' }} 
                    />
                  </div>
                  {set.c > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', marginLeft: '53px', color: '#F97316', fontSize: '0.65em', fontWeight: 'bold' }}>
                      <Flame size={10} /> {set.c} KCAL
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: `linear-gradient(transparent, ${T.bg} 40%)`, display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, padding: '18px', borderRadius: '18px', background: T.surface, color: '#FFF', border: 'none', fontWeight: 'bold' }}>+ EXERCISE</button>
            <button onClick={finishSession} style={{ flex: 2, padding: '18px', borderRadius: '18px', background: T.accent, color: '#000', fontWeight: '950', border: 'none' }}>FINISH SESSION</button>
          </div>
        </div>
      )}

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '24px', borderRadius: '28px', border: 'none', textAlign: 'left' }}>
              <div style={{ color: w.color, fontWeight: '950', fontSize: '1.2em' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '0.7em', marginTop: '4px' }}>{w.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* METRICS VIEW */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '18px', borderRadius: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '950', color: T.accent }}>{log.name}</span>
                <span style={{ fontSize: '0.7em', color: T.subtext }}>{log.date}</span>
              </div>
              <div style={{ color: '#F97316', fontSize: '0.75em', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <Flame size={12} fill="#F97316"/> {log.calories} TOTAL KCAL
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SETTINGS VIEW */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           {['weight', 'height', 'age'].map(f => (
            <div key={f}>
              <label style={{textTransform: 'capitalize', fontSize: '0.75em', fontWeight: 'bold', color: T.subtext}}>{f}</label>
              <input type="number" value={bio[f]} onChange={e => setBio({...bio, [f]: e.target.value})} style={{ width: '100%', padding: '15px', background: T.surface, border: 'none', color: '#FFF', borderRadius: '15px', marginTop: '6px', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TitanTracker;