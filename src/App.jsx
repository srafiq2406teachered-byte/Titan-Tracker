import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, CheckCircle2, Target
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG & THEMES ---
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

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v65_final');
    if (saved) {
      const d = JSON.parse(saved);
      setHistory(d.history || []); setAccent(d.accent || '#10B981');
      setFontSize(d.fontSize || 16); setBio(d.bio || { weight: 80, height: 180, age: 30, sex: 'm' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v65_final', JSON.stringify({ history, accent, fontSize, bio }));
  }, [history, accent, fontSize, bio]);

  // --- 4. CALCULATIONS ---
  const bmi = useMemo(() => (bio.weight / ((bio.height / 100) ** 2)).toFixed(1), [bio]);
  const bmr = useMemo(() => bio.sex === 'm' 
    ? Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5) 
    : Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age - 161), [bio]);

  const totalVol = useMemo(() => history.reduce((acc, h) => acc + (h.volume || 0), 0), [history]);
  const filteredLib = useMemo(() => EXTRA_POOL.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery]);

  // --- 5. WORKOUT ENGINE ---
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
    setHistory([{ id: activeSession.id, date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, color: activeSession.color, volume: vol }, ...history]);
    setActiveSession(null); setView('log');
  };

  const T = { 
    bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent: accent, 
    text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.15)' 
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif', fontSize: `${fontSize}px`, maxWidth: '500px', margin: '0 auto' }}>
      
      {/* NAVBAR */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '1.4em', fontWeight: '900' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px' }}><Play size={20}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px' }}><BarChart2 size={20}/></button>
            <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '10px' }}><Calculator size={20}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px' }}><Settings size={20}/></button>
          </div>
        </div>
      )}

      {/* VIEW: BIOMETRICS (THE DISAPPEARED PAGE) */}
      {view === 'biometrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <h2 style={{ fontSize: '1.2em', fontWeight: '900', marginBottom: '15px' }}>Biometrics Lab</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setBio({...bio, sex: 'm'})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: bio.sex === 'm' ? T.accent : T.card, color: bio.sex === 'm' ? '#000' : '#FFF', fontWeight: '800' }}>Male</button>
              <button onClick={() => setBio({...bio, sex: 'f'})} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: bio.sex === 'f' ? T.accent : T.card, color: bio.sex === 'f' ? '#000' : '#FFF', fontWeight: '800' }}>Female</button>
            </div>
            {['weight', 'height', 'age'].map(k => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{k}</span>
                <input type="number" value={bio[k]} onChange={e => setBio({...bio, [k]: e.target.value})} style={{ width: '80px', background: '#0F172A', border: `1px solid ${T.border}`, color: T.accent, textAlign: 'center', padding: '8px', borderRadius: '8px', fontWeight: '900' }} />
              </div>
            ))}
          </div>
          <div style={{ background: T.accent, color: '#000', padding: '25px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', boxShadow: `0 10px 20px ${T.accent}33` }}>
            <div><div style={{ fontSize: '0.7em', fontWeight: '900' }}>BMI</div><div style={{ fontSize: '1.8em', fontWeight: '950' }}>{bmi}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.7em', fontWeight: '900' }}>DAILY BMR</div><div style={{ fontSize: '1.8em', fontWeight: '950' }}>{bmr} <span style={{fontSize: '0.5em'}}>KCAL</span></div></div>
          </div>
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
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px' }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: '900' }}>{sessionData[`${ex.id}-s${i}-w`] || 0}kg</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Plus size={14}/></button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px' }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', color: T.accent, fontWeight: '900' }}>{sessionData[`${ex.id}-s${i}-r`] || 0}</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', maxWidth: '460px', margin: '0 auto' }}>
            <button onClick={() => setView('library')} style={{ background: T.surface, border: `2px solid ${T.accent}`, padding: '18px', borderRadius: '18px', color: T.accent, fontWeight: '900' }}>+ EXTRA</button>
            <button onClick={finishSession} style={{ background: T.accent, border: 'none', padding: '18px', borderRadius: '18px', color: '#000', fontWeight: '950' }}>FINISH LOG</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY (RE-FIXED) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={() => setView('train')}>
            <ChevronLeft size={24} color={T.accent}/> <span style={{fontWeight: '900'}}>Back to Session</span>
          </div>
          <input type="text" placeholder="Search Exercises..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', background: T.surface, border: `2px solid ${T.border}`, padding: '15px', borderRadius: '15px', color: '#FFF' }} />
          {filteredLib.map(ex => (
            <button key={ex.id} onClick={() => addExtra(ex)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '20px', borderRadius: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '900', color: '#FFF', fontSize: '1.1em' }}>{ex.name}</div>
                <div style={{ color: T.accent, fontSize: '0.7em', fontWeight: '800', textTransform: 'uppercase' }}>{ex.muscle}</div>
              </div>
              <Plus size={24} color={T.accent}/>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: MENU & LOGS */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}`, textAlign: 'left' }}>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '1.2em' }}>{w.name}</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '30px', borderRadius: '24px', textAlign: 'center', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: '0.75em', color: T.subtext, fontWeight: '800' }}>TOTAL VOLUME</div>
            <div style={{ fontSize: '3em', fontWeight: '950', color: T.accent }}>{totalVol.toLocaleString()} <span style={{fontSize: '0.4em'}}>KG</span></div>
          </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ background: T.surface, padding: '25px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: '900', marginBottom: '15px' }}>App Accent</div>
            <div style={{ display: 'flex', gap: '15px' }}>
              {Object.entries(THEMES).map(([k, v]) => (
                <div key={k} onClick={() => setAccent(v.accent)} style={{ width: '45px', height: '45px', borderRadius: '50%', background: v.accent, border: accent === v.accent ? '4px solid #FFF' : 'none' }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '900', marginBottom: '10px' }}>Text Size: {fontSize}px</div>
            <input type="range" min="14" max="22" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: T.accent }} />
          </div>
        </div>
      )}

      {/* REST TIMER */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '25px', borderRadius: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2000 }}>
          <span style={{ fontWeight: '950', fontSize: '2.5em' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900' }}>RESTING</div>
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
