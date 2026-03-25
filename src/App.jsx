import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, Trash2, Zap
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIG & RECOVERY ---
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
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, sex: 'm' });
  const [orm, setOrm] = useState({ weight: 60, reps: 10 });

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v70_full');
    if (saved) {
      const d = JSON.parse(saved);
      if (d.history) setHistory(d.history);
      if (d.accent) setAccent(d.accent);
      if (d.fontSize) setFontSize(d.fontSize);
      if (d.bio) setBio(d.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v70_full', JSON.stringify({ history, accent, fontSize, bio }));
  }, [history, accent, fontSize, bio]);

  // --- 4. CALCULATIONS ---
  const bmi = useMemo(() => (bio.weight / ((bio.height / 100) ** 2)).toFixed(1), [bio]);
  const bmr = useMemo(() => bio.sex === 'm' 
    ? Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5) 
    : Math.round(10 * bio.weight + 6.25 * bio.height - 5 * bio.age - 161), [bio]);
  const calculatedOrm = useMemo(() => Math.round(orm.weight * (1 + orm.reps / 30)), [orm]);
  const totalVol = useMemo(() => history.reduce((acc, h) => acc + (h.volume || 0), 0), [history]);
  const filteredLib = useMemo(() => EXTRA_POOL.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery]);

  // --- 5. LOGIC ---
  const startWorkout = (id) => {
    const p = WORKOUTS[id];
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id)).map(e => ({...e, instanceId: `${e.id}-${Date.now()}`}));
    const init = {};
    list.forEach(ex => { for(let s=0; s<3; s++) { init[`${ex.instanceId}-s${s}-r`] = 10; init[`${ex.instanceId}-s${s}-w`] = 0; } });
    setSessionData(init); setActiveSession({ ...p, list }); setView('train');
  };

  const addExtra = (ex) => {
    const instanceId = `${ex.id}-${Date.now()}`;
    setActiveSession(prev => ({ ...prev, list: [...prev.list, { ...ex, instanceId }] }));
    const extraData = {};
    for(let s=0; s<3; s++) { extraData[`${instanceId}-s${s}-r`] = 10; extraData[`${instanceId}-s${s}-w`] = 0; }
    setSessionData(prev => ({ ...prev, ...extraData }));
    setSearchQuery(''); setView('train');
  };

  const removeExercise = (instanceId) => {
    setActiveSession(prev => ({ ...prev, list: prev.list.filter(item => item.instanceId !== instanceId) }));
  };

  const finishSession = () => {
    const vol = activeSession.list.reduce((acc, ex) => {
      let exVol = 0;
      for (let i = 0; i < 3; i++) {
        exVol += (parseFloat(sessionData[`${ex.instanceId}-s${i}-w`]) || 0) * (parseFloat(sessionData[`${ex.instanceId}-s${i}-r`]) || 0);
      }
      return acc + exVol;
    }, 0);
    setHistory([{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, volume: vol }, ...history]);
    setActiveSession(null); setView('metrics');
  };

  const T = { bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent, text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.1)' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontSize: `${fontSize}px`, fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* PERSISTENT NAV */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontWeight: '900', fontSize: '1.2em' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px' }}><Play size={18}/></button>
            <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '10px' }}><Calculator size={18}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px' }}><BarChart2 size={18}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px' }}><Settings size={18}/></button>
          </div>
        </div>
      )}

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}`, textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '1.2em' }}>{w.name}</div>
              <div style={{ fontSize: '0.7em', color: T.subtext, marginTop: '4px' }}>START PROTOCOL</div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: BIOMETRICS LAB (BMI/BMR/1RM) */}
      {view === 'biometrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
            {['weight', 'height', 'age'].map(k => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <span style={{textTransform: 'capitalize'}}>{k}</span>
                <input type="number" value={bio[k]} onChange={e => setBio({...bio, [k]: e.target.value})} style={{ width: '80px', background: T.bg, border: 'none', color: T.accent, textAlign: 'center', padding: '8px', borderRadius: '8px', fontWeight: '900' }} />
              </div>
            ))}
          </div>
          <div style={{ background: T.accent, color: '#000', padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div><div style={{fontSize: '0.7em', fontWeight: '900'}}>BMI</div><div style={{fontSize: '1.8em', fontWeight: '950'}}>{bmi}</div></div>
            <div style={{textAlign: 'right'}}><div style={{fontSize: '0.7em', fontWeight: '900'}}>BMR</div><div style={{fontSize: '1.8em', fontWeight: '950'}}>{bmr}</div></div>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
            <div style={{fontWeight: '900', fontSize: '0.8em', marginBottom: '10px'}}><Zap size={14} inline/> 1-REP MAX</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <input type="number" value={orm.weight} onChange={e => setOrm({...orm, weight: e.target.value})} style={{background: T.bg, border: 'none', color: '#FFF', padding: '10px', borderRadius: '8px'}} />
              <input type="number" value={orm.reps} onChange={e => setOrm({...orm, reps: e.target.value})} style={{background: T.bg, border: 'none', color: '#FFF', padding: '10px', borderRadius: '8px'}} />
            </div>
            <div style={{textAlign: 'center', marginTop: '15px', fontSize: '1.5em', fontWeight: '900', color: T.accent}}>{calculatedOrm}kg</div>
          </div>
        </div>
      )}

      {/* VIEW: METRICS (RESTORED) */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surface, padding: '30px', borderRadius: '24px', textAlign: 'center', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: '0.75em', color: T.subtext, fontWeight: '800' }}>TOTAL LIFETIME VOLUME</div>
            <div style={{ fontSize: '2.5em', fontWeight: '950', color: T.accent }}>{totalVol.toLocaleString()} <span style={{fontSize: '0.4em'}}>KG</span></div>
          </div>
          <h3 style={{fontWeight: '900', marginTop: '10px'}}>RECENT HISTORY</h3>
          {history.length === 0 ? <div style={{opacity: 0.5}}>No logs found...</div> : history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{fontWeight: '900'}}>{h.name}</div><div style={{fontSize: '0.7em', opacity: 0.6}}>{h.date}</div></div>
              <div style={{fontWeight: '900', color: T.accent}}>{h.volume}kg</div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: SETTINGS (RESTORED) */}
      {view === 'settings' && (
        <div style={{ background: T.surface, padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontWeight: '900', marginBottom: '10px' }}>App Theme</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {Object.entries(THEMES).map(([k, v]) => (
                <div key={k} onClick={() => setAccent(v.accent)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: v.accent, border: accent === v.accent ? '3px solid #FFF' : 'none' }} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: '900', marginBottom: '10px' }}>Text Size: {fontSize}px</div>
            <input type="range" min="14" max="22" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} style={{ width: '100%', accentColor: T.accent }} />
          </div>
          <button onClick={() => { if(confirm("Clear all data?")) { localStorage.clear(); window.location.reload(); }}} style={{ background: '#EF444433', color: '#EF4444', border: 'none', padding: '15px', borderRadius: '12px', fontWeight: '900' }}>RESET ALL DATA</button>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          {activeSession.list.map((ex) => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: '900' }}>{ex.name}</span>
                <button onClick={() => removeExercise(ex.instanceId)} style={{ background: 'none', border: 'none', color: '#EF4444' }}><Trash2 size={16}/></button>
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '40px', background: T.card, border: 'none', borderRadius: '8px', color: T.accent, fontWeight: '900' }}>{i+1}</button>
                  <input type="number" placeholder="kg" onChange={e => setSessionData({...sessionData, [`${ex.instanceId}-s${i}-w`]: e.target.value})} style={{ flex: 1, background: T.bg, border: 'none', padding: '10px', borderRadius: '8px', color: '#FFF', textAlign: 'center' }} />
                  <input type="number" placeholder="reps" onChange={e => setSessionData({...sessionData, [`${ex.instanceId}-s${i}-r`]: e.target.value})} style={{ flex: 1, background: T.bg, border: 'none', padding: '10px', borderRadius: '8px', color: T.accent, textAlign: 'center' }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '460px', margin: '0 auto' }}>
            <button onClick={() => setView('library')} style={{ background: T.surface, border: `1px solid ${T.accent}`, padding: '15px', borderRadius: '15px', color: T.accent, fontWeight: '900' }}>+ EXTRA</button>
            <button onClick={finishSession} style={{ background: T.accent, border: 'none', padding: '15px', borderRadius: '15px', color: '#000', fontWeight: '950' }}>FINISH</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button onClick={() => setView('train')} style={{ background: 'none', border: 'none', color: T.accent, textAlign: 'left', fontWeight: '900' }}><ChevronLeft size={20} inline/> BACK</button>
          <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '15px', background: T.surface, border: `1px solid ${T.accent}44`, color: '#FFF', boxSizing: 'border-box' }} />
          {filteredLib.map(ex => (
            <button key={ex.id} onClick={() => addExtra(ex)} style={{ background: T.surface, padding: '20px', borderRadius: '20px', border: 'none', color: '#FFF', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
              <span>{ex.name}</span> <Plus size={20} color={T.accent}/>
            </button>
          ))}
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.accent, color: '#000', padding: '50px', borderRadius: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '4em', fontWeight: '950' }}>{timeLeft}s</div>
            <div style={{ fontWeight: '900' }}>RESTING</div>
          </div>
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
