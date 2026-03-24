import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, X, ChevronRight } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState(() => 
    JSON.parse(localStorage.getItem('titan_custom_v16') || '[]')
  );

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
    const savedSets = localStorage.getItem('titan_completed_v16');
    const savedData = localStorage.getItem('titan_data_v16');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_completed_v16', JSON.stringify(completedSets));
      localStorage.setItem('titan_data_v16', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v16', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  const removeSet = (exId, setIdx) => {
    const key = `${exId}-${setIdx}`;
    const extraKey = `${exId}-extra`;
    const newSets = { ...completedSets };
    const newData = { ...exerciseData };
    delete newSets[key];
    delete newData[`${key}-w`];
    delete newData[`${key}-r`];
    
    // Only reduce the extra count if we are deleting a set beyond the default 3
    if (setIdx >= 3) {
      newData[extraKey] = Math.max(0, (newData[extraKey] || 0) - 1);
    }
    
    setCompletedSets(newSets);
    setExerciseData(newData);
  };

  const THEME = { black: '#000000', card: '#111111', border: '#222222', orange: '#FF5C00', textDim: '#888888', white: '#FFFFFF' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.white, fontFamily: 'system-ui, sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '140px' }}>
      
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
              <div key={ex.id} style={{ background: THEME.card, borderRadius: '24px', padding: '22px', border: `1px solid ${THEME.border}`, borderLeft: ex.isCustom ? '6px solid #444' : `6px solid ${THEME.orange}`, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0', textTransform: 'uppercase' }}>{ex.name}</h3>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: THEME.orange }}>{ex.goal}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 30px', gap: '10px', alignItems: 'center' }}>
                        <button 
                          onClick={() => { if (!isDone) setTimeLeft(ex.rest); setCompletedSets(prev => ({ ...prev, [key]: !isDone })); }}
                          style={{ height: '55px', borderRadius: '12px', border: 'none', background: isDone ? THEME.orange : '#222', color: isDone ? '#000' : THEME.white, fontWeight: '900', fontSize: '20px' }}
                        >{isDone ? <CheckCircle size={24} /> : i + 1}</button>
                        
                        <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[`${key}-w`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-w`]: e.target.value }))}
                          style={{ width: '100%', background: '#000', border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '15px 0', borderRadius: '12px', outline: 'none' }} />

                        <input type="text" inputMode="numeric" placeholder="REPS" value={exerciseData[`${key}-r`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-r`]: e.target.value }))}
                          style={{ width: '100%', background: '#000', border: `1px solid ${THEME.border}`, color: THEME.orange, fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '15px 0', borderRadius: '12px', outline: 'none' }} />
                        
                        {/* THE SMALL CROSS (DELETE) */}
                        <button onClick={() => removeSet(ex.id, i)} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}>
                          <X size={18} color="#444" />
                        </button>
                      </div>
                    );
                  })}
                  
                  <button onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                    style={{ padding: '12px', borderRadius: '12px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  ><Plus size={24} /> <span style={{ marginLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}>ADD SET</span></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && view === 'train' && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: THEME.white, color: '#000', padding: '12px 35px', borderRadius: '60px', display: 'flex', alignItems: 'center', gap: '15px', border: `4px solid ${THEME.orange}`, zIndex: 2000 }}>
          <Clock size={24} /> <span style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          <RotateCcw size={20} onClick={() => setTimeLeft(0)} />
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
