import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, X, ChevronRight, Activity, Trash2 } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState([]);

  // 1. PERSISTENCE ENGINE (Restores everything on load)
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_completed_v17');
    const savedData = localStorage.getItem('titan_data_v17');
    const savedCustom = localStorage.getItem('titan_custom_v17');
    
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    setMounted(true);
  }, []);

  // 2. AUTO-SAVE (Triggers on every change)
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_completed_v17', JSON.stringify(completedSets));
      localStorage.setItem('titan_data_v17', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v17', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  // 3. TIMER LOGIC
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const MACHINE_LIBRARY = {
    LEGS: ["Leg Extension", "Leg Press (Alt)", "Calf Raise", "Glute Bridge"],
    PUSH: ["Incline Chest Press", "Shoulder Press", "Tricep Pushdown", "Lateral Raise"],
    PULL: ["Face Pulls", "Bicep Curls", "Hammer Curls", "Rear Delt Fly"]
  };

  const DEFAULT_PLAN = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", rest: 60 },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15", rest: 60 },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12", rest: 60 },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s", rest: 30 },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", rest: 30 }
  ];

  const FULL_PLAN = [...DEFAULT_PLAN, ...customExercises];

  const calculateVolume = () => {
    let total = 0;
    FULL_PLAN.forEach(ex => {
      const extra = exerciseData[`${ex.id}-extra`] || 0;
      for (let i = 0; i < (ex.sets + extra); i++) {
        const key = `${ex.id}-${i}`;
        if (completedSets[key]) {
          const w = parseFloat(exerciseData[`${key}-w`]) || 0;
          const r = parseFloat(exerciseData[`${key}-r`]) || 0;
          total += (w * r);
        }
      }
    });
    return total.toLocaleString();
  };

  const THEME = { black: '#000000', card: '#111111', border: '#222222', orange: '#FF5C00', textDim: '#555555', white: '#FFFFFF' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.white, fontFamily: 'sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '140px' }}>
      
      {/* HEADER NAV */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '10px 0' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '12px', background: '#111', padding: '8px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><Dumbbell size={24} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><PlusCircle size={24} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><BarChart3 size={24} color={view === 'metrics' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {FULL_PLAN.map((ex) => {
            const extraCount = exerciseData[`${ex.id}-extra`] || 0;
            const totalSets = ex.sets + extraCount;
            return (
              <div key={ex.id} style={{ background: THEME.card, borderRadius: '24px', padding: '22px', border: `1px solid ${THEME.border}`, borderLeft: ex.isCustom ? '6px solid #444' : `6px solid ${THEME.orange}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, textTransform: 'uppercase' }}>{ex.name}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {ex.isCustom && <Trash2 size={18} color="#ff4444" onClick={() => setCustomExercises(customExercises.filter(c => c.id !== ex.id))} />}
                    <span style={{ fontSize: '12px', color: THEME.orange, fontWeight: '900' }}>{ex.goal}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 30px', gap: '10px', alignItems: 'center' }}>
                        <button onClick={() => { if (!isDone) setTimeLeft(ex.rest); setCompletedSets(prev => ({ ...prev, [key]: !isDone })); }}
                          style={{ height: '55px', borderRadius: '12px', border: 'none', background: isDone ? THEME.orange : '#222', color: isDone ? '#000' : '#fff', fontWeight: '900', fontSize: '20px' }}
                        >{isDone ? <CheckCircle size={24} /> : i + 1}</button>
                        
                        <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[`${key}-w`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-w`]: e.target.value }))}
                          style={{ width: '100%', background: '#000', border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '15px 0', borderRadius: '12px', outline: 'none' }} />

                        <input type="text" inputMode="numeric" placeholder="REPS" value={exerciseData[`${key}-r`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-r`]: e.target.value }))}
                          style={{ width: '100%', background: '#000', border: `1px solid ${THEME.border}`, color: THEME.orange, fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '15px 0', borderRadius: '12px', outline: 'none' }} />
                        
                        <button onClick={() => {
                          const newSets = { ...completedSets }; const newData = { ...exerciseData };
                          delete newSets[key]; delete newData[`${key}-w`]; delete newData[`${key}-r`];
                          if (i >= 3) { newData[`${ex.id}-extra`] = Math.max(0, (newData[`${ex.id}-extra`] || 0) - 1); }
                          setCompletedSets(newSets); setExerciseData(newData);
                        }} style={{ background: 'transparent', border: 'none' }}><X size={18} color="#444" /></button>
                      </div>
                    );
                  })}
                  <button onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                    style={{ padding: '15px', borderRadius: '12px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  ><Plus size={20} /> <span style={{ fontSize: '12px', fontWeight: 'bold' }}>ADD SET</span></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(MACHINE_LIBRARY).map(([category, machines]) => (
            <div key={category}>
              <div style={{ fontSize: '12px', color: THEME.orange, fontWeight: '900', marginBottom: '12px' }}>{category}</div>
              {machines.map(m => (
                <button key={m} onClick={() => { setCustomExercises([...customExercises, { id: `EXT-${Date.now()}`, name: m, sets: 3, goal: "10-12", rest: 60, isCustom: true }]); setView('train'); }}
                  style={{ width: '100%', padding: '22px', background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
                  {m} <ChevronRight size={20} color={THEME.orange} />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          <Activity size={60} color={THEME.orange} style={{ margin: '0 auto 20px' }} />
          <div style={{ fontSize: '12px', color: THEME.textDim, fontWeight: 'bold', letterSpacing: '2px' }}>SESSION VOLUME</div>
          <div style={{ fontSize: '64px', fontWeight: '900', color: '#fff', margin: '10px 0' }}>{calculateVolume()} <span style={{ fontSize: '20px', color: THEME.orange }}>KG</span></div>
          <button onClick={() => { if(window.confirm("End Protocol?")) { localStorage.clear(); window.location.reload(); }}}
            style={{ marginTop: '40px', width: '100%', padding: '22px', borderRadius: '24px', background: '#FFF', color: '#000', fontWeight: '900', textTransform: 'uppercase', fontSize: '18px' }}>
            Complete Session
          </button>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFF', color: '#000', padding: '15px 40px', borderRadius: '60px', display: 'flex', alignItems: 'center', gap: '15px', border: `5px solid ${THEME.orange}`, zIndex: 2000 }}>
          <Clock size={28} /> <span style={{ fontSize: '42px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          <RotateCcw size={24} onClick={() => setTimeLeft(0)} />
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
