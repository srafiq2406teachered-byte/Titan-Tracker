import React, { useState, useEffect, useMemo } from 'react';
import { Play, Settings, Activity, Plus, Trash2, Dumbbell, Search, X, Info, Flame, ChevronLeft } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. RECOMP PROGRAM DATA ---
  const EX = {
    sq: { id: "sq", name: "Goblet Squat / Leg Press", muscle: "Quads", tip: "Drive through heels. Keep chest up." },
    bp: { id: "bp", name: "Flat Bench Press", muscle: "Chest", tip: "Retract shoulder blades. Touch mid-chest." },
    row: { id: "row", name: "Chest Supported Row", muscle: "Back", tip: "Squeeze shoulder blades at the peak." },
    rdl: { id: "rdl", name: "Romanian Deadlift", muscle: "Hamstrings", tip: "Hinge at hips. Feel the stretch." },
    lat: { id: "lat", name: "Lateral Raises", muscle: "Shoulders", tip: "Lead with elbows. Slight forward lean." },
    dl: { id: "dl", name: "Deadlift (Conventional)", muscle: "Full Body", tip: "Tight core. Pull the slack out of bar." },
    ohp: { id: "ohp", name: "Overhead Press", muscle: "Shoulders", tip: "Glutes tight. Push head through at top." },
    lp: { id: "lp", name: "Lat Pulldown", muscle: "Back", tip: "Pull to upper chest. Don't swing." },
    le: { id: "le", name: "Leg Extensions", muscle: "Quads", tip: "Hold the squeeze for 1 second." },
    fp: { id: "fp", name: "Face Pulls", muscle: "Rear Delts", tip: "Pull toward forehead. External rotation." },
    lun: { id: "lun", name: "Walking Lunges", muscle: "Legs", tip: "Long steps for glutes, short for quads." },
    inc: { id: "inc", name: "Incline Machine Press", muscle: "Upper Chest", tip: "Focus on the upper pec stretch." },
    sr: { id: "sr", name: "Seated Cable Row", muscle: "Back", tip: "Don't use momentum. Controlled return." },
    lc: { id: "lc", name: "Leg Curls", muscle: "Hamstrings", tip: "Keep hips glued to the bench." },
    arm: { id: "arm", name: "Bicep/Tricep Superset", muscle: "Arms", tip: "No rest between the two exercises." }
  };

  const RECOMP_PLAN = [
    { id: 'wA', name: "WORKOUT A: FOUNDATION", list: [EX.sq, EX.bp, EX.row, EX.rdl, EX.lat], desc: "Focus: Heavy compounds to spark metabolism." },
    { id: 'wB', name: "WORKOUT B: STRUCTURAL", list: [EX.dl, EX.ohp, EX.lp, EX.le, EX.fp], desc: "Focus: Posterior chain and pulling power." },
    { id: 'wC', name: "WORKOUT C: HYPERTROPHY", list: [EX.lun, EX.inc, EX.sr, EX.lc, EX.arm], desc: "Focus: High volume to maximize muscle pump." }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [unit, setUnit] = useState('metric');
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 30, gender: 'male' });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v17_nav');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.history) setHistory(data.history);
      if (data.bio) setBio(data.bio);
      if (data.unit) setUnit(data.unit);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v17_nav', JSON.stringify({ history, bio, unit }));
  }, [history, bio, unit]);

  const startWorkout = (routine) => {
    const list = routine.list.map(ex => ({ ...ex, instId: `${ex.id}-${Math.random()}` }));
    setActiveSession({ ...routine, list });
    setSessionData({});
    setView('train');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* THE NEW BACK BUTTON */}
          {activeSession && view === 'train' && (
            <button onClick={() => { if(confirm('Discard this session?')) { setActiveSession(null); setView('menu'); } }} style={{ background: T.card, border: 'none', color: T.text, padding: '6px', borderRadius: '8px' }}>
              <ChevronLeft size={20}/>
            </button>
          )}
          <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V17</span></h1>
        </div>
        
        {/* VIEW TOGGLES (Hidden during training to focus) */}
        {!activeSession && (
          <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
            {[ {id:'menu', i:<Play size={18}/>}, {id:'metrics', i:<Activity size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
              <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN */}
        {view === 'train' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: `linear-gradient(45deg, ${T.surf}, ${T.card})`, padding: '15px', borderRadius: '15px', borderLeft: `4px solid ${T.acc}` }}>
              <div style={{ color: T.acc, fontWeight: 'bold', fontSize: '0.7em', marginBottom: '4px' }}>CURRENT PROGRAM</div>
              <div style={{ fontWeight: '900', fontSize: '1em' }}>{activeSession.name}</div>
              <div style={{ fontSize: '0.75em', color: T.mute, marginTop: '4px' }}>{activeSession.desc}</div>
            </div>

            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name.toUpperCase()}</div>
                  <div style={{ fontSize: '0.65em', color: T.acc }}>{ex.tip}</div>
                </div>

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
                }} style={{ width: '100%', padding: '10px', background: T.card, border: 'none', borderRadius: '12px', color: T.mute, fontSize: '0.7em' }}>+ ADD SET</button>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: MENU */}
        {view === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: T.acc, padding: '25px', borderRadius: '28px', color: '#000' }}>
              <div style={{ fontWeight: '950', fontSize: '1.2em' }}>START SESSION</div>
              <div style={{ fontSize: '0.7em', fontWeight: 'bold' }}>3 Day Full Body Recomp Protocol</div>
            </div>
            
            {RECOMP_PLAN.map(r => (
              <div key={r.id} onClick={() => startWorkout(r)} style={{ background: T.surf, padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${T.card}` }}>
                <div>
                  <div style={{ fontSize: '0.55em', color: T.acc, fontWeight: '900' }}>ACTIVE PROGRAM</div>
                  <div style={{ fontWeight: '900' }}>{r.name}</div>
                </div>
                <Play size={20} fill={T.acc} color={T.acc}/>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: METRICS */}
        {view === 'metrics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <h3 style={{ fontSize: '0.8em', color: T.acc, fontWeight: '900' }}>SESSION LOGS</h3>
             {history.length === 0 ? (
               <div style={{ color: T.mute, fontSize: '0.7em', textAlign: 'center', marginTop: '20px' }}>No workouts logged yet.</div>
             ) : (
               history.map((h, i) => (
                 <div key={i} style={{ background: T.surf, padding: '15px', borderRadius: '15px' }}>
                   <div style={{ fontSize: '0.8em', fontWeight: 'bold' }}>{h.name}</div>
                   <div style={{ fontSize: '0.6em', color: T.mute }}>{h.date}</div>
                 </div>
               ))
             )}
          </div>
        )}

      </div>

      {/* LOG WORKOUT FOOTER */}
      {view === 'train' && activeSession && (
        <div style={{ position: 'fixed', bottom: 15, left: 15, right: 15 }}>
          <button onClick={() => {
            const details = activeSession.list.map(ex => ({ name: ex.name, sets: (sessionData[ex.instId] || []).filter(s => s.w && s.r) }));
            setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
            setActiveSession(null); setView('menu');
          }} style={{ width: '100%', padding: '20px', background: T.acc, color: '#000', borderRadius: '20px', fontWeight: '950', border: 'none' }}>COMPLETE & LOG</button>
        </div>
      )}

    </div>
  );
};

export default TitanTracker;
