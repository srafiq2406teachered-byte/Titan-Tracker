import React, { useState, useEffect, useMemo } from 'react';
import { Play, Settings, Activity, Plus, Trash2, Dumbbell, ShieldCheck, Zap } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. PRO-GRADE LIBRARY & PROGRAMS ---
  const EX = {
    sq: { id: "sq", name: "Back Squat", muscle: "Legs", tier: 1 },
    bp: { id: "bp", name: "Bench Press", muscle: "Chest", tier: 1 },
    dl: { id: "dl", name: "Deadlift", muscle: "Back", tier: 1 },
    ohp: { id: "ohp", name: "Overhead Press", muscle: "Shoulders", tier: 1 },
    row: { id: "row", name: "Barbell Row", muscle: "Back", tier: 1 },
    lat: { id: "lat", name: "Lat Pulldown", muscle: "Back", tier: 2 },
    cur: { id: "cur", name: "Bicep Curl", muscle: "Arms", tier: 3 },
    tri: { id: "tri", name: "Tricep Pushdown", muscle: "Arms", tier: 3 },
  };

  const PRO_PROGRAMS = [
    { id: 'sl55', name: "STRONGLIFTS 5x5 (A)", list: [EX.sq, EX.bp, EX.row], tag: "Strength" },
    { id: 'nipp', name: "NIPPARD PUSH (PRO)", list: [EX.bp, EX.ohp, EX.tri], tag: "Hypertrophy" },
    { id: 'isra', name: "RP FULL BODY (BASIC)", list: [EX.sq, EX.row, EX.ohp, EX.cur], tag: "Science" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [unit, setUnit] = useState('metric');
  const [history, setHistory] = useState([]);
  const [customRoutines, setCustomRoutines] = useState(PRO_PROGRAMS);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, gender: 'male' });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});

  // --- 3. CALCULATIONS ---
  const stats = useMemo(() => {
    let wKG = unit === 'metric' ? bio.weight : bio.weight * 0.453592;
    let hCM = unit === 'metric' ? bio.height : bio.height * 2.54;
    const bmi = (wKG / ((hCM / 100) ** 2)).toFixed(1);
    let bmr = (10 * wKG) + (6.25 * hCM) - (5 * bio.age) + (bio.gender === 'male' ? 5 : -161);
    return { bmi, bmr: Math.round(bmr), tdee: Math.round(bmr * 1.2) };
  }, [bio, unit]);

  const startWorkout = (routine) => {
    const list = routine.list.map(ex => ({ ...ex, instId: `${ex.id}-${Math.random()}` }));
    setActiveSession({ name: routine.name, list });
    setSessionData({});
    setView('train');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '15px', fontFamily: 'sans-serif', maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.2em', letterSpacing: '-1px' }}>TITAN<span style={{color: T.acc}}>V13</span></h1>
        <div style={{ display: 'flex', gap: '4px', background: T.surf, padding: '4px', borderRadius: '12px' }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '100px' }}>
        
        {/* SETTINGS: BIO + CALCULATORS */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px', border: `1px solid ${T.card}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '0.7em', color: T.acc }}>PROFILE CONFIG</span>
                <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')} style={{ background: T.acc, border: 'none', borderRadius: '6px', fontSize: '0.6em', fontWeight: '900', padding: '4px 8px' }}>{unit.toUpperCase()}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['weight', 'height', 'age'].map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '0.5em', color: T.mute, display: 'block', marginBottom: '4px' }}>{f.toUpperCase()}</label>
                    <input type="number" value={bio[f]} onChange={e => setBio({...bio, [f]: Number(e.target.value)})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: T.surf, padding: '15px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5em', fontWeight: '950', color: T.acc }}>{stats.bmi}</div>
                <div style={{ fontSize: '0.5em', color: T.mute }}>BODY MASS INDEX</div>
              </div>
              <div style={{ background: T.surf, padding: '15px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5em', fontWeight: '950', color: T.acc }}>{stats.tdee}</div>
                <div style={{ fontSize: '0.5em', color: T.mute }}>MAINTENANCE CALS</div>
              </div>
            </div>
          </div>
        )}

        {/* MENU: PRO PROGRAMS */}
        {view === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: `linear-gradient(135deg, ${T.acc}, #818cf8)`, padding: '25px', borderRadius: '28px', color: '#000' }}>
              <div style={{ fontWeight: '950', fontSize: '1.1em' }}>SELECT PROGRAM</div>
              <div style={{ fontSize: '0.6em', fontWeight: 'bold', opacity: 0.8 }}>Instructor-approved routines loaded.</div>
            </div>

            {customRoutines.map(r => (
              <div key={r.id} onClick={() => startWorkout(r)} style={{ background: T.surf, padding: '15px 20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${T.card}` }}>
                <div>
                  <div style={{ fontSize: '0.5em', color: T.acc, fontWeight: '900', marginBottom: '2px' }}>{r.tag}</div>
                  <div style={{ fontWeight: '900', fontSize: '0.9em' }}>{r.name}</div>
                </div>
                <Zap size={20} fill={T.acc} color={T.acc}/>
              </div>
            ))}
          </div>
        )}

        {/* TRAIN: REPS FIX */}
        {view === 'train' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2 style={{ fontSize: '1em', fontWeight: '950', color: T.acc }}>{activeSession.name}</h2>
            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '15px', borderRadius: '20px' }}>
                <div style={{ fontWeight: '900', fontSize: '0.8em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <Dumbbell size={14}/> {ex.name}
                </div>
                {(sessionData[ex.instId] || [{w:'', r:''}]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.7em', width: '15px', color: T.mute }}>{i+1}</div>
                    <input placeholder="Mass" value={s.w} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].w = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'center', padding: '10px', fontSize: '0.8em' }} />
                    <input placeholder="Reps" value={s.r} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].r = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '8px', color: '#fff', textAlign: 'center', padding: '10px', fontSize: '0.8em' }} />
                  </div>
                ))}
                <button onClick={() => {
                  const s = sessionData[ex.instId] || [];
                  setSessionData({...sessionData, [ex.instId]: [...s, {w: s[s.length-1]?.w || '', r: ''}]});
                }} style={{ width: '100%', padding: '8px', background: T.card, border: 'none', borderRadius: '10px', color: T.mute, fontSize: '0.6em' }}>+ ADD SET</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STICKY ACTION BAR */}
      {view === 'train' && activeSession && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: `linear-gradient(to top, ${T.bg}, transparent)`, pointerEvents: 'none' }}>
          <button onClick={() => { setActiveSession(null); setView('menu'); }} style={{ pointerEvents: 'auto', width: '100%', padding: '20px', background: T.acc, color: '#000', borderRadius: '20px', fontWeight: '950', border: 'none', boxShadow: '0 10px 30px rgba(56, 189, 248, 0.3)' }}>FINISH SESSION</button>
        </div>
      )}

    </div>
  );
};

export default TitanTracker;