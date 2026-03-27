import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Play, BarChart2, Settings, ChevronLeft, Plus, 
  Trash2, Dumbbell, Activity, RotateCcw, Filter, TrendingUp
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THE EXERCISE MASTER DATABASE ---
  const EXERCISE_MASTER = [
    { id: "1", name: "Bench Press", muscle: "Chest", equip: "Barbell", tier: 1 },
    { id: "2", name: "Dumbbell Flys", muscle: "Chest", equip: "Dumbbell", tier: 3 },
    { id: "3", name: "Push Ups", muscle: "Chest", equip: "Bodyweight", tier: 2 },
    { id: "4", name: "Deadlift", muscle: "Back", equip: "Barbell", tier: 1 },
    { id: "5", name: "Pull Ups", muscle: "Back", equip: "Bodyweight", tier: 1 },
    { id: "6", name: "Seated Row", muscle: "Back", equip: "Machine", tier: 2 },
    { id: "7", name: "Squats", muscle: "Legs", equip: "Barbell", tier: 1 },
    { id: "8", name: "Leg Press", muscle: "Legs", equip: "Machine", tier: 2 },
    { id: "9", name: "Lunges", muscle: "Legs", equip: "Dumbbell", tier: 2 },
    { id: "10", name: "Shoulder Press", muscle: "Shoulders", equip: "Dumbbell", tier: 1 },
    { id: "11", name: "Lateral Raise", muscle: "Shoulders", equip: "Dumbbell", tier: 3 },
    { id: "12", name: "Bicep Curls", muscle: "Arms", equip: "Dumbbell", tier: 3 },
    { id: "13", name: "Dips", muscle: "Arms", equip: "Bodyweight", tier: 2 }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [weightLogs, setWeightLogs] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({}); 
  const [search, setSearch] = useState('');
  const [filterEquip, setFilterEquip] = useState('All');
  const [bio, setBio] = useState({ weight: 80, height: 180 });

  // --- 3. PERSISTENCE ENGINE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v10_data');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.history) setHistory(p.history);
      if (p.weightLogs) setWeightLogs(p.weightLogs);
      if (p.bio) setBio(p.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v10_data', JSON.stringify({ history, weightLogs, bio }));
  }, [history, weightLogs, bio]);

  // --- 4. ANALYTICS & SUGGESTION ENGINES ---
  const muscleHeat = useMemo(() => {
    const stats = { Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0 };
    history.forEach(s => s.details.forEach(ex => {
      const m = EXERCISE_MASTER.find(e => e.name === ex.name)?.muscle;
      if (m) stats[m] += ex.sets.length;
    }));
    return stats;
  }, [history]);

  const getSuggestions = (currentEx) => {
    const alternatives = EXERCISE_MASTER.filter(e => 
      e.muscle === currentEx.muscle && e.id !== currentEx.id
    );
    return {
      better: alternatives.find(a => a.tier < currentEx.tier) || null,
      swap: alternatives.find(a => a.equip !== currentEx.equip) || null
    };
  };

  const filteredLibrary = EXERCISE_MASTER.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) && 
    (filterEquip === 'All' || e.equip === filterEquip)
  );

  // --- 5. LOGIC ---
  const finishSession = () => {
    const details = activeSession.list.map(ex => ({
      name: ex.name,
      sets: (sessionData[ex.instanceId] || []).filter(s => s.w && s.r)
    })).filter(d => d.sets.length > 0);

    setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
    setActiveSession(null);
    setView('metrics');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '15px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* PERSISTENT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontWeight: '900', letterSpacing: '-1px' }}>TITAN<span style={{color: T.acc}}>V10</span></h1>
        <div style={{ display: 'flex', gap: '8px', background: T.surf, padding: '5px', borderRadius: '12px' }}>
          <button onClick={() => setView('menu')} style={{ border: 'none', background: view === 'menu' ? T.card : 'transparent', color: T.acc, padding: '8px', borderRadius: '8px' }}><Play size={18}/></button>
          <button onClick={() => setView('metrics')} style={{ border: 'none', background: view === 'metrics' ? T.card : 'transparent', color: T.acc, padding: '8px', borderRadius: '8px' }}><Activity size={18}/></button>
          <button onClick={() => setView('settings')} style={{ border: 'none', background: view === 'settings' ? T.card : 'transparent', color: T.acc, padding: '8px', borderRadius: '8px' }}><Settings size={18}/></button>
        </div>
      </div>

      {/* VIEW: WORKOUT LOGGING */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '100px' }}>
          {activeSession.list.map(ex => {
            const suggestions = getSuggestions(ex);
            return (
              <div key={ex.instanceId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.9em', color: T.acc }}>{ex.name}</span>
                  <button onClick={() => setActiveSession({...activeSession, list: activeSession.list.filter(e => e.instanceId !== ex.instanceId)})} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16}/></button>
                </div>

                {/* LOGGING ROWS */}
                {(sessionData[ex.instanceId] || [{w:'', r:''}]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <div style={{ width: '30px', height: '35px', background: T.card, borderRadius: '8px', textAlign: 'center', lineHeight: '35px', fontWeight: 'bold' }}>{i+1}</div>
                    <input placeholder="KG" value={s.w} onChange={e => {
                      const sets = [...(sessionData[ex.instanceId] || [])];
                      sets[i].w = e.target.value;
                      setSessionData({...sessionData, [ex.instanceId]: sets});
                    }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'center' }} />
                    <input placeholder="REPS" value={s.r} onChange={e => {
                      const sets = [...(sessionData[ex.instanceId] || [])];
                      sets[i].r = e.target.value;
                      setSessionData({...sessionData, [ex.instanceId]: sets});
                    }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'center' }} />
                  </div>
                ))}
                
                <button onClick={() => {
                  const sets = sessionData[ex.instanceId] || [];
                  setSessionData({...sessionData, [ex.instanceId]: [...sets, {w: sets[sets.length-1]?.w || '', r: ''}]});
                }} style={{ width: '100%', padding: '8px', marginTop: '10px', border: `1px dashed ${T.card}`, background: 'none', color: T.mute, borderRadius: '8px', fontSize: '0.8em' }}>+ ADD SET</button>

                {/* SUGGESTION ENGINE UI */}
                <div style={{ marginTop: '15px', borderTop: `1px solid ${T.card}`, paddingTop: '10px', fontSize: '0.7em' }}>
                  <span style={{ color: T.mute }}>ALTERNATIVES:</span>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                    {suggestions.better && <div style={{ background: '#065f46', padding: '4px 8px', borderRadius: '5px' }}>Stronger: {suggestions.better.name}</div>}
                    {suggestions.swap && <div style={{ background: '#374151', padding: '4px 8px', borderRadius: '5px' }}>{suggestions.swap.equip}: {suggestions.swap.name}</div>}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ position: 'fixed', bottom: 20, left: 15, right: 15, display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, padding: '15px', borderRadius: '15px', background: T.surf, color: '#fff', fontWeight: 'bold', border: 'none' }}>+ ADD EXERCISE</button>
            <button onClick={finishSession} style={{ flex: 1, padding: '15px', borderRadius: '15px', background: T.acc, color: '#000', fontWeight: 'bold', border: 'none' }}>FINISH WORKOUT</button>
          </div>
        </div>
      )}

      {/* VIEW: SEARCHABLE LIBRARY */}
      {view === 'library' && (
        <div>
          <button onClick={() => setView(activeSession ? 'train' : 'menu')} style={{ color: T.mute, background: 'none', border: 'none', marginBottom: '10px' }}><ChevronLeft/></button>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '12px', color: T.mute }} size={18}/>
            <input placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '15px', background: T.surf, border: 'none', color: '#fff', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '10px' }}>
            {['All', 'Barbell', 'Dumbbell', 'Machine', 'Bodyweight'].map(e => (
              <button key={e} onClick={() => setFilterEquip(e)} style={{ padding: '6px 12px', borderRadius: '20px', background: filterEquip === e ? T.acc : T.surf, color: filterEquip === e ? '#000' : '#fff', border: 'none', fontSize: '0.7em', flexShrink: 0 }}>{e}</button>
            ))}
          </div>
          {filteredLibrary.map(ex => (
            <div key={ex.id} onClick={() => {
              const instanceId = `${ex.id}-${Date.now()}`;
              if (!activeSession) setActiveSession({ name: 'Custom Session', list: [{...ex, instanceId}] });
              else setActiveSession({...activeSession, list: [...activeSession.list, {...ex, instanceId}]});
              setView('train');
            }} style={{ background: T.surf, padding: '15px', borderRadius: '15px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{ex.name}</span>
              <span style={{ fontSize: '0.7em', color: T.acc }}>{ex.muscle}</span>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: ANALYTICS & BODY HEATMAP */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: T.surf, padding: '20px', borderRadius: '25px', display: 'flex', justifyContent: 'center' }}>
            {/* ANATOMICAL HEATMAP (CSS) */}
            <div style={{ position: 'relative', width: '120px', height: '200px', background: '#0f172a', borderRadius: '10px' }}>
              {/* Shoulders */}
              <div style={{ position: 'absolute', top: '35px', left: '10px', width: '100px', height: '15px', borderRadius: '10px', background: muscleHeat.Shoulders > 5 ? '#f97316' : '#1e293b' }} />
              {/* Chest */}
              <div style={{ position: 'absolute', top: '55px', left: '25px', width: '70px', height: '40px', borderRadius: '5px', background: muscleHeat.Chest > 5 ? '#f97316' : '#1e293b' }} />
              {/* Back (Center) */}
              <div style={{ position: 'absolute', top: '55px', left: '55px', width: '10px', height: '50px', background: muscleHeat.Back > 5 ? '#f97316' : '#1e293b' }} />
              {/* Legs */}
              <div style={{ position: 'absolute', top: '105px', left: '30px', width: '25px', height: '80px', borderRadius: '5px', background: muscleHeat.Legs > 5 ? '#f97316' : '#1e293b' }} />
              <div style={{ position: 'absolute', top: '105px', left: '65px', width: '25px', height: '80px', borderRadius: '5px', background: muscleHeat.Legs > 5 ? '#f97316' : '#1e293b' }} />
              <p style={{ position: 'absolute', bottom: -20, fontSize: '0.6em', width: '100%', textAlign: 'center', color: T.mute }}>BODY HEATMAP</p>
            </div>
          </div>
          
          <div style={{ background: T.surf, padding: '20px', borderRadius: '25px' }}>
             <h3 style={{ fontSize: '0.8em', marginBottom: '15px' }}>STRENGTH TREND</h3>
             {history.slice(0,5).map((h, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', marginBottom: '10px' }}>
                 <span>{h.date}</span>
                 <span style={{ color: T.acc }}>{h.name}</span>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* VIEW: MENU & QUICKSTART */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div onClick={() => setView('library')} style={{ background: T.acc, color: '#000', padding: '30px', borderRadius: '30px', textAlign: 'center', fontWeight: '900' }}>
            START NEW WORKOUT
          </div>
          <h3 style={{ fontSize: '0.8em', color: T.mute, marginTop: '10px' }}>EQUIPMENT PROGRAMS</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div onClick={() => { setActiveSession({name: 'Home DB', list: EXERCISE_MASTER.filter(e => e.equip === 'Dumbbell').map(e => ({...e, instanceId: Math.random()}))}); setView('train'); }} style={{ background: T.surf, padding: '20px', borderRadius: '20px', fontSize: '0.8em', fontWeight: 'bold' }}>Dumbbell Only</div>
            <div onClick={() => { setActiveSession({name: 'Bodyweight Pro', list: EXERCISE_MASTER.filter(e => e.equip === 'Bodyweight').map(e => ({...e, instanceId: Math.random()}))}); setView('train'); }} style={{ background: T.surf, padding: '20px', borderRadius: '20px', fontSize: '0.8em', fontWeight: 'bold' }}>Bodyweight</div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TitanTracker;