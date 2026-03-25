import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, CheckCircle2, Target, Zap
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG ---
  const THEMES = {
    EMERALD: { accent: '#10B981' },
    SAPPHIRE: { accent: '#3B82F6' },
    CRIMSON: { accent: '#EF4444' }
  };

  const WORKOUTS = {
    SHRED: { id: 'SHRED', name: "SHRED PROTOCOL", rest: 45, ids: ["A1", "A2", "B1"], color: '#10B981' },
    POWER: { id: 'POWER', name: "POWER PROTOCOL", rest: 90, ids: ["A1", "A2", "B1", "B2"], color: '#3B82F6' }
  };

  const EXERCISES = [
    { id: "A1", name: "Leg Press", muscle: "Legs" }, { id: "A2", name: "Lat Pulldown", muscle: "Back" },
    { id: "B1", name: "Chest Press", muscle: "Chest" }, { id: "B2", name: "Leg Curl", muscle: "Legs" }
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

  // Personalization
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });
  const [orm, setOrm] = useState({ weight: 60, reps: 10 });

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v67_fix');
    if (saved) {
      const d = JSON.parse(saved);
      setHistory(d.history || []); setAccent(d.accent || '#10B981');
      setFontSize(d.fontSize || 16); setBio(d.bio || { weight: 80, height: 180, age: 30, sex: 'm' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v67_fix', JSON.stringify({ history, accent, fontSize, bio }));
  }, [history, accent, fontSize, bio]);

  // --- 4. CALCULATIONS ---
  const bmi = useMemo(() => (bio.weight / ((bio.height / 100) ** 2)).toFixed(1), [bio]);
  const bmr = useMemo(() => bio.sex === 'm' 
    ? Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5) 
    : Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age - 161), [bio]);

  const calculatedOrm = useMemo(() => {
    if (orm.reps <= 0) return 0;
    if (orm.reps === 1) return orm.weight;
    return Math.round(orm.weight * (1 + orm.reps / 30));
  }, [orm]);

  const totalVol = useMemo(() => history.reduce((acc, h) => acc + (h.volume || 0), 0), [history]);
  const filteredLib = useMemo(() => EXTRA_POOL.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery]);

  // --- 5. ENGINES ---
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
    setHistory([{ id: activeSession.id, date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, volume: vol }, ...history]);
    setActiveSession(null); setView('log');
  };

  const T = { 
    bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent: accent, 
    text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.15)' 
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif', fontSize: `${fontSize}px`, maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* NAVBAR - Ensure high z-index */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', position: 'relative', zIndex: 50 }}>
          <h1 style={{ fontSize: '1.4em', fontWeight: '900' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px', cursor: 'pointer' }}><Play size={20}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px', cursor: 'pointer' }}><BarChart2 size={20}/></button>
            <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '10px', cursor: 'pointer' }}><Calculator size={20}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px', cursor: 'pointer' }}><Settings size={20}/></button>
          </div>
        </div>
      )}

      {/* VIEW: MENU - Added higher z-index and explicit cursor */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', zIndex: 40 }}>
          {Object.values(WORKOUTS).map(w => (
            <button 
              key={w.id} 
              onClick={() => startWorkout(w.id)} 
              style={{ 
                background: T.surface, 
                padding: '25px', 
                borderRadius: '24px', 
                border: `1px solid ${T.border}`, 
                textAlign: 'left',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ color: w.color, fontWeight: '900', fontSize: '1.2em' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '0.8em', marginTop: '5px' }}>TAP TO START</div>
            </button>
          ))}
          <button onClick={() => setView('log')} style={{ background: T.card, border: 'none', padding: '15px', borderRadius: '15px', color: '#FFF', fontWeight: '600', cursor: 'pointer' }}>VIEW RECENT LOGS</button>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: '900', marginBottom: '12px', color: '#FFF' }}>{ex.name}</div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900', cursor: 'pointer' }}>{i + 1}</button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px' }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: '900' }}>{sessionData[`${ex.id}-s${i}-w`] || 0}kg</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={14}/></button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px' }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', color: T.accent, fontWeight: '900' }}>{sessionData[`${ex.id}-s${i}-r`] || 0}</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', maxWidth: '460px', margin: '0 auto', zIndex: 100 }}>
            <button onClick={() => setView('library')} style={{ background: T.surface, border: `2px solid ${T.accent}`, padding: '18px', borderRadius: '18px', color: T.accent, fontWeight: '900', cursor: 'pointer' }}>+ EXTRA</button>
            <button onClick={finishSession} style={{ background: T.accent, border: 'none', padding: '18px', borderRadius: '18px', color: '#000', fontWeight: '950', cursor: 'pointer' }}>FINISH LOG</button>
          </div>
        </div>
      )}

      {/* VIEW: BIOMETRICS & 1RM */}
      {view === 'biometrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <h2 style={{ fontSize: '1.2em', fontWeight: '900', marginBottom: '15px' }}>Physical Stats</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button onClick={() => setBio({...bio, sex: 'm'})} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: bio.sex === 'm' ? T.accent : T.card, color: bio.sex === 'm' ? '#000' : '#FFF', fontWeight: '800' }}>MALE</button>
              <button onClick={() => setBio({...bio, sex: 'f'})} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: bio.sex === 'f' ? T.accent : T.card, color: bio.sex === 'f' ? '#000' : '#FFF', fontWeight: '800' }}>FEMALE</button>
            </div>
            {['weight', 'height', 'age'].map(k => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{textTransform: 'capitalize'}}>{k}</span>
                <input type="number" value={bio[k]} onChange={e => setBio({...bio, [k]: e.target.value})} style={{ width: '70px', background: '#0F172A', border: 'none', color: T.accent, textAlign: 'center', borderRadius: '8px' }} />
              </div>
            ))}
          </div>
          <div style={{ background: T.accent, color: '#000', padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{fontSize: '0.7em', fontWeight: '900'}}>BMI</div><div style={{fontSize: '1.8em', fontWeight: '950'}}>{bmi}</div></div>
            <div style={{textAlign: 'right'}}><div style={{fontSize: '0.7em', fontWeight: '900'}}>BMR</div><div style={{fontSize: '1.8em', fontWeight: '950'}}>{bmr}</div></div>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => setView('train')}>
            <ChevronLeft size={24} color={T.accent}/> <span style={{fontWeight: '900'}}>BACK TO TRAINING</span>
          </div>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={20} style={{ position: 'absolute', left: '15px', top: '15px', color: T.accent }} />
            <input type="text" placeholder="Search Exercise..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', background: T.surface, border: `2px solid ${T.accent}44`, padding: '15px 15px 15px 45px', borderRadius: '15px', color: '#FFF', fontSize: '1em', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          {filteredLib.map(ex => (
            <button key={ex.id} onClick={() => addExtra(ex)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '20px', borderRadius: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
              <div><div style={{ fontWeight: '900', color: '#FFF' }}>{ex.name}</div><div style={{ color: T.accent, fontSize: '0.7em', fontWeight: '800', textTransform: 'uppercase' }}>{ex.muscle}</div></div>
              <Plus size={24} color={T.accent}/>
            </button>
          ))}
        </div>
      )}

      {/* TIMER HUD - Only render if timeLeft > 0 to prevent overlay issues */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,15,30,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <div style={{ background: T.accent, color: '#000', padding: '40px', borderRadius: '40px', textAlign: 'center', boxShadow: `0 0 50px ${T.accent}44` }}>
            <div style={{ fontWeight: '950', fontSize: '4em', lineHeight: '1' }}>{timeLeft}s</div>
            <div style={{ fontWeight: '900', marginTop: '10px', letterSpacing: '2px' }}>RESTING</div>
            <div style={{ fontSize: '0.6em', marginTop: '20px', opacity: 0.7 }}>TAP TO SKIP</div>
          </div>
        </div>
      )}

      {/* Logic for Timer */}
      {useEffect(() => {
        let t; if (timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
