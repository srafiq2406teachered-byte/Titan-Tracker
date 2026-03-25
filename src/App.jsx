import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, History, Plus, Minus, X, Dumbbell, 
  Search, CheckCircle2, ChevronLeft, Filter
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CONFIGURATION ---
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
    { id: "E1", name: "Bicep Curls", muscle: "Arms" },
    { id: "E2", name: "Tricep Pushdown", muscle: "Arms" },
    { id: "E3", name: "Lateral Raises", muscle: "Shoulders" },
    { id: "E4", name: "Face Pulls", muscle: "Back" },
    { id: "E5", name: "Calf Raises", muscle: "Legs" },
    { id: "E6", name: "Hammer Curls", muscle: "Arms" },
    { id: "E7", name: "Skull Crushers", muscle: "Arms" },
    { id: "E8", name: "Front Raises", muscle: "Shoulders" }
  ];

  const T = {
    bg: '#0A0F1E', surface: '#161E31', card: '#232D45', accent: '#10B981',
    text: '#F8FAFC', subtext: '#94A3B8', border: 'rgba(255,255,255,0.1)', danger: '#EF4444'
  };

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v61_data');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } 
      catch(e) { setHistory([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v61_data', JSON.stringify(history));
  }, [history]);

  // --- 4. ENGINE ---
  const startWorkout = (id) => {
    const protocol = WORKOUTS[id];
    const list = EXERCISES.filter(ex => protocol.ids.includes(ex.id));
    const initialData = {};
    list.forEach(ex => {
      for(let s=0; s<3; s++) {
        initialData[`${ex.id}-s${s}-r`] = 10;
        initialData[`${ex.id}-s${s}-w`] = 0;
      }
    });
    setSessionData(initialData);
    setActiveSession({ ...protocol, list });
    setView('train');
  };

  const addExtra = (ex) => {
    setActiveSession(prev => ({ ...prev, list: [...prev.list, ex] }));
    const extraData = {};
    for(let s=0; s<3; s++) {
      extraData[`${ex.id}-s${s}-r`] = 10;
      extraData[`${ex.id}-s${s}-w`] = 0;
    }
    setSessionData(prev => ({ ...prev, ...extraData }));
    setSearchQuery(''); // Clear search for next time
    setView('train');
  };

  const removeExercise = (exId) => {
    setActiveSession(prev => ({
      ...prev,
      list: prev.list.filter(item => item.id !== exId)
    }));
  };

  const updateVal = (key, delta) => {
    setSessionData(prev => ({
      ...prev,
      [key]: Math.max(0, (parseFloat(prev[key]) || 0) + delta)
    }));
  };

  const filteredLibrary = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return EXTRA_POOL.filter(ex => 
      ex.name.toLowerCase().includes(query) || 
      ex.muscle.toLowerCase().includes(query)
    );
  }, [searchQuery]);

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

    setHistory([{
      id: activeSession.id, 
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      name: activeSession.name, 
      color: activeSession.color, 
      details
    }, ...history]);
    
    setActiveSession(null); setView('log');
  };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* HEADER */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px' }}><Play size={18}/></button>
            <button onClick={() => setView('log')} style={{ border: 'none', padding: '10px', background: view === 'log' ? T.card : 'transparent', color: view === 'log' ? T.accent : T.subtext, borderRadius: '8px' }}><History size={18}/></button>
          </div>
        </div>
      )}

      {/* VIEW: MENU */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(WORKOUTS).map(w => (
            <button key={w.id} onClick={() => startWorkout(w.id)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '25px', borderRadius: '24px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: w.color, fontWeight: '900', fontSize: '18px' }}>{w.name}</div>
                <div style={{ color: T.subtext, fontSize: '11px', marginTop: '4px' }}>LOG SESSION</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '160px' }}>
          {activeSession.list.map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: '900', fontSize: '16px', color: '#FFF' }}>{ex.name}</span>
                <button onClick={() => removeExercise(ex.id)} style={{ background: 'none', border: 'none', color: T.danger, padding: '5px' }}><X size={18}/></button>
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => setTimeLeft(activeSession.rest)} style={{ width: '45px', height: '45px', background: T.card, borderRadius: '10px', border: 'none', color: T.accent, fontWeight: '900' }}>{i + 1}</button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#000', borderRadius: '10px', border: `1px solid ${T.border}` }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, -1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: '900', fontSize: '14px' }}>{sessionData[`${ex.id}-s${i}-w`] || 0}kg</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-w`, 1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Plus size={14}/></button>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#000', borderRadius: '10px', border: `1px solid ${T.border}` }}>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, -1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Minus size={14}/></button>
                    <div style={{ flex: 1, textAlign: 'center', fontWeight: '900', fontSize: '14px', color: T.accent }}>{sessionData[`${ex.id}-s${i}-r`] || 0}</div>
                    <button onClick={() => updateVal(`${ex.id}-s${i}-r`, 1)} style={{ padding: '10px', background: 'none', border: 'none', color: T.subtext }}><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
             <button onClick={() => setView('library')} style={{ background: T.surface, border: `1px solid ${T.accent}44`, padding: '15px', borderRadius: '15px', color: T.accent, fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
               <Plus size={18}/> ADD EXTRA
             </button>
             <button onClick={finishSession} style={{ background: T.accent, border: 'none', padding: '15px', borderRadius: '15px', color: '#000', fontWeight: '950' }}>FINISH LOG</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY (SEARCHABLE) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => setView('train')} style={{ background: T.surface, border: 'none', padding: '10px', borderRadius: '12px', color: T.text }}><ChevronLeft size={24}/></button>
            <h2 style={{ fontSize: '20px', fontWeight: '900' }}>Library</h2>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '15px', top: '15px', color: T.subtext }} />
            <input 
              type="text" 
              placeholder="Search exercise or muscle..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', background: T.surface, border: `1px solid ${T.border}`, padding: '15px 15px 15px 45px', borderRadius: '15px', color: '#FFF', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredLibrary.map(ex => {
              const isAdded = activeSession?.list.find(al => al.id === ex.id);
              return (
                <button key={ex.id} onClick={() => !isAdded && addExtra(ex)} style={{ background: T.surface, border: `1px solid ${isAdded ? T.accent + '44' : T.border}`, padding: '18px', borderRadius: '18px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: isAdded ? 0.4 : 1 }}>
                  <div>
                    <div style={{ fontWeight: '900', color: isAdded ? T.accent : '#FFF' }}>{ex.name}</div>
                    <div style={{ fontSize: '10px', color: T.subtext, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ex.muscle}</div>
                  </div>
                  {isAdded ? <CheckCircle2 size={20} color={T.accent}/> : <Plus size={20} color={T.subtext}/>}
                </button>
              );
            })}
            {filteredLibrary.length === 0 && <div style={{ textAlign: 'center', color: T.subtext, marginTop: '20px' }}>No matches found.</div>}
          </div>
        </div>
      )}

      {/* VIEW: LOG */}
      {view === 'log' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((h, i) => (
            <div key={i} style={{ background: T.surface, padding: '15px', borderRadius: '15px', borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '14px' }}>{h.date}</span>
                <span style={{ color: h.color, fontWeight: '900', fontSize: '11px' }}>{h.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && (
        <div onClick={() => setTimeLeft(0)} style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '20px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <span style={{ fontWeight: '950', fontSize: '32px' }}>{timeLeft}s</span>
          <div style={{ fontWeight: '900', textAlign: 'right' }}>RESTING</div>
        </div>
      )}

      {useEffect(() => {
        let t;
        if (timeLeft > 0) t = setInterval(() => setTimeLeft(p => p - 1), 1000);
        return () => clearInterval(t);
      }, [timeLeft])}

    </div>
  );
};

export default TitanTracker;
