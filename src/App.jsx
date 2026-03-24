import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, X, ChevronRight, Activity, Trash2, StopCircle } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(() => Date.now());
  const [sessionElapsed, setSessionElapsed] = useState("00:00");

  // 1. DATA PERSISTENCE
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_completed_v18');
    const savedData = localStorage.getItem('titan_data_v18');
    const savedCustom = localStorage.getItem('titan_custom_v18');
    const savedStart = localStorage.getItem('titan_start_v18');
    
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    if (savedStart) setSessionStartTime(parseInt(savedStart));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_completed_v18', JSON.stringify(completedSets));
      localStorage.setItem('titan_data_v18', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v18', JSON.stringify(customExercises));
      localStorage.setItem('titan_start_v18', sessionStartTime.toString());
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  // 2. TIMERS (Session & Rest)
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime) / 1000);
      const m = Math.floor(diff / 60).toString().padStart(2, '0');
      const s = (diff % 60).toString().padStart(2, '0');
      setSessionElapsed(`${m}:${s}`);
      
      if (timeLeft > 0) setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime, timeLeft]);

  const MACHINE_LIBRARY = {
    LEGS: ["Leg Extension", "Calf Raise", "Glute Bridge"],
    PUSH: ["Incline Chest Press", "Shoulder Press", "Tricep Pushdown"],
    PULL: ["Face Pulls", "Bicep Curls", "Hammer Curls"]
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

  const finishSession = () => {
    if (window.confirm("Complete session? Data will be cleared.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const THEME = { black: '#000', card: '#111', orange: '#FF5C00', textDim: '#555', border: '#222' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '160px' }}>
      
      {/* HEADER WITH SESSION TIMER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 0' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: THEME.textDim }}>TIME: {sessionElapsed}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px' }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><Dumbbell size={22} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><PlusCircle size={22} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><BarChart3 size={22} color={view === 'metrics' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {FULL_PLAN.map((ex) => (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '20px', padding: '20px', borderLeft: ex.isCustom ? '6px solid #333' : `6px solid ${THEME.orange}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{ex.name}</h3>
                <span style={{ color: THEME.orange, fontWeight: '900', fontSize: '12px' }}>{ex.goal}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...Array(ex.sets + (exerciseData[`${ex.id}-extra`] || 0))].map((_, i) => {
                  const key = `${ex.id}-${i}`;
                  const isDone = completedSets[key];
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '55px 1fr 1fr 30px', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => { if(!isDone) setTimeLeft(ex.rest); setCompletedSets(prev => ({ ...prev, [key]: !isDone })); }}
                        style={{ height: '50px', borderRadius: '10px', border: 'none', background: isDone ? THEME.orange : '#222', color: isDone ? '#000' : '#fff', fontWeight: '900', fontSize: '18px' }}>
                        {isDone ? <CheckCircle size={22} /> : i + 1}
                      </button>
                      <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[`${key}-w`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-w`]: e.target.value }))}
                        style={{ background: '#000', border: '1px solid #222', color: '#fff', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '12px 0', borderRadius: '10px' }} />
                      <input type="text" inputMode="numeric" placeholder="REPS" value={exerciseData[`${key}-r`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-r`]: e.target.value }))}
                        style={{ background: '#000', border: '1px solid #222', color: THEME.orange, fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '12px 0', borderRadius: '10px' }} />
                      <button onClick={() => { 
                        const ns = {...completedSets}; const nd = {...exerciseData}; delete ns[key]; delete nd[`${key}-w`]; delete nd[`${key}-r`];
                        if(i >= ex.sets) nd[`${ex.id}-extra`] = Math.max(0, (nd[`${ex.id}-extra`]||0)-1);
                        setCompletedSets(ns); setExerciseData(nd);
                      }} style={{ background: 'transparent', border: 'none' }}><X size={16} color="#444" /></button>
                    </div>
                  );
                })}
                <button onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                  style={{ padding: '12px', borderRadius: '10px', border: '2px dashed #222', background: 'transparent', color: '#444', fontWeight: 'bold', fontSize: '12px' }}>+ ADD SET</button>
              </div>
            </div>
          ))}

          {/* COMPLETE SESSION BOX AT BOTTOM */}
          <div style={{ marginTop: '20px', padding: '20px', background: THEME.orange, borderRadius: '20px', textAlign: 'center' }} onClick={finishSession}>
            <div style={{ color: '#000', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase' }}>Complete Training Session</div>
            <div style={{ color: '#000', fontSize: '12px', opacity: 0.8, fontWeight: 'bold' }}>Finalize Volume & Clear Cache</div>
          </div>
        </div>
      )}

      {/* REST TIMER HUD WITH MANUAL ADJUST */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '15px', right: '15px', backgroundColor: '#FFF', color: '#000', padding: '15px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `4px solid ${THEME.orange}`, zIndex: 2000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Clock size={24} />
            <span style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setTimeLeft(prev => prev + 15)} style={{ background: '#eee', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: '900' }}>+15</button>
            <button onClick={() => setTimeLeft(0)} style={{ background: THEME.orange, border: 'none', padding: '8px 12px', borderRadius: '8px', color: '#000' }}><StopCircle size={20} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
