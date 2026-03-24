import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Trash2, Box, ChevronRight } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState(() => 
    JSON.parse(localStorage.getItem('titan_custom_v11') || '[]')
  );

  // --- PRESET MACHINE LIBRARY ---
  const MACHINE_LIBRARY = {
    LEGS: ["Leg Extension", "Leg Press (Alt)", "Calf Raise", "Glute Bridge"],
    PUSH: ["Incline Chest Press", "Shoulder Press (Machine)", "Tricep Pushdown", "Lateral Raise"],
    PULL: ["Face Pulls", "Bicep Curls (DB)", "Hammer Curls", "Rear Delt Fly"],
    CORE: ["Hanging Leg Raise", "Russian Twist", "Ab Crunch Machine"]
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

  useEffect(() => {
    const savedSets = localStorage.getItem('titan_completed_v11');
    const savedData = localStorage.getItem('titan_data_v11');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_completed_v11', JSON.stringify(completedSets));
      localStorage.setItem('titan_data_v11', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v11', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  const addMachine = (name) => {
    const newEx = {
      id: `EXT-${Date.now()}`,
      name: name,
      sets: 3,
      goal: "10-12",
      rest: 60,
      isCustom: true
    };
    setCustomExercises([...customExercises, newEx]);
    setView('train');
  };

  const THEME = { black: '#000000', card: '#0c0c0c', border: '#1a1a1a', orange: '#FF5C00', textDim: '#555555' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px', maxWidth: '500px', margin: '0 auto', paddingBottom: '120px' }}>
      
      {/* HEADER NAV */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><Dumbbell size={18} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><PlusCircle size={18} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><BarChart3 size={18} color={view === 'metrics' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {FULL_PLAN.map((ex) => {
            const extraCount = exerciseData[`${ex.id}-extra`] || 0;
            const totalSets = ex.sets + extraCount;
            return (
              <div key={ex.id} style={{ background: THEME.card, borderRadius: '20px', padding: '18px', border: `1px solid ${THEME.border}`, borderLeft: ex.isCustom ? `4px solid ${THEME.textDim}` : `4px solid ${THEME.orange}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', textTransform: 'uppercase' }}>{ex.name}</h3>
                  {ex.isCustom && <Trash2 size={16} color="#ff4444" onClick={() => setCustomExercises(customExercises.filter(c => c.id !== ex.id))} />}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button 
                          onClick={() => { setCompletedSets(prev => ({ ...prev, [key]: !isDone })); if(!isDone) setTimeLeft(ex.rest); }}
                          style={{ height: '42px', borderRadius: '8px', border: isDone ? `2px solid ${THEME.orange}` : `2px solid ${THEME.border}`, background: isDone ? THEME.orange : 'transparent', color: isDone ? '#000' : THEME.textDim, fontWeight: '900' }}
                        >{isDone ? <CheckCircle size={16} /> : i + 1}</button>
                        <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[key] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: '100%', background: THEME.black, border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '11px', textAlign: 'center', padding: '6px 0', borderRadius: '6px' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: LIBRARY (MACHINE SELECTION) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '20px', border: `1px solid ${THEME.border}` }}>
             <h2 style={{ fontSize: '14px', fontWeight: '900', color: THEME.orange, marginBottom: '15px', textTransform: 'uppercase' }}>Select Machine</h2>
             {Object.entries(MACHINE_LIBRARY).map(([category, machines]) => (
               <div key={category} style={{ marginBottom: '20px' }}>
                 <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold', marginBottom: '10px' }}>{category}</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {machines.map(m => (
                     <button key={m} onClick={() => addMachine(m)} style={{ width: '100%', padding: '15px', background: THEME.black, border: `1px solid ${THEME.border}`, borderRadius: '12px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                        {m} <ChevronRight size={14} color={THEME.orange} />
                     </button>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* VIEW: METRICS (Simplified) */}
      {view === 'metrics' && (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          <Box size={40} color={THEME.orange} style={{ marginBottom: '15px' }} />
          <h2 style={{ fontSize: '12px', color: THEME.textDim, fontWeight: 'bold' }}>SESSION COMPLETE?</h2>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '20px', width: '100%', padding: '20px', borderRadius: '20px', background: '#FFF', color: '#000', fontWeight: '900', textTransform: 'uppercase' }}>
            Finalize Data
          </button>
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && view === 'train' && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFF', color: '#000', padding: '10px 25px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', border: `4px solid ${THEME.orange}`, zIndex: 1000 }}>
          <Clock size={20} /> <span style={{ fontSize: '30px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
