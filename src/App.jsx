import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, X, ChevronRight, Activity, Trash2, StopCircle } from 'lucide-react';

const TitanTracker = () => {
  // --- STATE ---
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(() => Date.now());
  const [sessionElapsed, setSessionElapsed] = useState("00:00");

  // --- HARD-CODED MASTER PROTOCOL (Never Lost) ---
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

  const MACHINE_LIBRARY = {
    LEGS: ["Leg Extension", "Calf Raise", "Glute Bridge"],
    PUSH: ["Incline Chest Press", "Shoulder Press", "Tricep Pushdown", "Lateral Raise"],
    PULL: ["Face Pulls", "Bicep Curls", "Hammer Curls", "Rear Delt Fly"]
  };

  // --- DATA SYNC ---
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_sets_v19');
    const savedData = localStorage.getItem('titan_metrics_v19');
    const savedCustom = localStorage.getItem('titan_custom_v19');
    
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_sets_v19', JSON.stringify(completedSets));
      localStorage.setItem('titan_metrics_v19', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v19', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  // --- TIMERS ---
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime) / 1000);
      setSessionElapsed(`${Math.floor(diff / 60).toString().padStart(2, '0')}:${(diff % 60).toString().padStart(2, '0')}`);
      if (timeLeft > 0) setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime, timeLeft]);

  const calculateVolume = () => {
    let total = 0;
    [...PROTOCOL, ...customExercises].forEach(ex => {
      const extra = exerciseData[`${ex.id}-extra`] || 0;
      for (let i = 0; i < (ex.sets + extra); i++) {
        const key = `${ex.id}-${i}`;
        if (completedSets[key]) {
          const w = parseFloat(exerciseData[`${key}-w`]) || 0;
          const r = parseFloat(exerciseData[`${key}-r`]) || 0;
          total += (w * r);
        }
      }
    });
    return total.toLocaleString();
  };

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#111', border: '#222', textDim: '#555' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '160px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: THEME.textDim }}>SESSION: {sessionElapsed}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px' }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '10px' }}><Dumbbell size={24} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '10px' }}><PlusCircle size={24} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '10px' }}><BarChart3 size={24} color={view === 'metrics' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[...PROTOCOL, ...customExercises].map((ex) => (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '24px', padding: '22px', borderLeft: ex.isCustom ? '6px solid #333' : `6px solid ${THEME.orange}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{ex.name}</h3>
                <span style={{ color: THEME.orange, fontWeight: '900', fontSize: '12px' }}>GOAL: {ex.goal}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...Array(ex.sets + (exerciseData[`${ex.id}-extra`] || 0))].map((_, i) => {
                  const key = `${ex.id}-${i}`;
                  const isDone = completedSets[key];
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 30px', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => { if(!isDone) setTimeLeft(ex.rest); setCompletedSets(prev => ({ ...prev, [key]: !isDone })); }}
                        style={{ height: '55px', borderRadius: '12px', border: 'none', background: isDone ? THEME.orange : '#222', color: isDone ? '#000' : '#fff', fontWeight: '900', fontSize: '20px' }}>
                        {isDone ? <CheckCircle size={24} /> : i + 1}
                      </button>
                      <input type="text" inputMode="decimal" placeholder="KG" value={exerciseData[`${key}-w`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-w`]: e.target.value }))}
                        style={{ background: '#000', border: '1px solid #222', color: '#fff', fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '15px 0', borderRadius: '12px' }} />
                      <input type="text" inputMode="numeric" placeholder="REPS" value={exerciseData[`${key}-r`] || ''} onChange={(e) => setExerciseData(prev => ({ ...prev, [`${key}-r`]: e.target.value }))}
                        style={{ background: '#000', border: '1px solid #222', color: THEME.orange, fontSize: '16px', fontWeight: 'bold', textAlign: 'center', padding: '15px 0', borderRadius: '12px' }} />
                      <button onClick={() => { 
                        const ns = {...completedSets}; const nd = {...exerciseData}; delete ns[key]; delete nd[`${key}-w`]; delete nd[`${key}-r`];
                        if(i >= ex.sets) nd[`${ex.id}-extra`] = Math.max(0, (nd[`${ex.id}-extra`]||0)-1);
                        setCompletedSets(ns); setExerciseData(nd);
                      }} style={{ background: 'transparent', border: 'none' }}><X size={18} color="#444" /></button>
                    </div>
                  );
                })}
                <button onClick={() => setExerciseData(prev => ({ ...prev, [`${ex.id}-extra`]: (prev[`${ex.id}-extra`] || 0) + 1 }))}
                  style={{ padding: '15px', borderRadius: '12px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.textDim, fontWeight: 'bold', fontSize: '12px' }}>+ ADD SET</button>
              </div>
            </div>
          ))}

          {/* PINNED COMPLETE BUTTON */}
          <div style={{ marginTop: '20px', padding: '25px', background: THEME.orange, borderRadius: '24px', textAlign: 'center' }} onClick={() => { if(window.confirm("Finish workout? Data clears.")) { localStorage.clear(); window.location.reload(); }}}>
            <div style={{ color: '#000', fontWeight: '900', fontSize: '20px' }}>COMPLETE SESSION</div>
            <div style={{ color: '#000', fontSize: '11px', fontWeight: 'bold' }}>FINAL VOLUME: {calculateVolume()} KG</div>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(MACHINE_LIBRARY).map(([category, machines]) => (
            <div key={category}>
              <div style={{ fontSize: '12px', color: THEME.orange, fontWeight: '900', marginBottom: '12px' }}>{category}</div>
              {machines.map(m => (
                <button key={m} onClick={() => { setCustomExercises([...customExercises, { id: `EXT-${Date.now()}`, name: m, sets: 3, goal: "10-12", rest: 60, isCustom: true }]); setView('train'); }}
                  style={{ width: '100%', padding: '22px', background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: '20px', color: '#fff', display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '18px', fontWeight: '700' }}>
                  {m} <ChevronRight size={20} color={THEME.orange} />
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ textAlign: 'center', paddingTop: '40px' }}>
          <Activity size={64} color={THEME.orange} style={{ margin: '0 auto 20px' }} />
          <div style={{ fontSize: '12px', color: THEME.textDim, fontWeight: 'bold' }}>TOTAL WORKOUT VOLUME</div>
          <div style={{ fontSize: '64px', fontWeight: '900' }}>{calculateVolume()} <span style={{ fontSize: '20px', color: THEME.orange }}>KG</span></div>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '15px', right: '15px', backgroundColor: '#FFF', color: '#000', padding: '15px', borderRadius: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `4px solid ${THEME.orange}`, zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Clock size={24} /> <span style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setTimeLeft(prev => prev + 15)} style={{ background: '#eee', border: 'none', padding: '10px 15px', borderRadius: '10px', fontWeight: '900' }}>+15</button>
            <button onClick={() => setTimeLeft(0)} style={{ background: THEME.orange, border: 'none', padding: '10px 15px', borderRadius: '10px' }}><StopCircle size={22} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
