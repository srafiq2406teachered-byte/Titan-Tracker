import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Dumbbell, BarChart3, PlusCircle, X, ChevronRight, Activity, Trash2, StopCircle, Timer, Zap, Target } from 'lucide-react';

const TitanTracker = () => {
  const MASTER_PROTOCOL = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", rest: 60 },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15", rest: 60 },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12", rest: 60 },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s", rest: 30 },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", rest: 30 }
  ];

  const MASTER_LIBRARY = {
    CARDIO: ["Treadmill", "Stationary Bike", "Elliptical"],
    LEGS: ["Leg Extension", "Calf Raise", "Glute Bridge"],
    PUSH: ["Incline Chest Press", "Shoulder Press", "Tricep Pushdown"],
    PULL: ["Face Pulls", "Bicep Curls", "Hammer Curls"]
  };

  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState([]);
  const [sessionStartTime] = useState(() => Date.now());
  const [sessionElapsed, setSessionElapsed] = useState("00:00");

  useEffect(() => {
    const savedSets = localStorage.getItem('titan_sets_v27');
    const savedData = localStorage.getItem('titan_metrics_v27');
    const savedCustom = localStorage.getItem('titan_custom_v27');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_sets_v27', JSON.stringify(completedSets));
      localStorage.setItem('titan_metrics_v27', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v27', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime) / 1000);
      setSessionElapsed(`${Math.floor(diff/60).toString().padStart(2,'0')}:${(diff%60).toString().padStart(2,'0')}`);
      if (timeLeft > 0) setTimeLeft(p => p - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime, timeLeft]);

  // --- ANALYTICS ENGINE ---
  const getStats = () => {
    let volume = 0;
    let totalReps = 0;
    let cardioMin = 0;
    let strengthSets = 0;
    let max1RM = 0;
    let peakExercise = "None";

    [...MASTER_PROTOCOL, ...customExercises].forEach(ex => {
      const extra = exerciseData[`${ex.id}-extra`] || 0;
      for (let i = 0; i < (ex.sets + extra); i++) {
        const key = `${ex.id}-${i}`;
        if (completedSets[key]) {
          const w = parseFloat(exerciseData[`${key}-w`] || 0);
          const r = parseFloat(exerciseData[`${key}-r`] || 0);
          if (ex.isCardio) {
            cardioMin += w;
          } else {
            volume += (w * r);
            totalReps += r;
            strengthSets++;
            // Epley Formula: 1RM = W * (1 + R/30)
            if (r > 0) {
              const current1RM = w * (1 + (r / 30));
              if (current1RM > max1RM) {
                max1RM = current1RM;
                peakExercise = ex.name;
              }
            }
          }
        }
      }
    });
    return { volume, cardioMin, avgWeight: strengthSets > 0 ? (volume / totalReps).toFixed(1) : 0, strengthSets, max1RM: Math.round(max1RM), peakExercise };
  };

  const stats = getStats();
  const THEME = { orange: '#FF5C00', blue: '#00A3FF', bg: '#000', card: '#111', border: '#222', textDim: '#555' };
  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '10px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: THEME.textDim }}>{sessionElapsed}</div>
        </div>
        <div style={{ display: 'flex', gap: '5px', background: THEME.card, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><PlusCircle size={20} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><BarChart3 size={20} color={view === 'metrics' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* VIEW: METRICS (Dashboard with 1RM) */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Main Volume Card */}
          <div style={{ background: THEME.card, padding: '25px', borderRadius: '20px', border: `1px solid ${THEME.border}`, textAlign: 'center' }}>
            <Activity size={32} color={THEME.orange} style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '12px', color: THEME.textDim, fontWeight: 'bold', textTransform: 'uppercase' }}>Session Volume</div>
            <div style={{ fontSize: '48px', fontWeight: '900' }}>{stats.volume.toLocaleString()}<span style={{ fontSize: '16px', color: THEME.orange }}> KG</span></div>
          </div>

          {/* 1RM Peak Power Card */}
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '20px', border: `1px solid ${THEME.orange}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: THEME.orange, fontWeight: 'bold' }}>PEAK ESTIMATED 1RM</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', marginTop: '4px' }}>{stats.peakExercise}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '32px', fontWeight: '900' }}>{stats.max1RM}<span style={{ fontSize: '14px' }}> KG</span></div>
            </div>
          </div>

          {/* Grid Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ background: THEME.card, padding: '20px', borderRadius: '20px', border: `1px solid ${THEME.border}` }}>
              <Zap size={20} color={THEME.orange} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '11px', color: THEME.textDim, fontWeight: 'bold' }}>AVG INTENSITY</div>
              <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.avgWeight}<span style={{ fontSize: '12px' }}> KG</span></div>
            </div>
            <div style={{ background: THEME.card, padding: '20px', borderRadius: '20px', border: `1px solid ${THEME.border}` }}>
              <Timer size={20} color={THEME.blue} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '11px', color: THEME.textDim, fontWeight: 'bold' }}>CARDIO TIME</div>
              <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.cardioMin}<span style={{ fontSize: '12px' }}> MIN</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TRAIN & LIBRARY VIEWS RETAINED FROM v26.0 */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...MASTER_PROTOCOL, ...customExercises].map((ex) => (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '18px', padding: '15px', borderLeft: `5px solid ${ex.isCardio ? THEME.blue : (ex.isCustom ? '#333' : THEME.orange)}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{ex.name}</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ color: ex.isCardio ? THEME.blue : THEME.orange, fontWeight: '900', fontSize: '11px' }}>{ex.goal}</span>
                  {ex.isCustom && <Trash2 size={16} color="#444" onClick={() => setCustomExercises(prev => prev.filter(c => c.id !== ex.id))} />}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[...Array(ex.sets + (exerciseData[`${ex.id}-extra`] || 0))].map((_, i) => {
                  const key = `${ex.id}-${i}`;
                  const isDone = completedSets[key];
                  return (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => { if(!isDone && !ex.isCardio) setTimeLeft(ex.rest); setCompletedSets(prev => ({ ...prev, [key]: !isDone })); }}
                        style={{ width: '15%', height: '48px', borderRadius: '10px', border: 'none', background: isDone ? (ex.isCardio ? THEME.blue : THEME.orange) : '#222', color: isDone ? '#000' : '#fff', fontWeight: '900', fontSize: '16px' }}>
                        {isDone ? <CheckCircle size={20} /> : (ex.isCardio ? <Timer size={18}/> : i + 1)}
                      </button>
                      <input type="text" inputMode="decimal" placeholder={ex.isCardio ? "MIN" : "KG"} value={exerciseData[`${key}-w`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-w`]: e.target.value }))}
                        style={{ flex: 1, minWidth: 0, background: '#000', border: '1px solid #222', color: '#fff', fontSize: '14px', textAlign: 'center', padding: '12px 0', borderRadius: '10px' }} />
                      <input type="text" inputMode="numeric" placeholder={ex.isCardio ? "LVL" : "REPS"} value={exerciseData[`${key}-r`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-r`]: e.target.value }))}
                        style={{ flex: 1, minWidth: 0, background: '#000', border: '1px solid #222', color: ex.isCardio ? THEME.blue : THEME.orange, fontSize: '14px', textAlign: 'center', padding: '12px 0', borderRadius: '10px' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <button style={{ background: THEME.orange, color: '#000', padding: '20px', borderRadius: '18px', border: 'none', fontWeight: '900', marginTop: '10px' }} onClick={() => { if(window.confirm("Finish Session?")) { localStorage.clear(); window.location.reload(); }}}>FINISH WORKOUT</button>
        </div>
      )}

      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.entries(MASTER_LIBRARY).map(([category, machines]) => (
            <div key={category}>
              <div style={{ fontSize: '12px', color: category === 'CARDIO' ? THEME.blue : THEME.orange, fontWeight: '900', marginBottom: '10px' }}>{category}</div>
              {machines.map(m => (
                <button key={m} onClick={() => { setCustomExercises([...customExercises, { id: `EXT-${Date.now()}`, name: m, sets: 1, goal: category === 'CARDIO' ? "Steady State" : "10-12", rest: 0, isCustom: true, isCardio: category === 'CARDIO' }]); setView('train'); }}
                  style={{ width: '100%', padding: '18px', background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: '15px', color: '#fff', display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '16px', fontWeight: '700' }}>
                  {m} <ChevronRight size={18} color={category === 'CARDIO' ? THEME.blue : THEME.orange} />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '10px', right: '10px', backgroundColor: '#FFF', color: '#000', padding: '12px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `3px solid ${THEME.orange}`, zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} /> <span style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: THEME.orange, border: 'none', padding: '8px 12px', borderRadius: '8px' }}><StopCircle size={18} /></button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
