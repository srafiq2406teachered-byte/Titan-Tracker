import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Settings, BarChart2, 
  Calculator, ChevronLeft, Search, Trash2
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
  const [accent, setAccent] = useState('#10B981');
  const [fontSize, setFontSize] = useState(16);

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v68_purge');
    if (saved) {
      const d = JSON.parse(saved);
      setHistory(d.history || []); setAccent(d.accent || '#10B981');
      setFontSize(d.fontSize || 16);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v68_purge', JSON.stringify({ history, accent, fontSize }));
  }, [history, accent, fontSize]);

  // --- 4. ENGINE ---
  const startWorkout = (id) => {
    const p = WORKOUTS[id];
    const list = EXERCISES.filter(ex => p.ids.includes(ex.id));
    const init = {};
    list.forEach(ex => { for(let s=0; s<3; s++) { init[`${ex.id}-s${s}-r`] = 10; init[`${ex.id}-s${s}-w`] = 0; } });
    setSessionData(init); setActiveSession({ ...p, list }); setView('train');
  };

  const addExtra = (ex) => {
    // Generate a unique instance ID so we can add the same exercise multiple times if needed
    const instanceId = `${ex.id}-${Date.now()}`;
    const newEx = { ...ex, instanceId };
    setActiveSession(prev => ({ ...prev, list: [...prev.list, newEx] }));
    const extraData = {};
    for(let s=0; s<3; s++) { extraData[`${instanceId}-s${s}-r`] = 10; extraData[`${instanceId}-s${s}-w`] = 0; }
    setSessionData(prev => ({ ...prev, ...extraData }));
    setSearchQuery(''); setView('train');
  };

  // NEW: REMOVE FUNCTION
  const removeExercise = (instanceId) => {
    setActiveSession(prev => ({
      ...prev,
      list: prev.list.filter(item => (item.instanceId || item.id) !== instanceId)
    }));
  };

  const updateVal = (key, delta) => setSessionData(p => ({ ...p, [key]: Math.max(0, (parseFloat(p[key]) || 0) + delta) }));

  const finishSession = () => {
    const details = activeSession.list.map(ex => {
      const id = ex.instanceId || ex.id;
      const sets = [];
      for (let i = 0; i < 3; i++) {
        const w = parseFloat(sessionData[`${id}-s${i}-w`]);
        const r = parseFloat(sessionData[`${id}-s${i}-r`]);
        if (w > 0 || r > 0) sets.push({ w, r });
      }
      return { name: ex.name, sets };
    }).filter(d => d.sets.length > 0);

    const vol = details.reduce((acc, ex) => acc + ex.sets.reduce((sA, s) => sA + (s.w * s.r), 0), 0);
    setHistory([{ date: new Date().toLocaleDateString('en-GB'), name: activeSession.name, volume: vol }, ...history]);
    setActiveSession(null); setView('menu');
  };

  const T = { 
    bg: '#0A0F1E', surface: '#1E293B', card: '#334155', accent: accent, 
    text: '#F8FAFC', subtext: '#CBD5E1', border: 'rgba(255,255,255,0.15)' 
  };

  const filteredLib = useMemo(() => EXTRA_POOL.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.muscle.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery]);

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif', fontSize: `${fontSize}px`, maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* NAVBAR */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '1.4em', fontWeight: '900' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '14px', gap: '4px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '10px' }}><Play size={20}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '10px' }}><BarChart2 size={20}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '10px' }}><Settings size={20}/></button>
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          {activeSession.list.map((ex) => {
            const id = ex.instanceId || ex.id;
            return (
              <div key={id} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}`, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '900', color: '#FFF' }}>{ex.name}</div>
                  <button 
                    onClick={() => removeExercise(id)} 
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', padding: '5px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px' }}>
                      <button onClick={() => updateVal(`${id}-s${i}-w`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Minus size={14}/></button>
                      <div style={{ flex: 1, textAlign: 'center', fontWeight: '900' }}>{sessionData[`${id}-s${i}-w`] || 0}kg</div>
                      <button onClick={() => updateVal(`${id}-s${i}-w`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Plus size={14}/></button>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#0F172A', borderRadius: '10px' }}>
                      <button onClick={() => updateVal(`${id}-s${i}-r`, -1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Minus size={14}/></button>
                      <div style={{ flex: 1, textAlign: 'center', color: T.accent, fontWeight: '900' }}>{sessionData[`${id}-s${i}-r`] || 0}</div>
                      <button onClick={() => updateVal(`${id}-s${i}-r`, 1)} style={{ padding: '10px', color: T.accent, background: 'none', border: 'none' }}><Plus size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px', maxWidth: '460px', margin: '0 auto' }}>
            <button onClick={() => setView('library')} style={{ background: T.surface, border: `2px solid ${T.accent}`, padding: '18px', borderRadius: '18px', color: T.accent, fontWeight: '900' }}>+ EXTRA</button>
            <button onClick={finishSession} style={{ background: T.accent, border: 'none', padding: '18px', borderRadius: '18px', color: '#000', fontWeight: '950' }}>FINISH LOG</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }} onClick={() => setView('train')}>
            <ChevronLeft size={24} color={T.accent}/> <span style={{fontWeight: '900'}}>BACK</span>
          </div>
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', background: T.surface, border: `2px solid ${T.accent}44`, padding: '15px', borderRadius: '15px', color: '#FFF', boxSizing: 'border-box' }} />
          {filteredLib.map(ex => (
            <button key={ex.id} onClick={() => addExtra(ex)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '20px', borderRadius: '20px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '900', color: '#FFF' }}>{ex.name}</div>
                <div style={{ color: T.accent, fontSize: '0.7em', fontWeight: '800' }}>{ex.muscle}</div>
              </div>
              <Plus size={24} color={T.accent}/>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}`, textAlign: 'left' }}>
              <div style={{ color: w.color, fontWeight: '900', fontSize: '1.2em' }}>{w.name}</div>
            </button>
          ))}
        </div>
      )}

      {/* REST TIMER */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,15,30,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: T.accent, color: '#000', padding: '40px', borderRadius: '40px', textAlign: 'center' }}>
            <div style={{ fontWeight: '950', fontSize: '4em' }}>{timeLeft}s</div>
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
