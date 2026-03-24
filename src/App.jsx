import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, Plus, Zap, Target, Activity, Heart } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});

  // 1. INITIAL LOAD (Safety Guard)
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_completed_v9');
    const savedData = localStorage.getItem('titan_data_v9');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    setMounted(true);
  }, []);

  // 2. AUTO-SAVE
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_completed_v9', JSON.stringify(completedSets));
      localStorage.setItem('titan_data_v9', JSON.stringify(exerciseData));
    }
  }, [completedSets, exerciseData, mounted]);

  const MASTER_PLAN = [
    { id: "A1", pair: "A", name: "Leg Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "A2", pair: "A", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", rest: 60 },
    { id: "B1", pair: "B", name: "Chest Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "B2", pair: "B", name: "Seated Leg Curl", sets: 3, goal: "12-15", rest: 60 },
    { id: "C1", pair: "C", name: "Seated Cable Row", sets: 3, goal: "10-12", rest: 60 },
    { id: "C2", pair: "C", name: "DB Overhead Press", sets: 3, goal: "10-12", rest: 60 },
    { id: "D1", pair: "D", name: "Plank / Captain's Chair", sets: 3, goal: "45s", rest: 30 },
    { id: "D2", pair: "D", name: "Walking Lunges", sets: 3, goal: "12 Total", rest: 30 }
  ];

  const getStats = () => {
    let volume = 0, completed = 0, total = 0;
    MASTER_PLAN.forEach(ex => {
      const extra = exerciseData[`${ex.id}-extra`] || 0;
      total += (ex.sets + extra);
      for (let i = 0; i < (ex.sets + extra); i++) {
        if (completedSets[`${ex.id}-${i}`]) {
          completed++;
          volume += (parseFloat(exerciseData[`${ex.id}-${i}`]) || 0) * (parseInt(ex.goal) || 1);
        }
      }
    });
    return { volume: volume.toLocaleString(), progress: `${completed}/${total}`, percent: Math.round((completed / total) * 100) || 0 };
  };

  const THEME = { black: '#000000', card: '#0c0c0c', border: '#1a1a1a', orange: '#FF5C00', textDim: '#555555' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px', maxWidth: '500px', margin: '0 auto', paddingBottom: '140px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}>
            <Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} />
          </button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}>
            <BarChart3 size={20} color={view === 'metrics' ? '#000' : '#444'} />
          </button>
        </div>
      </header>

      {view === 'train' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {MASTER_PLAN.map((ex) => {
            const extraCount = exerciseData[`${ex.id}-extra`] || 0;
            const totalSets = ex.sets + extraCount;
            return (
              <div key={ex.id} style={{ background: THEME.card, borderRadius: '20px', padding: '18px', border: `1px solid ${THEME.border}`, borderLeft: `4px solid ${ex.pair === 'A' || ex.pair === 'C' ? THEME.orange : '#333'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '900' }}>{ex.id} {ex.name}</h3>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: THEME.orange }}>{ex.goal}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button 
                          onClick={() => { setCompletedSets(prev => ({ ...prev, [key]: !isDone })); if(!isDone) setTimeLeft(ex.rest); }}
                          style={{ height: '45px', borderRadius: '10px', border: isDone ? `2px solid ${THEME.orange}` : `2px solid ${THEME.border}`, background: isDone ? THEME.orange : 'transparent', color: isDone ? '#000' : THEME.textDim, fontWeight: '900' }}
                        >{isDone ? <CheckCircle size={18} /> : i + 1}</button>
                        <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[key] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: '100%', background: THEME.black, border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '11px', textAlign: 'center', padding: '6px 0', borderRadius: '8px' }} />
                      </div>
                    );
                  })}
                  <button onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                    style={{ height: '45px', borderRadius: '10px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  ><Plus size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: THEME.card, padding: '30px', borderRadius: '24px', border: `1px solid ${THEME.border}`, textAlign: 'center' }}>
            <Activity size={30} color={THEME.orange} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold' }}>SESSION VOLUME</div>
            <div style={{ fontSize: '42px', fontWeight: '900' }}>{getStats().volume} <span style={{ fontSize: '12px', color: THEME.orange }}>KG</span></div>
          </div>
          
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '24px', border: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
               <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold' }}>PEAK HEART RATE</div>
               <input type="text" inputMode="numeric" placeholder="---" value={exerciseData['peak_hr'] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, 'peak_hr': e.target.value }))}
                style={{ background: 'transparent', border: 'none', color: THEME.orange, fontSize: '24px', fontWeight: '900', width: '80px', outline: 'none' }} />
            </div>
            <Heart color={THEME.orange} fill={THEME.orange} size={24} />
          </div>

          <button onClick={() => { if(window.confirm("End Protocol & Sync?")) { localStorage.clear(); window.location.reload(); }}}
            style={{ marginTop: '20px', width: '100%', padding: '20px', borderRadius: '20px', border: 'none', background: '#FFF', color: '#000', fontWeight: '900', textTransform: 'uppercase' }}>
            Finish & Clear Session
          </button>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && view === 'train' && (
        <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFF', color: '#000', padding: '10px 25px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '12px', border: `4px solid ${THEME.orange}`, zIndex: 1000 }}>
          <Clock size={20} />
          <span style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          <RotateCcw size={16} onClick={() => setTimeLeft(0)} />
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
