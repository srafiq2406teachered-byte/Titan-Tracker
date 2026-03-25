import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, 
  BarChart2, Calculator, Save, ChevronLeft, Search, CheckCircle2
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG & THEMES ---
  const THEMES = {
    EMERALD: { accent: '#10B981', bg: '#064E3B22' },
    SAPPHIRE: { accent: '#3B82F6', bg: '#1E3A8A22' },
    CRIMSON: { accent: '#EF4444', bg: '#7F1D1D22' }
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
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" }, { id: "E4", name: "Face Pulls", muscle: "Back" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);

  // Appearance State
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(14);
  const [searchQuery, setSearchQuery] = useState('');

  // Bio State
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v62_master');
    if (saved) {
      const d = JSON.parse(saved);
      setHistory(d.history || []);
      setAccent(d.accent || '#10B981');
      setFontSize(d.fontSize || 14);
      setBio(d.bio || { weight: 80, height: 180, age: 30, sex: 'm' });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v62_master', JSON.stringify({ history, accent, fontSize, bio }));
  }, [history, accent, fontSize, bio]);

  // --- 4. CALCULATIONS ---
  const bmi = useMemo(() => {
    const hM = bio.height / 100;
    return (bio.weight / (hM * hM)).toFixed(1);
  }, [bio]);

  const bmr = useMemo(() => {
    if (bio.sex === 'm') return Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5);
    return Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age - 161);
  }, [bio]);

  const totalVolume = useMemo(() => {
    return history.reduce((acc, h) => acc + (h.volume || 0), 0);
  }, [history]);

  // --- 5. LOGIC ---
  const startWorkout = (id) => {
    const p = WORKOUTS[id];
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id));
    const init = {};
    list.forEach(ex => { for(let s=0; s<3; s++) { init[`${ex.id}-s${s}-r`] = 10; init[`${ex.id}-s${s}-w`] = 0; } });
    setSessionData(init); setActiveSession({ ...p, list }); setView('train');
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

    setHistory([{
      id: activeSession.id, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      name: activeSession.name, color: activeSession.color, details, volume: vol
    }, ...history]);
    setActiveSession(null); setView('log');
  };

  const T = {
    bg: '#0A0F1E', surface: '#161E31', card: '#232D45', accent: accent,
    text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.1)'
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif', fontSize: `${fontSize}px`, maxWidth: '500px', margin: '0 auto' }}>
      
      {/* NAVBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '1.5em', fontWeight: '900' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
        <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px', gap: '4px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', padding: '8px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px' }}><Play size={18}/></button>
          <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '8px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '8px' }}><BarChart2 size={18}/></button>
          <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '8px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '8px' }}><Calculator size={18}/></button>
          <button onClick={() => setView('settings')} style={{ border: 'none', padding: '8px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '8px' }}><Settings size={18}/></button>
        </div>
      </div>

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '25px', borderRadius: '24px', textAlign: 'left', color: '#FFF' }}>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '1.2em' }}>{w.name}</div>
              <div style={{ color: T.subtext, fontSize: '0.8em', marginTop: '4px' }}>START PROTOCOL</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ color: T.subtext, fontSize: '0.7em', fontWeight: '900' }}>TOTAL VOLUME LIFTED</div>
            <div style={{ fontSize: '2.5em', fontWeight: '900', color: T.accent }}>{totalVolume.toLocaleString()}<span style={{fontSize: '0.4em'}}>KG</span></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: T.surface, padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '0.7em', color: T.subtext }}>SESSIONS</div>
              <div style={{ fontSize: '1.5em', fontWeight: '900' }}>{history.length}</div>
            </div>
            <div style={{ background: T.surface, padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '0.7em', color: T.subtext }}>AVG VOLUME</div>
              <div style={{ fontSize: '1.5em', fontWeight: '900' }}>{history.length ? Math.round(totalVolume/history.length) : 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: BIOMETRICS (MAN/WOMAN DATA) */}
      {view === 'biometrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
             <h3 style={{ margin: '0 0 15px 0', fontSize: '1em' }}>Biometrics Lab</h3>
             <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
               <button onClick={() => setBio({...bio, sex: 'm'})} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: bio.sex === 'm' ? T.accent : T.card, color: bio.sex === 'm' ? '#000' : '#FFF' }}>Male</button>
               <button onClick={() => setBio({...bio, sex: 'f'})} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: bio.sex === 'f' ? T.accent : T.card, color: bio.sex === 'f' ? '#000' : '#FFF' }}>Female</button>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Weight (kg)</span><input type="number" value={bio.weight} onChange={e => setBio({...bio, weight: e.target.value})} style={{ width: '60px', background: '#000', border: 'none', color: T.accent, textAlign: 'right' }} /></div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Height (cm)</span><input type="number" value={bio.height} onChange={e => setBio({...bio, height: e.target.value})} style={{ width: '60px', background: '#000', border: 'none', color: T.accent, textAlign: 'right' }} /></div>
               <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Age</span><input type="number" value={bio.age} onChange={e => setBio({...bio, age: e.target.value})} style={{ width: '60px', background: '#000', border: 'none', color: T.accent, textAlign: 'right' }} /></div>
             </div>
          </div>
          <div style={{ background: T.accent, color: '#000', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: '0.7em', fontWeight: '900' }}>BMI</div><div style={{ fontSize: '1.5em', fontWeight: '900' }}>{bmi}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: '0.7em', fontWeight: '900' }}>EST. BMR</div><div style={{ fontSize: '1.5em', fontWeight: '900' }}>{bmr} kcal</div></div>
          </div>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
            <div style={{ marginBottom: '15px', fontWeight: '900' }}>Appearance</div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {Object.entries(THEMES).map(([name, colors]) => (
                <button key={name} onClick={() => setAccent(colors.accent)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: accent === colors.accent ? '3px solid #FFF' : 'none', background: colors.accent }} />
              ))}
            </div>
            <div style={{ fontWeight: '900', marginBottom: '10px' }}>Font Size: {fontSize}px</div>
            <input type="range" min="12" max="22" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: T.accent }} />
          </div>
          <button onClick={() => setView('log')} style={{ background: T.card, color: '#FFF', border: 'none', padding: '15px', borderRadius: '15px' }}>View History</button>
        </div>
      )}

      {/* VIEW: TRAIN (Shared Precision Engine) */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '140px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ fontWeight: '900', fontSize: '1.1em', marginBottom: '12px' }}>{ex.name}</div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#000', borderRadius: '10px' }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, -1)} style={{ padding: '10px', color: T.subtext, background: 'none', border: 'none' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center' }}>{sessionData[`${ex.id}-s${i}-w`] || 0}kg</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, 1)} style={{ padding: '10px', color: T.subtext, background: 'none', border: 'none' }}><Plus size={14}/></button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#000', borderRadius: '10px' }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, -1)} style={{ padding: '10px', color: T.subtext, background: 'none', border: 'none' }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', color: T.accent }}>{sessionData[`${ex.id}-s${i}-r`] || 0}</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, 1)} style={{ padding: '10px', color: T.subtext, background: 'none', border: 'none' }}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button onClick={finishSession} style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', background: T.accent, padding: '20px', borderRadius: '18px', fontWeight: '950', color: '#000', border: 'none', maxWidth: '460px', margin: '0 auto' }}>FINISH & LOG</button>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '20px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, maxWidth: '460px', margin: '0 auto' }}>
          <span style={{ fontWeight: '950', fontSize: '2em' }}>{timeLeft}s</span>
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
