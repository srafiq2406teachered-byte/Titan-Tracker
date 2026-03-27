import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Settings, BarChart2, ChevronLeft, 
  Plus, Minus, Zap, Flame, Timer, Pause, RotateCcw, 
  Trash2, Activity, Award, Target, TrendingUp
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. RESEARCH-BACKED PROTOCOLS & MASSIVE EXERCISE POOL ---
  const WORKOUTS = {
    ALPHA: { id: 'ALPHA', name: "ALPHA: STRENGTH", rest: 90, ids: ["A1", "B1", "D1"], color: '#3B82F6', desc: "Compound Power" },
    OMEGA: { id: 'OMEGA', name: "OMEGA: BURN", rest: 45, ids: ["A2", "E1", "F1"], color: '#F59E0B', desc: "Metabolic Hypertrophy" }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs" }, { id: "B1", name: "Chest Press", muscle: "Chest" },
    { id: "D1", name: "Deadlift", muscle: "Back" }, { id: "A2", name: "Lat Pulldown", muscle: "Back" },
    { id: "E1", name: "Bicep Curls", muscle: "Arms" }, { id: "F1", name: "Goblet Squat", muscle: "Legs" }
  ];

  const EXTRA_POOL = [
    // CHEST & SHOULDERS
    { id: "X1", name: "Incline DB Press", muscle: "Chest" }, { id: "X2", name: "Pec Deck Fly", muscle: "Chest" },
    { id: "X3", name: "Lateral Raise", muscle: "Shoulders" }, { id: "X4", name: "Military Press", muscle: "Shoulders" },
    { id: "X5", name: "Dips", muscle: "Chest/Tri" }, { id: "X6", name: "Face Pulls", muscle: "Shoulders" },
    // BACK & ARMS
    { id: "X7", name: "Seated Cable Row", muscle: "Back" }, { id: "X8", name: "Pull Ups", muscle: "Back" },
    { id: "X9", name: "Hammer Curls", muscle: "Arms" }, { id: "X10", name: "Tricep Pushdown", muscle: "Arms" },
    { id: "X11", name: "Skull Crushers", muscle: "Arms" }, { id: "X12", name: "Preacher Curls", muscle: "Arms" },
    // LEGS
    { id: "X13", name: "Leg Extension", muscle: "Legs" }, { id: "X14", name: "Leg Curl", muscle: "Legs" },
    { id: "X15", name: "Calf Raises", muscle: "Legs" }, { id: "X16", name: "RDL", muscle: "Legs" },
    { id: "X17", name: "Hack Squat", muscle: "Legs" }, { id: "X18", name: "Lunges", muscle: "Legs" },
    // CORE & CARDIO
    { id: "X19", name: "Plank", muscle: "Core" }, { id: "X20", name: "Hanging Leg Raise", muscle: "Core" },
    { id: "X21", name: "Cable Crunch", muscle: "Core" }, { id: "X22", name: "Stairmaster", muscle: "Cardio" },
    { id: "X23", name: "Treadmill", muscle: "Cardio" }, { id: "X24", name: "Rower", muscle: "Cardio" },
    { id: "X25", name: "Assault Bike", muscle: "Cardio" }
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
    const saved = localStorage.getItem('titan_v95_master');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v95_master', JSON.stringify({ history, bio }));
  }, [history, bio]);

  // --- 4. CALCULATION ENGINES ---
  const bmiData = useMemo(() => {
    const hM = bio.height / 100;
    const val = (bio.weight / (hM * hM)).toFixed(1);
    const cat = val < 18.5 ? "Underweight" : val < 25 ? "Normal" : val < 30 ? "Overweight" : "Obese";
    return { val, cat };
  }, [bio]);

  const ongoingStats = useMemo(() => ({
    total: history.length,
    kcal: history.reduce((acc, h) => acc + (parseInt(h.calories) || 0), 0),
    // Simple Graph Data: Last 7 weights from history
    weightTrend: history.slice(-7).map(h => parseFloat(h.userWeight || bio.weight))
  }), [history, bio.weight]);

  // --- 5. UI LOGIC ---
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

  const addSet = (id) => {
    setSessionData(prev => {
      const current = prev[id] || [];
      const last = current[current.length - 1] || { w: '', r: '' };
      return { ...prev, [id]: [...current, { ...last }] };
    });
  };

  const updateSet = (id, idx, field, val) => {
    setSessionData(prev => {
      const copy = { ...prev };
      if (!copy[id]) copy[id] = [{ w: '', r: '' }];
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
      calories: (Math.random() * 200 + 150).toFixed(0),
      userWeight: bio.weight, // Record weight at time of session
      details 
    }, ...prev]);
    setActiveSession(null); 
    setView('metrics');
  };

  const T = { bg: '#050810', surface: '#111827', card: '#1F2937', accent, text: '#F9FAFB', subtext: '#9CA3AF' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'sans-serif', maxWidth: '480px', margin: '0 auto', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      <style>{`
        input { box-sizing: border-box !important; min-width: 0 !important; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

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
            <div key={ex.instanceId} style={{ background: T.surface, padding: '14px', borderRadius: '24px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: '900', color: T.accent, fontSize: '0.8em' }}>{ex.name.toUpperCase()}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => addSet(ex.instanceId)} style={{ background: T.card, border: 'none', color: '#FFF', borderRadius: '8px', padding: '6px' }}><Plus size={14}/></button>
                  <button onClick={() => setActiveSession(p => ({...p, list: p.list.filter(e => e.instanceId !== ex.instanceId)}))} style={{ background: '#EF444411', border: 'none', color: '#EF4444', borderRadius: '8px', padding: '6px' }}><Trash2 size={14}/></button>
                </div>
              </div>
              
              {(sessionData[ex.instanceId] || [{w:'', r:''}]).map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setTimeLeft(activeSession.rest); setIsTimerActive(true); }} style={{ width: '42px', flexShrink: 0, height: '42px', background: T.card, border: 'none', borderRadius: '12px', color: T.accent, fontWeight: '900' }}>{i+1}</button>
                  <input type="number" placeholder="KG" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', e.target.value)} style={{ flex: 1, minWidth: 0, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', height: '42px', borderRadius: '12px', fontWeight: '900' }} />
                  <input type="number" placeholder="REPS" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', e.target.value)} style={{ flex: 1, minWidth: 0, background: T.bg, border: 'none', color: '#FFF', textAlign: 'center', height: '42px', borderRadius: '12px', fontWeight: '900' }} />
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

      {/* METRICS VIEW (WITH TREND GRAPH) */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <TrendingUp size={16} color={T.accent}/>
              <span style={{ fontSize: '0.7em', fontWeight: '950', letterSpacing: '1px', opacity: 0.6 }}>WEIGHT TREND</span>
            </div>
            {/* SVG MINI GRAPH */}
            <div style={{ height: '60px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
              {ongoingStats.weightTrend.length > 0 ? ongoingStats.weightTrend.map((w, i) => (
                <div key={i} style={{ flex: 1, background: T.accent, height: `${(w / Math.max(...ongoingStats.weightTrend)) * 100}%`, borderRadius: '4px 4px 0 0', opacity: 0.4 + (i * 0.1) }} />
              )) : <div style={{color: T.subtext, fontSize: '0.7em'}}>Complete more sessions to see trend...</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5em', fontWeight: '950' }}>{ongoingStats.total}</div>
              <div style={{ fontSize: '0.6em', color: T.subtext, fontWeight: 'bold' }}>SESSIONS</div>
            </div>
            <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5em', fontWeight: '950' }}>{ongoingStats.kcal}</div>
              <div style={{ fontSize: '0.6em', color: T.subtext, fontWeight: 'bold' }}>TOTAL KCAL</div>
            </div>
          </div>
        </div>
      )}

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '28px', borderRadius: '32px', border: 'none', textAlign: 'left' }}>
              <div style={{ color: w.color, fontWeight: '950', fontSize: '1.2em' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '0.7em', marginTop: '6px', fontWeight: '500' }}>{w.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* SETTINGS VIEW (BMI ENGINE: $$BMI = \frac{kg}{m^2}$$) */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.accent, color: '#000', padding: '24px', borderRadius: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.65em', fontWeight: '900', opacity: 0.7 }}>BODY MASS INDEX</div>
            <div style={{ fontSize: '3.5em', fontWeight: '950' }}>{bmiData.val}</div>
            <div style={{ fontSize: '0.8em', fontWeight: '900' }}>{bmiData.cat.toUpperCase()}</div>
          </div>
          {['weight', 'height', 'age'].map(f => (
            <div key={f}>
              <label style={{fontSize: '0.65em', fontWeight: '950', color: T.subtext, textTransform: 'uppercase', marginLeft: '5px'}}>{f}</label>
              <input type="number" value={bio[f]} onChange={e => setBio({...bio, [f]: e.target.value})} style={{ width: '100%', padding: '16px', background: T.surface, border: 'none', color: '#FFF', borderRadius: '18px', marginTop: '6px', fontWeight: '800' }} />
            </div>
          ))}
        </div>
      )}

      {/* LIBRARY VIEW (ADD EXTRAS) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setView('train')} style={{ color: '#FFF', border: 'none', background: T.surface, padding: '12px', borderRadius: '15px', width: 'fit-content', marginBottom: '10px' }}><ChevronLeft/></button>
          <div style={{maxHeight: '70vh', overflowY: 'auto', paddingRight: '5px'}}>
            {EXTRA_POOL.map(ex => (
              <button key={ex.id} onClick={() => {
                  const instanceId = `${ex.id}-${Date.now()}`;
                  setActiveSession(p => ({...p, list: [...p.list, {...ex, instanceId}]}));
                  setView('train');
                }} style={{ background: T.surface, padding: '18px', borderRadius: '20px', border: 'none', color: '#FFF', textAlign: 'left', display: 'flex', justifyContent: 'space-between', marginBottom: '8px', width: '100%' }}>
                <span style={{fontWeight: '900', fontSize: '0.9em'}}>{ex.name}</span>
                <span style={{color: T.accent, fontSize: '0.65em', fontWeight: '950'}}>{ex.muscle.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* REST TIMER TOAST */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#000', padding: '10px 24px', borderRadius: '40px', fontWeight: '950', fontSize: '0.9em', zIndex: 3000, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
};

export default TitanTracker;