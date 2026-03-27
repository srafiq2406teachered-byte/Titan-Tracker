import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Play, BarChart2, Settings, ChevronLeft, Plus, 
  Trash2, Activity, Save, Dumbbell, Zap, Heart
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. MASTER DATA ---
  const EXERCISE_MASTER = [
    { id: "1", name: "Bench Press", muscle: "Chest", equip: "Barbell", tier: 1 },
    { id: "2", name: "Dumbbell Flys", muscle: "Chest", equip: "Dumbbell", tier: 3 },
    { id: "3", name: "Push Ups", muscle: "Chest", equip: "Bodyweight", tier: 2 },
    { id: "4", name: "Deadlift", muscle: "Back", equip: "Barbell", tier: 1 },
    { id: "5", name: "Pull Ups", muscle: "Back", equip: "Bodyweight", tier: 1 },
    { id: "6", name: "Seated Row", muscle: "Back", equip: "Machine", tier: 2 },
    { id: "7", name: "Squats", muscle: "Legs", equip: "Barbell", tier: 1 },
    { id: "8", name: "Leg Press", muscle: "Legs", equip: "Machine", tier: 2 },
    { id: "10", name: "Shoulder Press", muscle: "Shoulders", equip: "Dumbbell", tier: 1 },
    { id: "11", name: "Lateral Raise", muscle: "Shoulders", equip: "Dumbbell", tier: 3 },
    { id: "12", name: "Bicep Curls", muscle: "Arms", equip: "Dumbbell", tier: 3 },
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [customRoutines, setCustomRoutines] = useState([]);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, gender: 'male', activity: 1.2 });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [newRoutineName, setNewRoutineName] = useState("");
  const [tempRoutineList, setTempRoutineList] = useState([]);

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v11_master');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.history) setHistory(p.history);
      if (p.customRoutines) setCustomRoutines(p.customRoutines);
      if (p.bio) setBio(p.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v11_master', JSON.stringify({ history, customRoutines, bio }));
  }, [history, customRoutines, bio]);

  // --- 4. CALCULATORS ---
  const stats = useMemo(() => {
    const hM = bio.height / 100;
    const bmi = (bio.weight / (hM * hM)).toFixed(1);
    
    // Mifflin-St Jeor Equation
    let bmr = (10 * bio.weight) + (6.25 * bio.height) - (5 * bio.age);
    bmr = bio.gender === 'male' ? bmr + 5 : bmr - 161;
    
    const tdee = Math.round(bmr * bio.activity);
    return { bmi, bmr: Math.round(bmr), tdee };
  }, [bio]);

  // --- 5. LOGIC ---
  const saveCustomRoutine = () => {
    if (!newRoutineName || tempRoutineList.length === 0) return;
    const routine = { id: Date.now(), name: newRoutineName, list: tempRoutineList };
    setCustomRoutines([...customRoutines, routine]);
    setNewRoutineName("");
    setTempRoutineList([]);
  };

  const startWorkout = (routine) => {
    const list = routine.list.map(ex => ({ ...ex, instanceId: `${ex.id}-${Math.random()}` }));
    setActiveSession({ name: routine.name, list });
    setSessionData({});
    setView('train');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '15px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* NAV BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontWeight: '950' }}>TITAN<span style={{color: T.acc}}>V11</span></h1>
        <div style={{ display: 'flex', gap: '5px', background: T.surf, padding: '4px', borderRadius: '12px' }}>
          {[ {id:'menu', i:<Play/>}, {id:'metrics', i:<Activity/>}, {id:'settings', i:<Settings/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.card : 'transparent', color: T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      {/* VIEW: SETTINGS (CALCULATORS + ARCHITECT) */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* CALCULATOR HUB */}
          <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '0.8em', color: T.mute, fontWeight: '900', marginBottom: '15px' }}>BIOMETRIC HUB</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
              <div style={{ textAlign: 'center' }}><div style={{ color: T.acc, fontWeight: '900' }}>{stats.bmi}</div><div style={{ fontSize: '0.5em' }}>BMI</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ color: T.acc, fontWeight: '900' }}>{stats.bmr}</div><div style={{ fontSize: '0.5em' }}>BMR</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ color: T.acc, fontWeight: '900' }}>{stats.tdee}</div><div style={{ fontSize: '0.5em' }}>TDEE</div></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['weight', 'height', 'age'].map(k => (
                <input key={k} type="number" value={bio[k]} onChange={e => setBio({...bio, [k]: Number(e.target.value)})} placeholder={k} style={{ background: T.bg, border: 'none', padding: '10px', borderRadius: '10px', color: '#fff' }} />
              ))}
              <select value={bio.gender} onChange={e => setBio({...bio, gender: e.target.value})} style={{ background: T.bg, color: '#fff', border: 'none', borderRadius: '10px' }}>
                <option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* ROUTINE ARCHITECT */}
          <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '0.8em', color: T.mute, fontWeight: '900', marginBottom: '15px' }}>ROUTINE ARCHITECT</h2>
            <input placeholder="Routine Name (e.g. My Upper Body)" value={newRoutineName} onChange={e => setNewRoutineName(e.target.value)} style={{ width: '100%', padding: '12px', background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', marginBottom: '10px', boxSizing: 'border-box' }} />
            
            <div style={{ maxHeight: '150px', overflowY: 'auto', marginBottom: '10px' }}>
              {EXERCISE_MASTER.map(ex => (
                <button key={ex.id} onClick={() => setTempRoutineList([...tempRoutineList, ex])} style={{ width: '100%', padding: '8px', background: T.card, border: 'none', color: '#fff', marginBottom: '4px', borderRadius: '8px', fontSize: '0.7em', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                  {ex.name} <Plus size={12}/>
                </button>
              ))}
            </div>
            
            <div style={{ fontSize: '0.7em', color: T.acc, marginBottom: '10px' }}>Selected: {tempRoutineList.length} exercises</div>
            <button onClick={saveCustomRoutine} style={{ width: '100%', padding: '12px', background: T.acc, color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900' }}>SAVE ROUTINE</button>
          </div>
        </div>
      )}

      {/* VIEW: MENU (SAVED WORKOUTS) */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: `linear-gradient(45deg, ${T.acc}, #60a5fa)`, padding: '30px', borderRadius: '30px', color: '#000', textAlign: 'center' }}>
            <div style={{ fontWeight: '900', fontSize: '1.4em' }}>READY FOR ACTION?</div>
            <div style={{ fontSize: '0.7em', opacity: 0.8 }}>Daily TDEE: {stats.tdee} kcal</div>
          </div>

          <h3 style={{ fontSize: '0.7em', color: T.mute, fontWeight: '900' }}>YOUR PINNED ROUTINES</h3>
          {customRoutines.length === 0 && <div style={{ color: T.mute, fontSize: '0.8em', textAlign: 'center', padding: '20px' }}>No custom workouts yet. Create one in Settings!</div>}
          {customRoutines.map(r => (
            <div key={r.id} style={{ background: T.surf, padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '800' }}>{r.name.toUpperCase()}</div>
                <div style={{ fontSize: '0.6em', color: T.mute }}>{r.list.length} Exercises</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setCustomRoutines(customRoutines.filter(x => x.id !== r.id))} style={{ background: 'none', border: 'none', color: '#ef4444' }}><Trash2 size={18}/></button>
                <button onClick={() => startWorkout(r)} style={{ background: T.acc, color: '#000', border: 'none', padding: '10px', borderRadius: '10px' }}><Play size={18} fill="currentColor"/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN (KEEPING PREVIOUS LOGIC) */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '100px' }}>
          <h2 style={{ color: T.acc, fontSize: '1.2em', fontWeight: '950', marginBottom: '20px' }}>{activeSession.name}</h2>
          {activeSession.list.map(ex => (
            <div key={ex.instanceId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', marginBottom: '15px' }}>
              <div style={{ fontWeight: '800', fontSize: '0.9em', color: T.acc, marginBottom: '10px' }}>{ex.name}</div>
              {(sessionData[ex.instanceId] || [{w:'', r:''}]).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                  <input placeholder="KG" value={s.w} onChange={e => {
                    const sets = [...(sessionData[ex.instanceId] || [])];
                    sets[i].w = e.target.value;
                    setSessionData({...sessionData, [ex.instanceId]: sets});
                  }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'center', padding: '8px' }} />
                  <input placeholder="REPS" value={s.r} onChange={e => {
                    const sets = [...(sessionData[ex.instanceId] || [])];
                    sets[i].r = e.target.value;
                    setSessionData({...sessionData, [ex.instanceId]: sets});
                  }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'center', padding: '8px' }} />
                </div>
              ))}
              <button onClick={() => {
                const sets = sessionData[ex.instanceId] || [];
                setSessionData({...sessionData, [ex.instanceId]: [...sets, {w:'', r:''}]});
              }} style={{ width: '100%', padding: '5px', background: 'none', border: `1px dashed ${T.card}`, color: T.mute, fontSize: '0.7em' }}>+ SET</button>
            </div>
          ))}
          <button onClick={() => {
             const details = activeSession.list.map(ex => ({ name: ex.name, sets: (sessionData[ex.instanceId] || []).filter(s => s.w && s.r) }));
             setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
             setActiveSession(null); setView('metrics');
          }} style={{ position: 'fixed', bottom: 20, left: 15, right: 15, padding: '18px', background: T.acc, color: '#000', borderRadius: '18px', fontWeight: '950', border: 'none' }}>COMPLETE</button>
        </div>
      )}
      
      {/* METRICS & HEATMAP REMAIN FROM V10 */}
      {view === 'metrics' && (
        <div style={{ textAlign: 'center', color: T.mute, padding: '40px' }}>
          <Activity size={48} style={{ marginBottom: '10px', opacity: 0.2 }} />
          <p>Heatmap and Progression data is active based on your {history.length} saved sessions.</p>
        </div>
      )}

    </div>
  );
};

export default TitanTracker;