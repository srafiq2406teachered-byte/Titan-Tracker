import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, BarChart2, Settings, ChevronLeft, Plus, 
  Trash2, Activity, Save, Dumbbell, Zap, Scale, Ruler
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THE ARCHITECT'S DATA ---
  const EXERCISE_MASTER = [
    { id: "1", name: "Bench Press", muscle: "Chest", equip: "Barbell", tier: 1 },
    { id: "4", name: "Deadlift", muscle: "Back", equip: "Barbell", tier: 1 },
    { id: "7", name: "Squats", muscle: "Legs", equip: "Barbell", tier: 1 },
    { id: "10", name: "Shoulder Press", muscle: "Shoulders", equip: "Dumbbell", tier: 1 },
    { id: "5", name: "Pull Ups", muscle: "Back", equip: "Bodyweight", tier: 1 },
    { id: "12", name: "Bicep Curls", muscle: "Arms", equip: "Dumbbell", tier: 3 },
  ];

  const PREMADE_ROUTINES = [
    { id: 'p1', name: "PUSH (CHEST/SHOULDER)", list: [EXERCISE_MASTER[0], EXERCISE_MASTER[3]] },
    { id: 'p2', name: "PULL (BACK/BICEPS)", list: [EXERCISE_MASTER[1], EXERCISE_MASTER[4], EXERCISE_MASTER[5]] },
    { id: 'p3', name: "LEGS (POWER)", list: [EXERCISE_MASTER[2]] }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [unit, setUnit] = useState('metric'); // 'metric' or 'imperial'
  const [history, setHistory] = useState([]);
  const [customRoutines, setCustomRoutines] = useState(PREMADE_ROUTINES);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, gender: 'male' });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v12_final');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.history) setHistory(p.history);
      if (p.customRoutines) setCustomRoutines(p.customRoutines);
      if (p.bio) setBio(p.bio);
      if (p.unit) setUnit(p.unit);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v12_final', JSON.stringify({ history, customRoutines, bio, unit }));
  }, [history, customRoutines, bio, unit]);

  // --- 4. CONVERSION & CALCULATION ENGINE ---
  const stats = useMemo(() => {
    // Standardize to Metric for Math
    let wKG = unit === 'metric' ? bio.weight : bio.weight * 0.453592;
    let hCM = unit === 'metric' ? bio.height : bio.height * 2.54;
    
    const bmi = (wKG / ((hCM / 100) ** 2)).toFixed(1);
    let bmr = (10 * wKG) + (6.25 * hCM) - (5 * bio.age);
    bmr = bio.gender === 'male' ? bmr + 5 : bmr - 161;
    
    return { bmi, bmr: Math.round(bmr), tdee: Math.round(bmr * 1.2) };
  }, [bio, unit]);

  const startWorkout = (routine) => {
    const list = routine.list.map(ex => ({ ...ex, instanceId: `${ex.id}-${Math.random()}` }));
    setActiveSession({ name: routine.name, list });
    setSessionData({});
    setView('train');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '15px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* PERSISTENT NAV */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexShrink: 0 }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.2em' }}>TITAN<span style={{color: T.acc}}>V12</span></h1>
        <div style={{ display: 'flex', gap: '5px', background: T.surf, padding: '4px', borderRadius: '12px' }}>
          {[ {id:'menu', i:<Play/>}, {id:'metrics', i:<Activity/>}, {id:'settings', i:<Settings/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.card : 'transparent', color: T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        
        {/* VIEW: SETTINGS (CALCULATORS + UNIT TOGGLE) */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* UNIT TOGGLE */}
            <div style={{ background: T.surf, padding: '15px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8em', fontWeight: 'bold' }}>SYSTEM UNITS</span>
              <div style={{ background: T.bg, borderRadius: '10px', padding: '4px' }}>
                <button onClick={() => setUnit('metric')} style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: unit === 'metric' ? T.acc : 'transparent', color: unit === 'metric' ? '#000' : T.mute, fontWeight: 'bold' }}>METRIC</button>
                <button onClick={() => setUnit('imperial')} style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', background: unit === 'imperial' ? T.acc : 'transparent', color: unit === 'imperial' ? '#000' : T.mute, fontWeight: 'bold' }}>US/IMP</button>
              </div>
            </div>

            {/* BIO INPUTS */}
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <h2 style={{ fontSize: '0.7em', color: T.acc, fontWeight: '900', marginBottom: '15px', letterSpacing: '1px' }}>BIOMETRIC INPUTS</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.6em', color: T.mute }}>WEIGHT ({unit === 'metric' ? 'KG' : 'LBS'})</label>
                  <input type="number" value={bio.weight} onChange={e => setBio({...bio, weight: Number(e.target.value)})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.6em', color: T.mute }}>HEIGHT ({unit === 'metric' ? 'CM' : 'IN'})</label>
                  <input type="number" value={bio.height} onChange={e => setBio({...bio, height: Number(e.target.value)})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.6em', color: T.mute }}>AGE</label>
                  <input type="number" value={bio.age} onChange={e => setBio({...bio, age: Number(e.target.value)})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.6em', color: T.mute }}>GENDER</label>
                  <select value={bio.gender} onChange={e => setBio({...bio, gender: e.target.value})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '10px', color: '#fff' }}>
                    <option value="male">Male</option><option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SCORE CARDS (NO LONGER OFF SCREEN) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: T.surf, padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8em', fontWeight: '900', color: T.acc }}>{stats.bmi}</div>
                <div style={{ fontSize: '0.6em', color: T.mute }}>BMI SCORE</div>
              </div>
              <div style={{ background: T.surf, padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.8em', fontWeight: '900', color: T.acc }}>{stats.tdee}</div>
                <div style={{ fontSize: '0.6em', color: T.mute }}>DAILY KCAL</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: MENU (PREMADE + CUSTOM) */}
        {view === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: `linear-gradient(45deg, #38bdf8, #818cf8)`, padding: '25px', borderRadius: '28px', color: '#000' }}>
              <div style={{ fontWeight: '950', fontSize: '1.2em' }}>ENGINE READY</div>
              <div style={{ fontSize: '0.7em', fontWeight: 'bold' }}>Current Mass: {bio.weight}{unit === 'metric' ? 'kg' : 'lb'}</div>
            </div>
            
            <h3 style={{ fontSize: '0.7em', color: T.acc, fontWeight: '900', marginTop: '10px' }}>ROUTINES</h3>
            {customRoutines.map(r => (
              <div key={r.id} onClick={() => startWorkout(r)} style={{ background: T.surf, padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '0.9em' }}>{r.name}</div>
                  <div style={{ fontSize: '0.6em', color: T.mute }}>{r.list.length} EXERCISES</div>
                </div>
                <Play size={20} fill={T.acc} color={T.acc}/>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: TRAIN (WEIGHT & REPS LOGGING) */}
        {view === 'train' && activeSession && (
          <div>
            <h2 style={{ color: T.acc, fontWeight: '900', marginBottom: '15px' }}>{activeSession.name}</h2>
            {activeSession.list.map(ex => (
              <div key={ex.instanceId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', marginBottom: '10px' }}>
                <div style={{ fontWeight: '900', fontSize: '0.8em', marginBottom: '10px' }}>{ex.name}</div>
                {(sessionData[ex.instanceId] || [{w:'', r:''}]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ width: '30px', textAlign: 'center', lineHeight: '35px', fontSize: '0.7em', fontWeight: 'bold' }}>{i+1}</div>
                    <input placeholder={unit === 'metric' ? "KG" : "LBS"} value={s.w} onChange={e => {
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
                  const s = sessionData[ex.instanceId] || [];
                  setSessionData({...sessionData, [ex.instanceId]: [...s, {w: s[s.length-1]?.w || '', r: ''}]});
                }} style={{ width: '100%', padding: '6px', background: 'none', border: `1px dashed ${T.card}`, color: T.mute, fontSize: '0.6em', marginTop: '5px' }}>+ SET</button>
              </div>
            ))}
            <button onClick={() => {
              setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details: [] }, ...history]);
              setActiveSession(null); setView('menu');
            }} style={{ position: 'fixed', bottom: 20, left: 15, right: 15, padding: '18px', background: T.acc, color: '#000', borderRadius: '18px', fontWeight: '950', border: 'none' }}>FINISH</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TitanTracker;