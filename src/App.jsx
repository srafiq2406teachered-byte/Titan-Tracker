import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, Trash2, ChevronRight } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState(() => 
    JSON.parse(localStorage.getItem('titan_custom_v13') || '[]')
  );

  const MACHINE_LIBRARY = {
    LEGS: ["Leg Extension", "Calf Raise", "Glute Bridge"],
    PUSH: ["Incline Chest Press", "Shoulder Press", "Tricep Pushdown"],
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

  useEffect(() => {
    const savedSets = localStorage.getItem('titan_completed_v13');
    const savedData = localStorage.getItem('titan_data_v13');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_completed_v13', JSON.stringify(completedSets));
      localStorage.setItem('titan_data_v13', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v13', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  const THEME = { black: '#000000', card: '#111111', border: '#222222', orange: '#FF5C00', textDim: '#888888', white: '#FFFFFF' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.white, fontFamily: 'system-ui, -apple-system, sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '140px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '10px 0' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '12px', background: '#111', padding: '8px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><Dumbbell size={24} color={view === 'train' ? '#000' : '#666'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><PlusCircle size={24} color={view === 'library' ? '#000' : '#666'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><BarChart3 size={24} color={view === 'metrics' ? '#000' : '#666'} /></button>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0', textTransform: 'uppercase', lineHeight: '1.2' }}>{ex.name}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     {ex.isCustom && <Trash2 size={20} color="#ff4444" onClick={() => setCustomExercises(customExercises.filter(c => c.id !== ex.id))} />}
                     <span style={{ fontSize: '14px', fontWeight: '900', color: THEME.orange }}>{ex.goal}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button 
                          onClick={() => { setCompletedSets(prev => ({ ...prev, [key]: !isDone })); if(!isDone) setTimeLeft(ex.rest); }}
                          style={{ height: '65px', borderRadius: '16px', border: 'none', background: isDone ? THEME.orange : '#222', color: isDone ? '#000' : THEME.white, fontWeight: '900', fontSize: '24px' }}
                        >{isDone ? <CheckCircle size={32} strokeWidth={3} /> : i + 1}</button>
                        <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[key] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: '100%', background: '#000', border: `2px solid ${THEME.border}`, color: THEME.white, fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '12px 0', borderRadius: '12px', outline: 'none' }} />
                      </div>
                    );
                  })}
                  
                  {/* RESTORED ADD SET BUTTON */}
                  <button 
                    onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                    style={{ height: '65px', borderRadius: '16px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={32} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OTHER VIEWS REMAIN SAME AS v12.0 */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             {Object.entries(MACHINE_LIBRARY).map(([category, machines]) => (
               <div key={category}>
                 <div style={{ fontSize: '12px', color: THEME.orange, fontWeight: '900', marginBottom: '12px' }}>{category}</div>
                 {machines.map(m => (
                   <button key={m} onClick={() => { 
                     setCustomExercises([...customExercises, { id: `EXT-${Date.now()}`, name: m, sets: 3, goal: "10-12", rest: 60, isCustom: true }]);
                     setView('train');
                   }} style={{ width: '100%', padding: '22px', background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
                      {m} <ChevronRight size={20} color={THEME.orange} />
                   </button>
                 ))}
               </div>
             ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: THEME.white, color: '#000', padding: '15px 40px', borderRadius: '60px', display: 'flex', alignItems: 'center', gap: '15px', border: `5px solid ${THEME.orange}`, zIndex: 2000 }}>
          <Clock size={28} /> <span style={{ fontSize: '42px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          <RotateCcw size={24} onClick={() => setTimeLeft(0)} />
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
