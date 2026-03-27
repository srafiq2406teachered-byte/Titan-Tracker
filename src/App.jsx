import React, { useState, useEffect, useMemo } from 'react';
import { Play, Settings, Activity, Plus, Trash2, Dumbbell, Search, X, Check } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THE MASTER LIBRARY ---
  const EXERCISE_LIBRARY = [
    { id: "1", name: "Bench Press", muscle: "Chest", tier: 1 },
    { id: "2", name: "Deadlift", muscle: "Back", tier: 1 },
    { id: "3", name: "Squats", muscle: "Legs", tier: 1 },
    { id: "4", name: "Military Press", muscle: "Shoulders", tier: 1 },
    { id: "5", name: "Pull Ups", muscle: "Back", tier: 1 },
    { id: "6", name: "Bicep Curls", muscle: "Arms", tier: 3 },
    { id: "7", name: "Tricep Pushdown", muscle: "Arms", tier: 3 },
    { id: "8", name: "Leg Press", muscle: "Legs", tier: 2 },
    { id: "9", name: "Dumbbell Flys", muscle: "Chest", tier: 3 }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [unit, setUnit] = useState('metric');
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, gender: 'male' });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);

  // --- 3. RECOVERY & SYNC ---
  useEffect(() => {
    const v11 = localStorage.getItem('titan_v11_master');
    const v12 = localStorage.getItem('titan_v12_final');
    const v14 = localStorage.getItem('titan_v14_vault');
    const v15 = localStorage.getItem('titan_v15_modular');
    
    const combined = JSON.parse(v15 || v14 || v12 || v11 || '{}');
    if (combined.history) setHistory(combined.history);
    if (combined.bio) setBio(combined.bio);
    if (combined.unit) setUnit(combined.unit || 'metric');
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v15_modular', JSON.stringify({ history, bio, unit }));
  }, [history, bio, unit]);

  // --- 4. LOGIC ---
  const filteredLibrary = EXERCISE_LIBRARY.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addExerciseToWorkout = (ex) => {
    const instId = `${ex.id}-${Math.random()}`;
    setActiveSession(prev => ({ ...prev, list: [...prev.list, { ...ex, instId }] }));
    setShowLibrary(false);
    setSearchQuery('');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      {!showLibrary && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V15</span></h1>
          <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px' }}>
            {[ {id:'menu', i:<Play size={18}/>}, {id:'metrics', i:<Activity size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
              <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH OVERLAY (RESTORED) */}
      {showLibrary && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 100, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: T.surf, borderRadius: '12px', padding: '5px 15px', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color={T.mute} />
              <input autoFocus placeholder="Find exercise..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ background: 'none', border: 'none', color: '#fff', padding: '10px', width: '100%' }} />
            </div>
            <button onClick={() => setShowLibrary(false)} style={{ background: T.card, border: 'none', borderRadius: '12px', color: '#fff', padding: '10px' }}><X size={20}/></button>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredLibrary.map(ex => (
              <div key={ex.id} onClick={() => addExerciseToWorkout(ex)} style={{ background: T.surf, padding: '15px', borderRadius: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold' }}>{ex.name}</span>
                <span style={{ fontSize: '0.7em', color: T.acc }}>{ex.muscle}</span>
              </div>
            ))}
            {searchQuery && !filteredLibrary.length && (
              <button onClick={() => addExerciseToWorkout({ id: 'custom', name: searchQuery, muscle: 'Other' })} style={{ width: '100%', padding: '15px', background: T.acc, color: '#000', borderRadius: '15px', fontWeight: 'bold' }}>Add Custom: "{searchQuery}"</button>
            )}
          </div>
        </div>
      )}

      {/* MAIN VIEWS */}
      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '120px' }}>
        
        {/* TRAIN VIEW (WITH REPS FIX & ADD BUTTON) */}
        {view === 'train' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '1.1em', fontWeight: '900', color: T.acc }}>{activeSession.name}</h2>
               <button onClick={() => setShowLibrary(true)} style={{ background: T.surf, border: `1px solid ${T.acc}`, color: T.acc, padding: '6px 12px', borderRadius: '10px', fontSize: '0.7em', fontWeight: 'bold' }}>+ ADD EXERCISE</button>
            </div>

            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name.toUpperCase()}</span>
                  <button onClick={() => setActiveSession(s => ({ ...s, list: s.list.filter(item => item.instId !== ex.instId) }))} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16}/></button>
                </div>

                {/* THE FIXED REPS GRID */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '4px', paddingLeft: '30px' }}>
                  <span style={{ width: '80px', fontSize: '0.5em', color: T.mute }}>{unit === 'metric' ? 'KG' : 'LB'}</span>
                  <span style={{ width: '80px', fontSize: '0.5em', color: T.mute }}>REPS</span>
                </div>

                {(sessionData[ex.instId] || [{w:'', r:''}]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ width: '20px', fontSize: '0.7em', color: T.acc, fontWeight: '900' }}>{i+1}</div>
                    <input type="number" placeholder="0" value={s.w} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].w = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '80px', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                    <input type="number" placeholder="0" value={s.r} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].r = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '80px', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                  </div>
                ))}
                <button onClick={() => {
                  const s = sessionData[ex.instId] || [];
                  setSessionData({...sessionData, [ex.instId]: [...s, {w: s[s.length-1]?.w || '', r: ''}]});
                }} style={{ width: '100%', padding: '10px', background: T.card, border: 'none', borderRadius: '12px', color: T.mute, fontSize: '0.7em' }}>+ SET</button>
              </div>
            ))}
          </div>
        )}

        {/* MENU: STARTING POINT */}
        {view === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div onClick={() => { setActiveSession({ name: 'Free Session', list: [] }); setView('train'); }} style={{ background: T.acc, padding: '30px', borderRadius: '30px', textAlign: 'center', color: '#000', cursor: 'pointer' }}>
               <div style={{ fontWeight: '950', fontSize: '1.2em' }}>START EMPTY WORKOUT</div>
               <div style={{ fontSize: '0.7em', fontWeight: 'bold' }}>Add exercises as you go</div>
            </div>
            <h3 style={{ fontSize: '0.7em', color: T.mute, fontWeight: '900' }}>HISTORY RECOVERED: {history.length} ITEMS</h3>
            {history.slice(0,3).map((h, i) => (
              <div key={i} style={{ background: T.surf, padding: '15px', borderRadius: '15px', opacity: 0.6, fontSize: '0.8em' }}>{h.date} - {h.name}</div>
            ))}
          </div>
        )}

      </div>

      {/* FINISH BUTTON */}
      {view === 'train' && activeSession && (
        <div style={{ position: 'fixed', bottom: 15, left: 15, right: 15 }}>
          <button onClick={() => {
            const details = activeSession.list.map(ex => ({ name: ex.name, sets: (sessionData[ex.instId] || []).filter(s => s.w && s.r) }));
            setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
            setActiveSession(null); setView('menu');
          }} style={{ width: '100%', padding: '20px', background: T.acc, color: '#000', borderRadius: '20px', fontWeight: '950', border: 'none' }}>LOG WORKOUT</button>
        </div>
      )}

    </div>
  );
};

export default TitanTracker;