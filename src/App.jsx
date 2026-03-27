import React, { useState, useEffect, useMemo } from 'react';
import { Play, Settings, Activity, Plus, Trash2, Dumbbell, Zap, ChevronRight, History } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. PRO DATA & PROGRAMS ---
  const EX = {
    sq: { id: "sq", name: "Squat", muscle: "Legs", tier: 1 },
    bp: { id: "bp", name: "Bench Press", muscle: "Chest", tier: 1 },
    dl: { id: "dl", name: "Deadlift", muscle: "Back", tier: 1 },
    ohp: { id: "ohp", name: "Military Press", muscle: "Shoulders", tier: 1 },
    row: { id: "row", name: "BB Row", muscle: "Back", tier: 1 },
    cur: { id: "cur", name: "Bicep Curl", muscle: "Arms", tier: 3 },
  };

  const PRO_PROGRAMS = [
    { id: 'sl55', name: "STRONGLIFTS 5x5", list: [EX.sq, EX.bp, EX.row], tag: "Strength" },
    { id: 'ppl', name: "PRO PUSH DAY", list: [EX.bp, EX.ohp, EX.cur], tag: "Hypertrophy" }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [unit, setUnit] = useState('metric');
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, gender: 'male' });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});

  // --- 3. THE "RECOVERY" PERSISTENCE ---
  useEffect(() => {
    // Attempt to pull from ALL previous version keys to prevent data loss
    const v11 = localStorage.getItem('titan_v11_master');
    const v12 = localStorage.getItem('titan_v12_final');
    const v14 = localStorage.getItem('titan_v14_vault');
    
    const combined = JSON.parse(v14 || v12 || v11 || '{}');
    if (combined.history) setHistory(combined.history);
    if (combined.bio) setBio(combined.bio);
    if (combined.unit) setUnit(combined.unit || 'metric');
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v14_vault', JSON.stringify({ history, bio, unit }));
  }, [history, bio, unit]);

  // --- 4. ANALYTICS ---
  const muscleHeat = useMemo(() => {
    const stats = { Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0 };
    history.forEach(s => s.details?.forEach(ex => {
      const m = Object.values(EX).find(e => e.name === ex.name)?.muscle || "Other";
      if (stats[m] !== undefined) stats[m] += ex.sets.length;
    }));
    return stats;
  }, [history]);

  const stats = useMemo(() => {
    let w = unit === 'metric' ? bio.weight : bio.weight * 0.453;
    let h = unit === 'metric' ? bio.height : bio.height * 2.54;
    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    const bmr = (10 * w) + (6.25 * h) - (5 * bio.age) + (bio.gender === 'male' ? 5 : -161);
    return { bmi, tdee: Math.round(bmr * 1.2) };
  }, [bio, unit]);

  const startWorkout = (routine) => {
    const list = routine.list.map(ex => ({ ...ex, instId: `${ex.id}-${Math.random()}` }));
    setActiveSession({ name: routine.name, list });
    setSessionData({});
    setView('train');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V14</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'metrics', i:<Activity size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px', transition: '0.2s' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN (THE REPS-OFF-SCREEN FIX) */}
        {view === 'train' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h2 style={{ fontSize: '1em', fontWeight: '950', color: T.acc }}>{activeSession.name}</h2>
            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '12px', borderRadius: '18px', border: `1px solid ${T.card}` }}>
                <div style={{ fontWeight: '900', fontSize: '0.85em', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                   <span>{ex.name.toUpperCase()}</span>
                   <span style={{color: T.mute, fontSize: '0.7em'}}>{ex.muscle}</span>
                </div>
                
                {/* HEADERS TO PREVENT CONFUSION */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '4px', paddingLeft: '28px' }}>
                  <span style={{ width: '80px', fontSize: '0.5em', color: T.mute }}>MASS ({unit === 'metric' ? 'KG' : 'LB'})</span>
                  <span style={{ width: '80px', fontSize: '0.5em', color: T.mute }}>REPS</span>
                </div>

                {(sessionData[ex.instId] || [{w:'', r:''}]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ width: '20px', fontSize: '0.7em', color: T.acc, fontWeight: 'bold' }}>{i+1}</div>
                    
                    {/* FIXED WIDTH INPUTS PREVENT OVERFLOW */}
                    <input type="number" placeholder="0" value={s.w} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].w = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '80px', background: T.bg, border: '1px solid #334155', borderRadius: '8px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                    
                    <input type="number" placeholder="0" value={s.r} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].r = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '80px', background: T.bg, border: '1px solid #334155', borderRadius: '8px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                    
                    {i > 0 && <button onClick={() => {
                      const sets = sessionData[ex.instId].filter((_, idx) => idx !== i);
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ background: 'none', border: 'none', color: '#ef4444', padding: '5px' }}><Trash2 size={14}/></button>}
                  </div>
                ))}
                
                <button onClick={() => {
                  const s = sessionData[ex.instId] || [];
                  setSessionData({...sessionData, [ex.instId]: [...s, {w: s[s.length-1]?.w || '', r: ''}]});
                }} style={{ width: '100%', padding: '10px', background: T.card, border: 'none', borderRadius: '10px', color: T.acc, fontSize: '0.7em', fontWeight: 'bold' }}>+ ADD SET</button>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: METRICS (RECOVERED ACTIVITIES) */}
        {view === 'metrics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px', textAlign: 'center' }}>
              <div style={{ color: T.acc, fontSize: '0.6em', fontWeight: '900', letterSpacing: '2px', marginBottom: '15px' }}>ANATOMICAL LOAD</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {Object.entries(muscleHeat).map(([m, val]) => (
                  <div key={m} style={{ background: T.bg, padding: '10px', borderRadius: '12px', border: `1px solid ${val > 0 ? T.acc : T.card}` }}>
                    <div style={{ fontSize: '0.5em', color: T.mute }}>{m.toUpperCase()}</div>
                    <div style={{ fontSize: '1em', fontWeight: '900', color: val > 0 ? T.acc : T.text }}>{val} <span style={{fontSize: '0.5em'}}>sets</span></div>
                  </div>
                ))}
              </div>
            </div>

            <h3 style={{ fontSize: '0.7em', color: T.acc, fontWeight: '900' }}>ACTIVITY HISTORY ({history.length})</h3>
            {history.map((h, i) => (
              <div key={i} style={{ background: T.surf, padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', borderLeft: `4px solid ${T.acc}` }}>
                <div>
                  <div style={{ fontSize: '0.8em', fontWeight: 'bold' }}>{h.name}</div>
                  <div style={{ fontSize: '0.6em', color: T.mute }}>{h.date}</div>
                </div>
                <ChevronRight size={16} color={T.mute}/>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: MENU (PROGRAM SELECTION) */}
        {view === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: T.acc, padding: '25px', borderRadius: '28px', color: '#000' }}>
              <div style={{ fontWeight: '950', fontSize: '1.2em' }}>READY TO WORK?</div>
              <div style={{ fontSize: '0.7em', fontWeight: 'bold', opacity: 0.8 }}>BMI: {stats.bmi} • Daily: {stats.tdee} kcal</div>
            </div>
            {PRO_PROGRAMS.map(r => (
              <div key={r.id} onClick={() => startWorkout(r)} style={{ background: T.surf, padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: `1px solid ${T.card}` }}>
                <div>
                  <div style={{ fontSize: '0.5em', color: T.acc, fontWeight: '900' }}>{r.tag}</div>
                  <div style={{ fontWeight: '900' }}>{r.name}</div>
                </div>
                <Play size={20} fill={T.acc} color={T.acc}/>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '0.7em', color: T.acc, fontWeight: '900', marginBottom: '15px' }}>CALCULATOR CONFIG</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {['weight', 'height', 'age'].map(f => (
                  <div key={f}>
                    <label style={{ fontSize: '0.5em', color: T.mute }}>{f.toUpperCase()}</label>
                    <input type="number" value={bio[f]} onChange={e => setBio({...bio, [f]: Number(e.target.value)})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '10px', color: '#fff', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')} style={{ background: T.acc, border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>{unit.toUpperCase()}</button>
              </div>
            </div>
            <button onClick={() => { if(confirm('Wipe everything?')) { localStorage.clear(); location.reload(); } }} style={{ color: '#ef4444', fontSize: '0.7em', fontWeight: 'bold', background: 'none', border: 'none' }}>RESET ALL DATA</button>
          </div>
        )}

      </div>

      {/* STICKY FINISH BAR */}
      {view === 'train' && activeSession && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '15px', background: `linear-gradient(transparent, ${T.bg} 30%)` }}>
          <button onClick={() => {
            const details = activeSession.list.map(ex => ({ name: ex.name, sets: (sessionData[ex.instId] || []).filter(s => s.w && s.r) }));
            setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
            setActiveSession(null); 
            setView('metrics');
          }} style={{ width: '100%', padding: '18px', background: T.acc, color: '#000', borderRadius: '18px', fontWeight: '950', border: 'none', boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>FINISH & LOG SESSION</button>
        </div>
      )}

    </div>
  );
};

export default TitanTracker;