import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Settings, BarChart2, ChevronLeft, 
  Plus, Minus, Zap, Flame, Timer, Pause, RotateCcw, 
  Trash2, Activity, Award, Target
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE DATA ---
  const WORKOUTS = {
    ALPHA: { id: 'ALPHA', name: "ALPHA: RECOMP STRENGTH", rest: 90, ids: ["A1", "B1", "D1"], color: '#3B82F6', desc: "Strength focus" },
    OMEGA: { id: 'OMEGA', name: "OMEGA: METABOLIC BURN", rest: 45, ids: ["A2", "E1", "F1"], color: '#F59E0B', desc: "Burn focus" }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs", type: "reps" }, 
    { id: "B1", name: "Chest Press", muscle: "Chest", type: "reps" },
    { id: "D1", name: "Deadlift", muscle: "Posterior", type: "reps" },
    { id: "A2", name: "Lat Pulldown", muscle: "Back", type: "reps" },
    { id: "E1", name: "Bicep Curls", muscle: "Arms", type: "reps" },
    { id: "F1", name: "Goblet Squat", muscle: "Full Body", type: "reps" }
  ];

  const EXTRA_POOL = [
    { id: "C1", name: "Treadmill", muscle: "Cardio", type: "time" },
    { id: "E5", name: "Calf Raises", muscle: "Legs", type: "reps" },
    { id: "S1", name: "Shoulder Press", muscle: "Shoulders", type: "reps" }
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

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v9_master');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v9_master', JSON.stringify({ history, bio }));
  }, [history, bio]);

  // --- 4. CALCULATION ENGINES ---
  const bmiData = useMemo(() => {
    const hMeters = bio.height / 100;
    const bmi = (bio.weight / (hMeters * hMeters)).toFixed(1);
    let cat = "Normal";
    if (bmi < 18.5) cat = "Underweight";
    if (bmi >= 25) cat = "Overweight";
    if (bmi >= 30) cat = "Obese";
    return { bmi, cat };
  }, [bio]);

  const ongoingStats = useMemo(() => {
    const totalSessions = history.length;
    const totalCals = history.reduce((acc, h) => acc + (parseInt(h.calories) || 0), 0);
    return { totalSessions, totalCals };
  }, [history]);

  // --- 5. LOGIC HELPERS ---
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

  const addExercise = (ex) => {
    const instanceId = `${ex.id}-${Date.now()}`;
    setActiveSession(prev => ({ ...prev, list: [...prev.list, { ...ex, instanceId }] }));
    setView('train');
  };

  const removeExercise = (id) => {
    setActiveSession(prev => ({ ...prev, list: prev.list.filter(ex => ex.instanceId !== id) }));
  };

  const addSet = (id) => {
    setSessionData(prev => {
      const currentSets = prev[id] || [];
      const lastSet = currentSets[currentSets.length - 1] || { w: '', r: '' };
      // SMART PRE-FILL: Carry over previous weight/reps
      return { ...prev, [id]: [...currentSets, { ...lastSet, c: 0 }] };
    });
  };

  const updateSet = (id, idx, field, val) => {
    setSessionData(prev => {
      const copy = { ...prev };
      if (!copy[id]) copy[id] = [{ w: '', r: '', c: 0 }];
      copy[id][idx] = { ...copy[id][idx], [field]: val };
      return copy;
    });
  };

  const finishSession = () => {
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: (sessionData[ex.instanceId] || []).filter(s => s.w !== '' || s.r !== '')
    })).filter(d => d.sets.length > 0);
    
    setHistory(prev => [{ 
      date: new Date().toLocaleDateString('en-GB'), 
      name: activeSession.name, 
      calories: (Math.random() * 300 + 100).toFixed(0), // Simplified for brevity
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
                {v === 'menu' && <Play size={18} fill={view === v ? T.accent : 'none'}/>}
                {v === 'metrics' && <BarChart2 size={18}/>}
                {v === 'settings' && <Settings size={18}/>}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* TRAINING VIEW */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '140px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '18px', borderRadius: '24px', marginBottom: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontWeight: '900', color: T.accent, fontSize: '0.85em' }}>{ex.name.toUpperCase()}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => addSet(ex.instanceId)} style={{ background: T.card, border: 'none', color: '#FFF', borderRadius: '8px', padding: '6px' }}><Plus size={14}/></button>
                  <button onClick={() => removeExercise(ex.instanceId)} style={{ background: '#EF444422', border: 'none', color: '#EF4444', borderRadius: '8px', padding: '6px' }}><Trash2 size={14}/></button>
                </div>
              </div>
              
              {(sessionData[ex.instanceId] || [{w:'', r:''}]).map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => { setTimeLeft(activeSession.rest); setIsTimerActive(true); }} style={{ width: '45px', background: T.card, border: 'none', borderRadius: '12px', color: T.accent, fontWeight: '900' }}>{i+1}</button>
                  <input type="number" placeholder="KG" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', e.target.value)} style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', height: '45px', borderRadius: '12px', fontWeight: '900' }} />
                  <input type="number" placeholder="REPS" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', e.target.value)} style={{ flex: 1, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', height: '45px', borderRadius: '12px', fontWeight: '900' }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: `linear-gradient(transparent, ${T.bg} 40%)`, display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, padding: '18px', borderRadius: '18px', background: T.surface, color: '#FFF', border: 'none', fontWeight: 'bold' }}>+ EXTRA</button>
            <button onClick={finishSession} style={{ flex: 2, padding: '18px', borderRadius: '18px', background: T.accent, color: '#000', fontWeight: '950', border: 'none' }}>FINISH</button>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: T.surface, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
              <Activity size={20} color={T.accent} style={{marginBottom: '8px'}}/>
              <div style={{ fontSize: '1.5em', fontWeight: '900' }}>{ongoingStats.totalSessions}</div>
              <div style={{ fontSize: '0.6em', color: T.subtext, fontWeight: 'bold' }}>SESSIONS</div>
            </div>
            <div style={{ background: T.surface, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
              <Flame size={20} color="#F59E0B" style={{marginBottom: '8px'}}/>
              <div style={{ fontSize: '1.5em', fontWeight: '900' }}>{ongoingStats.totalCals}</div>
              <div style={{ fontSize: '0.6em', color: T.subtext, fontWeight: 'bold' }}>LIFETIME KCAL</div>
            </div>
          </div>
          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '16px', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em' }}>
                <span style={{ fontWeight: '900' }}>{log.name}</span>
                <span style={{ color: T.subtext }}>{log.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SETTINGS VIEW with BMI */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.accent, color: '#000', padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7em', fontWeight: '900', opacity: 0.8 }}>BODY MASS INDEX</div>
            <div style={{ fontSize: '3em', fontWeight: '950' }}>{bmiData.bmi}</div>
            <div style={{ fontSize: '0.8em', fontWeight: 'bold' }}>Category: {bmiData.cat}</div>
          </div>
          {['weight', 'height', 'age'].map(f => (
            <div key={f}>
              <label style={{textTransform: 'capitalize', fontSize: '0.75em', fontWeight: 'bold', color: T.subtext}}>{f}</label>
              <input type="number" value={bio[f]} onChange={e => setBio({...bio, [f]: e.target.value})} style={{ width: '100%', padding: '15px', background: T.surface, border: 'none', color: '#FFF', borderRadius: '15px', marginTop: '6px' }} />
            </div>
          ))}
        </div>
      )}

      {/* LIBRARY VIEW */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setView('train')} style={{ background: T.surface, border: 'none', color: '#FFF', padding: '12px', borderRadius: '12px', width: 'fit-content' }}><ChevronLeft/></button>
          {EXTRA_POOL.map(ex => (
            <button key={ex.id} onClick={() => addExercise(ex)} style={{ background: T.surface, padding: '20px', borderRadius: '18px', border: 'none', color: '#FFF', textAlign: 'left' }}>
              <span style={{fontWeight: '900'}}>{ex.name}</span>
              <span style={{float: 'right', color: T.accent, fontSize: '0.7em', fontWeight: 'bold'}}>{ex.muscle.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}

      {/* GLOBAL TIMER */}
      {timeLeft > 0 && <div style={{ position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#000', padding: '10px 25px', borderRadius: '50px', fontWeight: '950', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>REST: {timeLeft}s</div>}
    </div>
  );
};

export default TitanTracker;