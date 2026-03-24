import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, Plus, XCircle, Zap, Target, TrendingUp } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train'); // 'train' or 'metrics'
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState(() => 
    JSON.parse(localStorage.getItem('titan_completed_v8') || '{}')
  );
  const [exerciseData, setExerciseData] = useState(() => 
    JSON.parse(localStorage.getItem('titan_data_v8') || '{}')
  );

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

  // --- ANALYTICS ENGINE ---
  const getStats = () => {
    let volume = 0;
    let completed = 0;
    let total = 0;
    let machineLoad = 0;
    let machineCount = 0;

    MASTER_PLAN.forEach(ex => {
      const extra = exerciseData[`${ex.id}-extra`] || 0;
      const totalExSets = ex.sets + extra;
      total += totalExSets;

      for (let i = 0; i < totalExSets; i++) {
        if (completedSets[`${ex.id}-${i}`]) {
          completed++;
          const w = parseFloat(exerciseData[`${ex.id}-${i}`]) || 0;
          const r = parseInt(ex.goal) || 10;
          volume += (w * r);
          if(w > 0) { machineLoad += w; machineCount++; }
        }
      }
    });

    return {
      volume: volume.toLocaleString(),
      progress: `${completed}/${total}`,
      percent: Math.round((completed / total) * 100) || 0,
      avgWeight: machineCount > 0 ? (machineLoad / machineCount).toFixed(1) : 0
    };
  };

  const stats = getStats();

  useEffect(() => {
    localStorage.setItem('titan_completed_v8', JSON.stringify(completedSets));
    localStorage.setItem('titan_data_v8', JSON.stringify(exerciseData));
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

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.textMain, fontFamily: 'sans-serif', padding: '20px', maxWidth: '500px', margin: '0 auto', paddingBottom: '120px' }}>
      
      {/* 1. TRAINING VIEW */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <header style={{ marginBottom: '10px' }}>
             <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
             <span style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold' }}>TRAINING MODE ACTIVE</span>
          </header>

          {MASTER_PLAN.map((ex) => {
            const extraCount = exerciseData[`${ex.id}-extra`] || 0;
            const totalSets = ex.sets + extraCount;
            return (
              <div key={ex.id} style={{ background: THEME.card, borderRadius: '20px', padding: '18px', border: `1px solid ${THEME.border}`, borderLeft: `4px solid ${ex.pair === 'A' || ex.pair === 'C' ? THEME.orange : '#222'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0' }}>{ex.id} {ex.name}</h3>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: THEME.orange }}>{ex.goal}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' }}>
                  {[...Array(totalSets)].map((_, i) => {
                    const key = `${ex.id}-${i}`;
                    const isDone = completedSets[key];
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button 
                          onClick={() => { setCompletedSets(prev => ({ ...prev, [key]: !isDone })); if(!isDone) setTimeLeft(ex.rest); }}
                          style={{ height: '48px', borderRadius: '12px', border: isDone ? `2px solid ${THEME.orange}` : `2px solid ${THEME.border}`, background: isDone ? THEME.orange : 'transparent', color: isDone ? '#000' : THEME.textDim, fontWeight: '900' }}
                        >{isDone ? <CheckCircle size={18} /> : i + 1}</button>
                        <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[key] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [key]: e.target.value }))}
                          style={{ width: '100%', background: THEME.black, border: `1px solid ${THEME.border}`, color: '#fff', fontSize: '11px', textAlign: 'center', padding: '6px 0', borderRadius: '8px', outline: 'none' }} />
                      </div>
                    );
                  })}
                  <button onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                    style={{ height: '48px', borderRadius: '12px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  ><Plus size={18} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. METRICS VIEW */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <header style={{ marginBottom: '10px' }}>
             <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>METRICS</h1>
             <span style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold' }}>SESSION PERFORMANCE ANALYTICS</span>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
            <div style={{ background: THEME.card, padding: '25px', borderRadius: '24px', border: `1px solid ${THEME.border}`, textAlign: 'center' }}>
               <TrendingUp size={32} color={THEME.orange} style={{ margin: '0 auto 10px' }} />
               <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold', textTransform: 'uppercase' }}>Current Session Volume</div>
               <div style={{ fontSize: '48px', fontWeight: '900' }}>{stats.volume} <span style={{ fontSize: '14px', color: THEME.orange }}>KG</span></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
               <div style={{ background: THEME.card, padding: '20px', borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
                  <Target size={20} color={THEME.orange} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold' }}>PROGRESS</div>
                  <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.percent}%</div>
                  <div style={{ fontSize: '10px', color: THEME.textDim }}>{stats.progress} Sets</div>
               </div>
               <div style={{ background: THEME.card, padding: '20px', borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
                  <Zap size={20} color={THEME.orange} style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold' }}>AVG LOAD</div>
                  <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.avgWeight}</div>
                  <div style={{ fontSize: '10px', color: THEME.textDim }}>KG Per Set</div>
               </div>
            </div>
          </div>
          
          <button onClick={() => { if(window.confirm("End Protocol & Sync?")) { localStorage.clear(); window.location.reload(); }}}
            style={{ marginTop: '20px', width: '100%', padding: '22px', borderRadius: '22px', border: 'none', background: '#FFF', color: '#000', fontWeight: '900', fontSize: '16px', textTransform: 'uppercase' }}>
            Finish & Reset
          </button>
        </div>
      )}

      {/* 3. NAVIGATION & FLOATING TIMER */}
      {timeLeft > 0 && view === 'train' && (
        <div style={{ position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#FFF', color: '#000', padding: '10px 30px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px', border: `4px solid ${THEME.orange}`, zHex: 1000 }}>
          <Clock size={24} />
          <span style={{ fontSize: '38px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          <RotateCcw size={18} onClick={() => setTimeLeft(0)} />
        </div>
      )}

      <nav style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: '#111', padding: '10px', borderRadius: '20px', display: 'flex', gap: '10px', border: '1px solid #222', zIndex: 1000 }}>
        <button onClick={() => setView('train')} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', background: view === 'train' ? THEME.orange : 'transparent', color: view === 'train' ? '#000' : THEME.textDim, fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
           <Dumbbell size={20} /> TRAIN
        </button>
        <button onClick={() => setView('metrics')} style={{ flex: 1, padding: '15px', borderRadius: '14px', border: 'none', background: view === 'metrics' ? THEME.orange : 'transparent', color: view === 'metrics' ? '#000' : THEME.textDim, fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
           <BarChart3 size={20} /> STATS
        </button>
      </nav>
    </div>
  );
};

export default TitanTracker;
