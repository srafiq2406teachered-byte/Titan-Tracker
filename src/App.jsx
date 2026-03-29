import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, Flame, ChevronLeft, BarChart3, Target, Zap } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. DATA STRUCTURES ---
  const EX = {
    sq: { id: "sq", name: "Goblet Squat / Leg Press", muscle: "Quads", howTo: "Drive through heels. Keep chest up. Parallel depth." },
    bp: { id: "bp", name: "Flat Bench Press", muscle: "Chest", howTo: "Retract blades. Touch mid-chest. Drive feet." },
    row: { id: "row", name: "Chest Supported Row", muscle: "Back", howTo: "Squeeze blades. Elbows past torso. No swinging." },
    rdl: { id: "rdl", name: "Romanian Deadlift", muscle: "Hamstrings", howTo: "Hinge hips back. Flat back. Feel the stretch." },
    lat: { id: "lat", name: "Lateral Raises", muscle: "Shoulders", howTo: "Lead with elbows. Stop at shoulder height." },
    dl: { id: "dl", name: "Deadlift (Conventional)", muscle: "Full Body", howTo: "Mid-foot under bar. Pull slack. Stand tall." },
    ohp: { id: "ohp", name: "Overhead Press", muscle: "Shoulders", howTo: "Glutes tight. Press vertical. Head through window." },
    lp: { id: "lp", name: "Lat Pulldown", muscle: "Back", howTo: "Pull to upper chest. Elbows down and back." },
    le: { id: "le", name: "Leg Extensions", muscle: "Quads", howTo: "Full extension. 1s squeeze at top. Slow down." },
    fp: { id: "fp", name: "Face Pulls", muscle: "Rear Delts", howTo: "Pull to forehead. External rotation. Squeeze." },
    lun: { id: "lun", name: "Walking Lunges", muscle: "Legs", howTo: "Long steps. 90-degree angles. Stable core." },
    inc: { id: "inc", name: "Incline Machine Press", muscle: "Upper Chest", howTo: "Handles mid-chest. 45-degree angle press." },
    sr: { id: "sr", name: "Seated Cable Row", muscle: "Back", howTo: "Legs slightly bent. Pull to navel. Squeeze." },
    lc: { id: "lc", name: "Leg Curls", muscle: "Hamstrings", howTo: "Hips down. Heels to glutes. Controlled return." },
    arm: { id: "arm", name: "Bicep/Tricep Superset", muscle: "Arms", howTo: "Curls then Pushdowns. Zero rest between." }
  };

  const RECOMP_PLAN = [
    { id: 'wA', name: "WORKOUT A: FOUNDATION", list: [EX.sq, EX.bp, EX.row, EX.rdl, EX.lat] },
    { id: 'wB', name: "WORKOUT B: STRUCTURAL", list: [EX.dl, EX.ohp, EX.lp, EX.le, EX.fp] },
    { id: 'wC', name: "WORKOUT C: HYPERTROPHY", list: [EX.lun, EX.inc, EX.sr, EX.lc, EX.arm] }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 43 });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v19_intel');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.history) setHistory(data.history);
      if (data.bio) setBio(data.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v19_intel', JSON.stringify({ history, bio }));
  }, [history, bio]);

  const startWorkout = (routine) => {
    const list = routine.list.map(ex => ({ ...ex, instId: `${ex.id}-${Math.random()}` }));
    setActiveSession({ ...routine, list });
    setSessionData({});
    setView('train');
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V19</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'intel', i:<BarChart3 size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: (view === n.id && !activeSession) ? T.acc : 'transparent', color: (view === n.id && !activeSession) ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN */}
        {view === 'train' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => { if(confirm('Exit?')) { setActiveSession(null); setView('menu'); } }} style={{ alignSelf: 'flex-start', background: T.card, border: 'none', color: T.text, padding: '8px', borderRadius: '8px' }}><ChevronLeft size={18}/></button>
            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name.toUpperCase()}</div>
                  <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="number" placeholder="KG" onChange={e => {
                    const sets = sessionData[ex.instId] || [{w:'', r:''}];
                    sets[0].w = e.target.value;
                    setSessionData({...sessionData, [ex.instId]: [...sets]});
                  }} style={{ width: '80px', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                  <input type="number" placeholder="REPS" onChange={e => {
                    const sets = sessionData[ex.instId] || [{w:'', r:''}];
                    sets[0].r = e.target.value;
                    setSessionData({...sessionData, [ex.instId]: [...sets]});
                  }} style={{ width: '80px', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: MENU */}
        {view === 'menu' && !activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RECOMP_PLAN.map(r => (
              <div key={r.id} onClick={() => startWorkout(r)} style={{ background: T.surf, padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '900' }}>{r.name}</div>
                <Play size={20} fill={T.acc} color={T.acc}/>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: INTELLIGENCE (NEW PAGE) */}
        {view === 'intel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontSize: '1.2em', fontWeight: '950', color: T.acc }}>CORE METRICS</h2>
            
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px', borderLeft: `4px solid ${T.acc}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '10px' }}><Zap size={18}/> PROGRESSIVE VOLUME</div>
              <p style={{ fontSize: '0.75em', color: T.mute, lineHeight: '1.6' }}>
                **What it tells you:** The total work ($Sets \times Reps \times Load$) per muscle. <br/><br/>
                **How to use:** For body recomp, this number must trend UP over months. If Volume goes up but Body Weight stays flat, you are adding muscle and losing fat.
              </p>
            </div>

            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px', borderLeft: `4px solid #818cf8` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '10px' }}><Target size={18}/> RPE (EFFORT SCALE)</div>
              <p style={{ fontSize: '0.75em', color: T.mute, lineHeight: '1.6' }}>
                **What it tells you:** How many reps you had "in the tank." <br/><br/>
                **How to use:** Aim for RPE 8-9 (1-2 reps left). If every set is RPE 10 (failure), you risk injury. If RPE is 5, you aren't stimulating muscle growth.
              </p>
            </div>

            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px', borderLeft: `4px solid #fbbf24` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '10px' }}><Activity size={18}/> STRENGTH-TO-WEIGHT</div>
              <p style={{ fontSize: '0.75em', color: T.mute, lineHeight: '1.6' }}>
                **What it tells you:** Your relative power. <br/><br/>
                **Calculation:** Max Lift ÷ Body Weight. This is the ultimate "Lean" indicator. As fat drops, this ratio climbs.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* HOW-TO OVERLAY */}
      {howToEx && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 1000, padding: '30px' }}>
          <button onClick={() => setHowToEx(null)} style={{ background: T.card, border: 'none', color: '#fff', padding: '10px', borderRadius: '10px' }}><X size={20}/></button>
          <h2 style={{ fontWeight: '950', fontSize: '1.5em', marginTop: '20px' }}>{howToEx.name}</h2>
          <p style={{ marginTop: '20px', color: T.mute }}>{howToEx.howTo}</p>
        </div>
      )}

      {/* LOG BUTTON */}
      {view === 'train' && activeSession && (
        <div style={{ position: 'fixed', bottom: 15, left: 15, right: 15 }}>
          <button onClick={() => {
            const details = activeSession.list.map(ex => ({ name: ex.name, sets: (sessionData[ex.instId] || []).filter(s => s.w && s.r) }));
            setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
            setActiveSession(null); setView('intel');
          }} style={{ width: '100%', padding: '20px', background: T.acc, color: '#000', borderRadius: '20px', fontWeight: '950', border: 'none' }}>LOG & ANALYZE</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
