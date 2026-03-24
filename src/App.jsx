import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, History, Plus, Timer, Zap } from 'lucide-react';

const TitanTracker = () => {
  // 1. STATE WITH LOCALSTORAGE PERSISTENCE
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState(() => 
    JSON.parse(localStorage.getItem('titan_completed') || '{}')
  );
  const [exerciseData, setExerciseData] = useState(() => 
    JSON.parse(localStorage.getItem('titan_data') || '{}')
  );

  // 2. PROTOCOL DEFINITION (A1-D2)
  const MASTER_PLAN = [
    { id: "A1", pair: "A", name: "Leg Press Machine", sets: 3, goal: "8-10", focus: "Power", type: "set" },
    { id: "A2", pair: "A", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", focus: "Pull", type: "set" },
    { id: "B1", pair: "B", name: "Chest Press Machine", sets: 3, goal: "8-10", focus: "Push", type: "set" },
    { id: "B2", pair: "B", name: "Seated Leg Curl", sets: 3, goal: "12-15", focus: "Hams", type: "set" },
    { id: "C1", pair: "C", name: "Seated Cable Row", sets: 3, goal: "10-12", focus: "Back", type: "set" },
    { id: "C2", pair: "C", name: "DB Overhead Press", sets: 3, goal: "10-12", focus: "Shoulders", type: "set" },
    { id: "D1", pair: "D", name: "Plank / Captain's Chair", sets: 3, goal: "45s", focus: "Core", type: "time" },
    { id: "D2", pair: "D", name: "Walking Lunges", sets: 3, goal: "12 Total", focus: "Burn", type: "set" }
  ];

  // 3. PERSISTENCE ENGINE
  useEffect(() => {
    localStorage.setItem('titan_completed', JSON.stringify(completedSets));
    localStorage.setItem('titan_data', JSON.stringify(exerciseData));
  }, [completedSets, exerciseData]);

  // 4. TIMER ENGINE
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

  const handleDataChange = (exId, setIdx, val) => {
    setExerciseData(prev => ({
      ...prev,
      [`${exId}-${setIdx}`]: val
    }));
  };

  const addExtraSet = (exId) => {
    const key = `${exId}-extra`;
    setExerciseData(prev => ({
      ...prev,
      [key]: (prev[key] || 0) + 1
    }));
  };

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.textMain, fontFamily: 'sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '140px' }}>
      
      {/* HUD HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingTop: '10px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', margin: 0, color: THEME.orange, letterSpacing: '-2px' }}>TITAN</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Zap size={10} color={THEME.orange} />
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '1px' }}>Protocol: Fat Burn + Strength</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('history')} style={{ background: view === 'history' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}><History size={20} color={view === 'history' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {view === 'train' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MASTER_PLAN.map((ex) => {
            const extraCount = exerciseData[`${ex.id}-extra`] || 0;
            const totalSets = ex.sets + extraCount;

            return (
              <div key={ex.id} style={{ 
                background: THEME.card, 
                borderRadius: '24px', 
                padding: '20px', 
                border: `1px solid ${THEME.border}`,
                borderLeft: `4px solid ${ex.pair === 'A' || ex.pair === 'C' ? THEME.orange : THEME.border}` 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: THEME.textDim, letterSpacing: '1px' }}>{ex.id} // {ex.focus}</span>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', margin: '2px 0', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{ex.name}</h3>
                  </div>
                  <div style={{ background: '#1a1a1a', padding: '4px 8px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: THEME.orange }}>{ex.goal}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <button 
                          onClick={() => {
                            setCompletedSets(prev => ({...prev, [key]: !isDone}));
                            if(!isDone) setTimeLeft(60);
                          }}
                          style={{ 
                            height: '55px', 
                            borderRadius: '14px', 
                            border: isDone ? `2px solid ${THEME.orange}` : `2px solid ${THEME.border}`, 
                            background: isDone ? THEME.orange : 'transparent', 
                            color: isDone ? '#000' : THEME.textDim, 
                            fontWeight: '900', 
                            fontSize: '18px',
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            transition: 'all 0.1s active:scale-95'
                          }}
                        >
                          {isDone ? <CheckCircle size={22} strokeWidth={3} /> : i + 1}
                        </button>
                        <input 
                          type="text" 
                          inputMode="decimal"
                          placeholder={ex.type === 'set' ? 'kg' : 'min'}
                          value={exerciseData[key] || ''}
                          onChange={(e) => handleDataChange(ex.id, i, e.target.value)}
                          style={{ width: '100%', background: THEME.black, border: `1px solid ${THEME.border}`, color: THEME.orange, fontSize: '11px', textAlign: 'center', fontWeight: 'bold', padding: '6px 0', borderRadius: '8px', outline: 'none' }}
                        />
                      </div>
                    );
                  })}
                  <button onClick={() => addExtraSet(ex.id)} style={{ height: '55px', borderRadius: '14px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: THEME.textDim }}>
          <History size={40} style={{ marginBottom: '10px', opacity: 0.2 }} />
          <p style={{ fontWeight: '900', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Session History Log Empty</p>
        </div>
      )}

      {/* TITAN TIMER OVERLAY */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFFFFF', color: '#000', padding: '15px 35px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 20px 50px rgba(255,92,0,0.5)', border: `4px solid ${THEME.orange}`, zIndex: 1000 }}>
          <Timer size={32} />
          <span style={{ fontSize: '48px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'monospace', letterSpacing: '-2px' }}>{timeLeft}s</span>
          <button onClick={() => setTimeLeft(0)} style={{ border: 'none', background: '#eee', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex' }}>
            <RotateCcw size={18} />
          </button>
        </div>
      )}

      {/* FINISH BUTTON */}
      {view === 'train' && (
        <div style={{ position: 'fixed', bottom: '0', left: '0', right: '0', padding: '20px', background: 'linear-gradient(transparent, #000 70%)' }}>
          <button 
            onClick={() => { if(window.confirm("Complete Session?")) { setCompletedSets({}); setExerciseData({}); localStorage.clear(); window.location.reload(); }}}
            style={{ width: '100%', maxWidth: '460px', margin: '0 auto', display: 'block', padding: '22px', borderRadius: '22px', border: 'none', background: THEME.textMain, color: THEME.black, fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-1px', cursor: 'pointer' }}
          >
            End Protocol & Sync
          </button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
