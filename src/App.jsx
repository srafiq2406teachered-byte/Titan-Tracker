import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, X, ChevronRight, Activity, Trash2, StopCircle } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState([]);
  const [sessionStartTime] = useState(() => Date.now());
  const [sessionElapsed, setSessionElapsed] = useState("00:00");

  const PROTOCOL = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", rest: 60 },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15", rest: 60 },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12", rest: 60 },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s", rest: 30 },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", rest: 30 }
  ];

  useEffect(() => {
    const savedSets = localStorage.getItem('titan_sets_v20');
    const savedData = localStorage.getItem('titan_metrics_v20');
    const savedCustom = localStorage.getItem('titan_custom_v20');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_sets_v20', JSON.stringify(completedSets));
      localStorage.setItem('titan_metrics_v20', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v20', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime) / 1000);
      setSessionElapsed(`${Math.floor(diff / 60).toString().padStart(2, '0')}:${(diff % 60).toString().padStart(2, '0')}`);
      if (timeLeft > 0) setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime, timeLeft]);

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#111', border: '#222', textDim: '#555' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '10px', maxWidth: '100%', margin: '0 auto', paddingBottom: '140px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
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

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...PROTOCOL, ...customExercises].map((ex) => (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '18px', padding: '15px', borderLeft: `5px solid ${ex.isCustom ? '#333' : THEME.orange}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{ex.name}</h3>
                <span style={{ color: THEME.orange, fontWeight: '900', fontSize: '11px' }}>{ex.goal}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[...Array(ex.sets + (exerciseData[`${ex.id}-extra`] || 0))].map((_, i) => {
                  const key = `${ex.id}-${i}`;
                  const isDone = completedSets[key];
                  return (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                      {/* SET BUTTON: 15% */}
                      <button onClick={() => { if(!isDone) setTimeLeft(ex.rest); setCompletedSets(prev => ({ ...prev, [key]: !isDone })); }}
                        style={{ width: '15%', height: '48px', borderRadius: '10px', border: 'none', background: isDone ? THEME.orange : '#222', color: isDone ? '#000' : '#fff', fontWeight: '900', fontSize: '16px', flexShrink: 0 }}>
                        {isDone ? <CheckCircle size={20} /> : i + 1}
                      </button>
                      
                      {/* INPUTS: FLEX GROW */}
                      <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[`${key}-w`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-w`]: e.target.value }))}
                        style={{ flex: 1, minWidth: 0, background: '#000', border: '1px solid #222', color: '#fff', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', padding: '12px 0', borderRadius: '10px' }} />

                      <input type="text" inputMode="numeric" placeholder="REPS" value={exerciseData[`${key}-r`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-r`]: e.target.value }))}
                        style={{ flex: 1, minWidth: 0, background: '#000', border: '1px solid #222', color: THEME.orange, fontSize: '14px', fontWeight: 'bold', textAlign: 'center', padding: '12px 0', borderRadius: '10px' }} />
                      
                      {/* DELETE X: FIXED SMALL WIDTH */}
                      <button onClick={() => { 
                        const ns = {...completedSets}; const nd = {...exerciseData}; delete ns[key]; delete nd[`${key}-w`]; delete nd[`${key}-r`];
                        if(i >= ex.sets) nd[`${ex.id}-extra`] = Math.max(0, (nd[`${ex.id}-extra`]||0)-1);
                        setCompletedSets(ns); setExerciseData(nd);
                      }} style={{ width: '30px', height: '48px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <X size={16} color="#444" />
                      </button>
                    </div>
                  );
                })}
                <button onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                  style={{ padding: '10px', borderRadius: '10px', border: `1px dashed #333`, background: 'transparent', color: '#555', fontWeight: 'bold', fontSize: '11px' }}>+ ADD SET</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: '10px', padding: '20px', background: THEME.orange, borderRadius: '18px', textAlign: 'center' }} onClick={() => { if(window.confirm("Finish workout? Data clears.")) { localStorage.clear(); window.location.reload(); }}}>
            <div style={{ color: '#000', fontWeight: '900', fontSize: '16px' }}>COMPLETE SESSION</div>
          </div>
        </div>
      )}

      {/* TIMER HUD (MOBILE OPTIMIZED) */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '10px', right: '10px', backgroundColor: '#FFF', color: '#000', padding: '12px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `3px solid ${THEME.orange}`, zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} /> <span style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setTimeLeft(prev => prev + 15)} style={{ background: '#eee', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '12px' }}>+15s</button>
            <button onClick={() => setTimeLeft(0)} style={{ background: THEME.orange, border: 'none', padding: '8px 12px', borderRadius: '8px' }}><StopCircle size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
