import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, History, Plus, Timer } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});

  // THE MASTER PROTOCOL (A1-D2)
  const MASTER_PLAN = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10 Reps", focus: "Power & Base", type: "set" },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12 Reps", focus: "Vertical Pull", type: "set" },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10 Reps", focus: "Horizontal Push", type: "set" },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15 Reps", focus: "Hamstrings", type: "set" },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12 Reps", focus: "Mid-Back Squeeze", type: "set" },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12 Reps", focus: "Vertical Push", type: "set" },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s Hold", focus: "Core Stability", type: "time" },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", focus: "Metabolic Burn", type: "set" }
  ];

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

  const addSet = (exId) => {
    setExerciseData(prev => ({
      ...prev,
      [exId]: { ...prev[exId], extraSets: (prev[exId]?.extraSets || 0) + 1 }
    }));
  };

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.textMain, fontFamily: 'sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '120px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingTop: '10px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', margin: 0, color: THEME.orange, letterSpacing: '-2px' }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
            <Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} />
          </button>
          <button onClick={() => setView('history')} style={{ background: view === 'history' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
            <History size={20} color={view === 'history' ? '#000' : '#444'} />
          </button>
        </div>
      </header>

      {view === 'train' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {MASTER_PLAN.map((ex) => {
            const totalSets = ex.sets + (exerciseData[ex.id]?.extraSets || 0);
            return (
              <div key={ex.id} style={{ background: THEME.card, borderRadius: '24px', padding: '20px', border: `1px solid ${THEME.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: THEME.orange, letterSpacing: '1px' }}>{ex.id} // {ex.focus}</span>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '2px 0', textTransform: 'uppercase' }}>{ex.name}</h3>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: THEME.textMain }}>{ex.goal}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '10px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const isDone = completedSets[`${ex.id}-${i}`];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button 
                          onClick={() => {
                            const key = `${ex.id}-${i}`;
                            setCompletedSets(prev => ({...prev, [key]: !isDone}));
                            if(!isDone) setTimeLeft(60);
                          }}
                          style={{ height: '50px', borderRadius: '12px', border: isDone ? `2px solid ${THEME.orange}` : `2px solid ${THEME.border}`, background: isDone ? THEME.orange : 'transparent', color: isDone ? '#000' : THEME.textDim, fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {isDone ? <CheckCircle size={20} /> : i + 1}
                        </button>
                        <input 
                          type="text" 
                          placeholder={ex.type === 'set' ? 'kg' : 'min'}
                          style={{ width: '100%', background: THEME.black, border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '10px', textAlign: 'center', fontWeight: 'bold', padding: '4px 0', borderRadius: '6px', outline: 'none' }}
                        />
                      </div>
                    );
                  })}
                  <button onClick={() => addSet(ex.id)} style={{ height: '50px', borderRadius: '12px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: THEME.textDim }}>
          <History size={48} style={{ marginBottom: '15px', opacity: 0.2 }} />
          <p style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px' }}>No session history recorded.</p>
        </div>
      )}

      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#000', padding: '12px 30px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 40px rgba(255,92,0,0.4)', border: `4px solid ${THEME.orange}`, zIndex: 1000 }}>
          <Timer size={28} />
          <span style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'monospace' }}>{timeLeft}s</span>
          <RotateCcw size={18} onClick={() => setTimeLeft(0)} style={{ cursor: 'pointer' }} />
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
