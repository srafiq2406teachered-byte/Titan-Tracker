import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, History, Plus, Timer, Zap, Activity } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. STATE & PERSISTENCE ---
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState(() => 
    JSON.parse(localStorage.getItem('titan_completed_v6') || '{}')
  );
  const [exerciseData, setExerciseData] = useState(() => 
    JSON.parse(localStorage.getItem('titan_data_v6') || '{}')
  );

  // --- 2. PROTOCOL DEFINITION ---
  const MASTER_PLAN = [
    { id: "A1", pair: "A", name: "Leg Press Machine", sets: 3, goal: "8-10", focus: "Power", type: "set", rest: 60 },
    { id: "A2", pair: "A", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", focus: "Pull", type: "set", rest: 60 },
    { id: "B1", pair: "B", name: "Chest Press Machine", sets: 3, goal: "8-10", focus: "Push", type: "set", rest: 60 },
    { id: "B2", pair: "B", name: "Seated Leg Curl", sets: 3, goal: "12-15", focus: "Hams", type: "set", rest: 60 },
    { id: "C1", pair: "C", name: "Seated Cable Row", sets: 3, goal: "10-12", focus: "Back", type: "set", rest: 60 },
    { id: "C2", pair: "C", name: "DB Overhead Press", sets: 3, goal: "10-12", focus: "Shoulders", type: "set", rest: 60 },
    { id: "D1", pair: "D", name: "Plank / Captain's Chair", sets: 3, goal: "45s", focus: "Core", type: "time", rest: 30 },
    { id: "D2", pair: "D", name: "Walking Lunges", sets: 3, goal: "12 Total", focus: "Burn", type: "set", rest: 30 }
  ];

  // --- 3. VOLUME CALCULATION LOGIC ---
  const calculateTotalVolume = () => {
    let total = 0;
    MASTER_PLAN.forEach(ex => {
      const extraCount = exerciseData[`${ex.id}-extra`] || 0;
      for (let i = 0; i < (ex.sets + extraCount); i++) {
        if (completedSets[`${ex.id}-${i}`]) {
          const val = parseFloat(exerciseData[`${ex.id}-${i}`]) || 0;
          // For simplicity, we assume 'Goal' reps for the volume calculation
          const reps = parseInt(ex.goal) || 10; 
          total += val * reps;
        }
      }
    });
    return total.toLocaleString();
  };

  useEffect(() => {
    localStorage.setItem('titan_completed_v6', JSON.stringify(completedSets));
    localStorage.setItem('titan_data_v6', JSON.stringify(exerciseData));
  }, [completedSets, exerciseData]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const THEME = {
    black: '#000000',
    card: '#0c0c0c',
    border: '#1a1a1a',
    orange: '#FF5C00',
    textMain: '#FFFFFF',
    textDim: '#555555'
  };

  const addExtraSet = (exId) => {
    const key = `${exId}-extra`;
    setExerciseData(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.textMain, fontFamily: 'sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '160px' }}>
      
      {/* HUD HEADER WITH VOLUME TRACKER */}
      <header style={{ marginBottom: '25px', paddingTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', margin: 0, color: THEME.orange, letterSpacing: '-2px' }}>TITAN</h1>
          <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
            <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}>
              <Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} />
            </button>
            <button onClick={() => setView('history')} style={{ background: view === 'history' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}>
              <History size={20} color={view === 'history' ? '#000' : '#444'} />
            </button>
          </div>
        </div>
        
        {/* VOLUME HUD */}
        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#111', padding: '12px 20px', borderRadius: '16px', marginTop: '15px', border: '1px solid #222' }}>
          <div>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: THEME.textDim, textTransform: 'uppercase' }}>Session Volume</span>
            <div style={{ fontSize: '18px', fontWeight: '900', color: THEME.orange }}>{calculateTotalVolume()} <span style={{fontSize: '10px'}}>KG</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: THEME.textDim, textTransform: 'uppercase' }}>Protocol</span>
            <div style={{ fontSize: '14px', fontWeight: '900' }}>Strength v1</div>
          </div>
        </div>
      </header>

      {view === 'train' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MASTER_PLAN.map((ex) => {
            const extraCount = exerciseData[`${ex.id}-extra`] || 0;
            const totalSets = ex.sets + extraCount;

            return (
              <div key={ex.id} style={{ 
                background: THEME.card, borderRadius: '24px', padding: '20px', border: `1px solid ${THEME.border}`,
                borderLeft: `4px solid ${ex.pair === 'A' || ex.pair === 'C' ? THEME.orange : '#333'}` 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: THEME.textDim }}>{ex.id} // {ex.focus}</span>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', margin: '0', textTransform: 'uppercase' }}>{ex.name}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: THEME.orange }}>{ex.goal} REPS</div>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: THEME.textDim }}>{ex.rest}s REST</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button 
                          onClick={() => {
                            setCompletedSets(prev => ({ ...prev, [key]: !isDone }));
                            if (!isDone) setTimeLeft(ex.rest);
                          }}
                          style={{ height: '55px', borderRadius: '14px', border: isDone ? `2px solid ${THEME.orange}` : `2px solid ${THEME.border}`, background: isDone ? THEME.orange : 'transparent', color: isDone ? '#000' : THEME.textDim, fontWeight: '900', fontSize: '18px' }}
                        >
                          {isDone ? <CheckCircle size={22} /> : i + 1}
                        </button>
                        <input 
                          type="text" inputMode="decimal" placeholder="Target"
                          value={exerciseData[key] || ''}
                          onChange={(e) => setExerciseData(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: '100%', background: THEME.black, border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '11px', textAlign: 'center', fontWeight: 'bold', padding: '6px 0', borderRadius: '8px', outline: 'none' }}
                        />
                      </div>
                    );
                  })}
                  <button onClick={() => addExtraSet(ex.id)} style={{ height: '55px', borderRadius: '14px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: THEME.textDim }}>
          <Activity size={40} style={{ marginBottom: '10px', opacity: 0.2 }} />
          <p style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }}>V6 Engine Running</p>
        </div>
      )}

      {/* DYNAMIC FLOATING TIMER */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFF', color: '#000', padding: '12px 35px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: `0 15px 45px ${THEME.orange}55`, border: `4px solid ${THEME.orange}`, zIndex: 2000 }}>
          <Clock size={24} />
          <span style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'monospace' }}>{timeLeft}s</span>
          <RotateCcw size={20} onClick={() => setTimeLeft(0)} />
        </div>
      )}

      {/* FINISH ACTION */}
      {view === 'train' && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: 'linear-gradient(transparent, #000 80%)' }}>
          <button 
            onClick={() => { if(window.confirm("Finish Session & Sync?")) { localStorage.clear(); window.location.reload(); }}}
            style={{ width: '100%', maxWidth: '460px', margin: '0 auto', display: 'block', padding: '22px', borderRadius: '24px', border: 'none', background: '#FFF', color: '#000', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', fontStyle: 'italic' }}
          >
            End Protocol
          </button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
