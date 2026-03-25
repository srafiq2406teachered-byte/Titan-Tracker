import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, CheckCircle2, Target, Dumbbell
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG ---
  const THEMES = {
    EMERALD: { accent: '#10B981', label: 'Emerald' },
    SAPPHIRE: { accent: '#3B82F6', label: 'Sapphire' },
    CRIMSON: { accent: '#EF4444', label: 'Crimson' }
  };

  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs" }, { id: "A2", name: "Lat Pulldown", muscle: "Back" },
    { id: "B1", name: "Chest Press", muscle: "Chest" }, { id: "B2", name: "Leg Curl", muscle: "Legs" },
    { id: "C1", name: "Cable Row", muscle: "Back" }, { id: "C2", name: "DB Press", muscle: "Chest" },
    { id: "D1", name: "Plank/Core", muscle: "Core" }, { id: "D2", name: "Walking Lunges", muscle: "Legs" }
  ];

  const EXTRA_POOL = [
    { id: "E1", name: "Bicep Curls", muscle: "Arms" }, { id: "E2", name: "Tricep Pushdown", muscle: "Arms" },
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" }, { id: "E4", name: "Face Pulls", muscle: "Back" },
    { id: "E5", name: "Calf Raises", muscle: "Legs" }, { id: "E6", name: "Hammer Curls", muscle: "Arms" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Settings & Bio
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16); // Increased default for better initial visibility
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });
  const [goal, setGoal] = useState({ exercise: 'Chest Press', target: 100 });

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v64_patch');
    if (saved) {
      const d = JSON.parse(saved);
      setHistory(d.history || []); setAccent(d.accent || '#10B981');
      setFontSize(d.fontSize || 16); setBio(d.bio || { weight: 80, height: 180, age: 30, sex: 'm' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v64_patch', JSON.stringify({ history, accent, fontSize, bio, goal }));
  }, [history, accent, fontSize, bio, goal]);

  // --- 4. ENGINE ---
  const startWorkout = (id) => {
    const p = WORKOUTS[id];
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id));
    const init = {};
    list.forEach(ex => { for(let s=0; s<3; s++) { init[`${ex.id}-s${s}-r`] = 10; init[`${ex.id}-s${s}-w`] = 0; } });
    setSessionData(init); setActiveSession({ ...p, list }); setView('train');
  };

  const addExtra = (ex) => {
    setActiveSession(prev => ({ ...prev, list: [...prev.list, ex] }));
    const extraData = {};
    for(let s=0; s<3; s++) { extraData[`${ex.id}-s${s}-r`] = 10; extraData[`${ex.id}-s${s}-w`] = 0; }
    setSessionData(prev => ({ ...prev, ...extraData }));
    setSearchQuery(''); setView('train');
  };

  const removeExercise = (exId) => {
    setActiveSession(p => ({ ...p, list: p.list.filter(item => item.id !== exId) }));
  };

  const updateVal = (key, delta) => setSessionData(p => ({ ...p, [key]: Math.max(0, (parseFloat(p[key]) || 0) + delta) }));

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const sets = [];
      for (let i = 0; i < 3; i++) {
        const w = parseFloat(sessionData[`${ex.id}-s${i}-w`]);
        const r = parseFloat(sessionData[`${ex.id}-s${i}-r`]);
        if (w > 0 || r > 0) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    const vol = details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0);
    setHistory([{ id: activeSession.id, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), name: activeSession.name, color: activeSession.color, details, volume: vol }, ...history]);
    setActiveSession(null); setView('log');
  };

  // Calculations
  const bmi = useMemo(() => (bio.weight / ((bio.height / 100) ** 2)).toFixed(1), [bio]);
  const bmr = useMemo(() => bio.sex === 'm' ? Math.round(10*bio.weight + 6.25*bio.height - 5*bio.age + 5) : Math.round(10*bio.weight + 6.25*bio.height - 5*bio.age - 161), [bio]);
  const totalVol = useMemo(() => history.reduce((acc, h) => acc + (h.volume || 0), 0), [history]);
  const filteredLib = useMemo(() => EXTRA_POOL.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);

  const T = { 
    bg: '#0A0F1E', 
    surface: '#1E293B', // Brighter surface for better contrast
    card: '#334155', 
    accent: accent, 
    text: '#F8FAFC', 
    subtext: '#CBD5E1', // Higher contrast subtext
    border: 'rgba(255,255,255,0.15)' 
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif', fontSize: `${fontSize}px`, maxWidth: '500px', margin: '0 auto' }}>
      
      {/* NAVBAR */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '1.4em', fontWeight: '900', letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px' }}><Play size={20}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px' }}><BarChart2 size={20}/></button>
            <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '10px' }}><Calculator size={20}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px' }}><Settings size={20}/></button>
          </div>
        </div>
      )}

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '25px', borderRadius: '24px', textAlign: 'left', color: '#FFF' }}>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '1.2em' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '0.8em', marginTop: '4px', fontWeight: '500' }}>START PROTOCOL</div>
            </button>
          ))}
          <button onClick={() => setView('log')} style={{ background: T.card, border: 'none', padding: '15px', borderRadius: '15px', color: '#FFF', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><History size={16}/> VIEW HISTORY</button>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          <div style={{ fontSize: '0.9em', fontWeight: '900', color: T.accent, textAlign: 'center' }}>{activeSession.name}</div>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: '900', fontSize: '1.1em', color: '#FFF' }}>{ex.name}</span>
                <button onClick={() => removeExercise(ex.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '6px', borderRadius: '8px' }}><X size={18}/></button>
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px', border: `1px solid ${T.border}` }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: '900', color: '#FFF' }}>{sessionData[`${ex.id}-s${i}-w`] || 0}kg</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Plus size={14}/></button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px', border: `1px solid ${T.border}` }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', color: T.accent, fontWeight: '900' }}>{sessionData[`${ex.id}-s${i}-r`] || 0}</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', position: 'fixed', bottom: '25px', left: '20px', right: '20px', maxWidth: '460px', margin: '0 auto' }}>
            <button onClick={() => setView('library')} style={{ background: T.surface, border: `2px solid ${T.accent}`, padding: '18px', borderRadius: '18px', color: T.accent, fontWeight: '900', fontSize: '1.1em' }}>+ EXTRA</button>
            <button onClick={finishSession} style={{ background: T.accent, border: 'none', padding: '18px', borderRadius: '18px', color: '#000', fontWeight: '950', fontSize: '1.1em', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>FINISH</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY (HIGH VISIBILITY FIX) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setView('train')} style={{ background: T.surface, border: 'none', padding: '10px', borderRadius: '12px', color: T.text }}><ChevronLeft size={24}/></button>
            <h2 style={{ fontSize: '1.3em', fontWeight: '900', color: '#FFF' }}>Exercise Library</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '18px', color: T.accent }} />
            <input 
              type="text" 
              placeholder="Filter by name or muscle..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              style={{ width: '100%', background: T.surface, border: `2px solid ${T.border}`, padding: '15px 15px 15px 45px', borderRadius: '15px', color: '#FFF', fontSize: '1em', outline: 'none' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredLib.map(ex => (
              <button 
                key={ex.id} 
                onClick={() => addExtra(ex)} 
                style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '20px', borderRadius: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <div>
                  <div style={{ fontWeight: '900', fontSize: '1.1em', color: '#FFF', marginBottom: '4px' }}>{ex.name}</div>
                  <div style={{ fontSize: '0.7em', color: T.accent, fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{ex.muscle}</div>
                </div>
                <div style={{ background: T.card, padding: '10px', borderRadius: '12px', color: T.accent }}><Plus size={20}/></div>
              </button>
            ))}
            {filteredLib.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: T.subtext }}>No activities found.</div>}
          </div>
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '25px', borderRadius: '24px', textAlign: 'center', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: '0.75em', color: T.subtext, fontWeight: '700', letterSpacing: '1px' }}>LIFETIME VOLUME</div>
            <div style={{ fontSize: '2.8em', fontWeight: '950', color: T.accent }}>{totalVol.toLocaleString()} <span style={{fontSize: '0.4em'}}>KG</span></div>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Target size={20} color={T.accent}/> <span style={{fontWeight: '900', fontSize: '1.1em'}}>GOAL TRACKER</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', marginBottom: '10px' }}><span style={{fontWeight: '700'}}>{goal.exercise}</span><span style={{color: T.accent, fontWeight: '900'}}>{goal.target}kg</span></div>
            <div style={{ height: '12px', background: '#0F172A', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '45%', background: T.accent, boxShadow: `0 0 10px ${T.accent}` }} />
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <div style={{ fontWeight: '900', fontSize: '1.1em', marginBottom: '15px' }}>Visual Theme</div>
            <div style={{ display: 'flex', gap: '15px' }}>
              {Object.values(THEMES).map(t => (
                <button key={t.accent} onClick={() => setAccent(t.accent)} style={{ width: '50px', height: '50px', borderRadius: '15px', background: t.accent, border: accent === t.accent ? '4px solid #FFF' : 'none', cursor: 'pointer' }} />
              ))}
            </div>
            <div style={{ fontWeight: '900', marginTop: '30px', marginBottom: '10px' }}>Font Size: {fontSize}px</div>
            <input type="range" min="14" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: T.accent, height: '8px', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '25px', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.4)' }}>
          <span style={{ fontWeight: '950', fontSize: '2.5em' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', letterSpacing: '1px' }}>RESTING</div>
        </div>
      )}

      {useEffect(() => {
        let t; if (timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
