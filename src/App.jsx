import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, Flame, ChevronLeft, Scale } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THE ENCYCLOPEDIA (Instructions for Recomp) ---
  const EX = {
    sq: { 
      id: "sq", name: "Goblet Squat / Leg Press", muscle: "Quads", 
      howTo: "1. Hold weight at chest height. 2. Spread feet shoulder-width. 3. Sit back until thighs are parallel to floor. 4. Drive up through heels. Keep core braced to protect lower back."
    },
    bp: { 
      id: "bp", name: "Flat Bench Press", muscle: "Chest", 
      howTo: "1. Lie flat, eyes under bar. 2. Grip bar slightly wider than shoulders. 3. Lower bar to mid-chest. 4. Press up while keeping feet planted and glutes on the bench."
    },
    row: { 
      id: "row", name: "Chest Supported Row", muscle: "Back", 
      howTo: "1. Lean chest against the pad. 2. Pull handles toward your ribcage. 3. Squeeze shoulder blades together at the top. 4. Controlled return to full stretch."
    },
    rdl: { 
      id: "rdl", name: "Romanian Deadlift", muscle: "Hamstrings", 
      howTo: "1. Hold bar/DBs at hip height. 2. Hinge at hips, pushing them back. 3. Lower weight until you feel a deep stretch in hamstrings. 4. Snap hips forward to stand."
    },
    lat: { 
      id: "lat", name: "Lateral Raises", muscle: "Shoulders", 
      howTo: "1. Stand tall, DBs at sides. 2. Raise arms out to the sides with a slight elbow bend. 3. Stop at shoulder height. 4. Lower slowly to maintain tension."
    },
    dl: { 
      id: "dl", name: "Deadlift (Conventional)", muscle: "Full Body", 
      howTo: "1. Mid-foot under bar. 2. Bend at waist to grip bar. 3. Drop hips until shins touch bar. 4. Pull chest up and stand up. Keep bar close to legs throughout."
    },
    ohp: { 
      id: "ohp", name: "Overhead Press", muscle: "Shoulders", 
      howTo: "1. Bar at collarbone. 2. Squeeze glutes and abs. 3. Press bar straight up until elbows lock. 4. Move head forward 'through the window' at the top."
    },
    lp: { 
      id: "lp", name: "Lat Pulldown", muscle: "Back", 
      howTo: "1. Grip bar wide. 2. Pull bar down to upper chest. 3. Lean back very slightly. 4. Focus on pulling with elbows, not hands."
    },
    le: { 
      id: "le", name: "Leg Extensions", muscle: "Quads", 
      howTo: "1. Set pad at ankles. 2. Extend legs fully. 3. Hold the peak contraction for 1 second. 4. Lower weight slowly."
    },
    fp: { 
      id: "fp", name: "Face Pulls", muscle: "Rear Delts", 
      howTo: "1. Rope at eye level. 2. Pull handles toward ears. 3. Pull apart at the end. 4. Focus on feeling the back of the shoulders work."
    },
    lun: { 
      id: "lun", name: "Walking Lunges", muscle: "Legs", 
      howTo: "1. Step forward and lower back knee toward floor. 2. Both knees should form 90-degree angles. 3. Drive up and step forward with the other leg."
    },
    inc: { 
      id: "inc", name: "Incline Machine Press", muscle: "Upper Chest", 
      howTo: "1. Adjust seat so handles are mid-chest. 2. Press upward at a 45-degree angle. 3. Don't lock elbows fully to keep tension on the upper pec."
    },
    sr: { 
      id: "sr", name: "Seated Cable Row", muscle: "Back", 
      howTo: "1. Feet on pads, knees slightly bent. 2. Pull handle to stomach. 3. Pull elbows behind your back. 4. Don't lean back excessively."
    },
    lc: { 
      id: "lc", name: "Leg Curls", muscle: "Hamstrings", 
      howTo: "1. Align knees with the machine hinge. 2. Curl heels toward glutes. 3. Control the weight as your legs straighten."
    },
    arm: { 
      id: "arm", name: "Bicep/Tricep Superset", muscle: "Arms", 
      howTo: "1. Perform Bicep Curls (elbows tucked). 2. Immediately switch to Tricep Pushdowns (lock elbows at bottom). No rest between these two movements."
    }
  };

  const RECOMP_PLAN = [
    { id: 'wA', name: "WORKOUT A: FOUNDATION", list: [EX.sq, EX.bp, EX.row, EX.rdl, EX.lat] },
    { id: 'wB', name: "WORKOUT B: STRUCTURAL", list: [EX.dl, EX.ohp, EX.lp, EX.le, EX.fp] },
    { id: 'wC', name: "WORKOUT C: HYPERTROPHY", list: [EX.lun, EX.inc, EX.sr, EX.lc, EX.arm] }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [unit, setUnit] = useState('metric');
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 43, gender: 'male' });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);

  // --- 3. RECOVERY ---
  useEffect(() => {
    const saved = localStorage.getItem('titan_v18_final');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.history) setHistory(data.history);
      if (data.bio) setBio(data.bio);
      if (data.unit) setUnit(data.unit);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v18_final', JSON.stringify({ history, bio, unit }));
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
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V18</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'metrics', i:<Activity size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: (view === n.id && !activeSession) ? T.acc : 'transparent', color: (view === n.id && !activeSession) ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN */}
        {view === 'train' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => { if(confirm('Exit workout?')) { setActiveSession(null); setView('menu'); } }} style={{ background: T.card, border: 'none', color: T.text, padding: '8px', borderRadius: '8px' }}><ChevronLeft size={18}/></button>
              <h2 style={{ fontSize: '0.9em', fontWeight: '900' }}>{activeSession.name}</h2>
            </div>

            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name.toUpperCase()}</div>
                  <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <input type="number" placeholder="KG" value={sessionData[ex.instId]?.[0]?.w || ''} onChange={e => {
                    const sets = sessionData[ex.instId] || [{w:'', r:''}];
                    sets[0].w = e.target.value;
                    setSessionData({...sessionData, [ex.instId]: [...sets]});
                  }} style={{ width: '80px', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                  <input type="number" placeholder="REPS" value={sessionData[ex.instId]?.[0]?.r || ''} onChange={e => {
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
              <div key={r.id} onClick={() => startWorkout(r)} style={{ background: T.surf, padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${T.card}` }}>
                <div style={{ fontWeight: '900' }}>{r.name}</div>
                <Play size={20} fill={T.acc} color={T.acc}/>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: SETTINGS (RESTORED) */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: T.acc, fontWeight: '900', fontSize: '0.7em', marginBottom: '15px' }}><Scale size={16}/> BIOMETRIC CONFIG</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['weight', 'height', 'age'].map(k => (
                  <div key={k}>
                    <label style={{ fontSize: '0.5em', color: T.mute }}>{k.toUpperCase()}</label>
                    <input type="number" value={bio[k]} onChange={e => setBio({...bio, [k]: Number(e.target.value)})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '10px', color: '#fff' }} />
                  </div>
                ))}
                <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')} style={{ background: T.acc, border: 'none', borderRadius: '10px', fontWeight: 'bold', height: '45px', alignSelf: 'end' }}>{unit.toUpperCase()}</button>
              </div>
            </div>
            <button onClick={() => { if(confirm('Reset all?')) { localStorage.clear(); location.reload(); } }} style={{ color: '#ef4444', fontSize: '0.7em', fontWeight: 'bold', background: 'none', border: 'none' }}>WIPE ALL DATA</button>
          </div>
        )}

        {/* VIEW: METRICS */}
        {view === 'metrics' && (
          <div style={{ color: T.mute, textAlign: 'center', marginTop: '40px', fontSize: '0.8em' }}>History Log: {history.length} workouts.</div>
        )}

      </div>

      {/* HOW-TO OVERLAY (THE NEW PAGE) */}
      {howToEx && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 1000, padding: '30px', display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => setHowToEx(null)} style={{ alignSelf: 'flex-start', background: T.card, border: 'none', color: '#fff', padding: '10px', borderRadius: '10px', marginBottom: '30px' }}><X size={20}/></button>
          <div style={{ color: T.acc, fontSize: '0.6em', fontWeight: '900', letterSpacing: '2px' }}>EXERCISE GUIDE</div>
          <h2 style={{ fontWeight: '950', fontSize: '1.5em', margin: '10px 0' }}>{howToEx.name}</h2>
          <div style={{ background: T.surf, padding: '2px 10px', borderRadius: '6px', fontSize: '0.7em', display: 'inline-block', width: 'fit-content', color: T.acc }}>Target: {howToEx.muscle}</div>
          <p style={{ marginTop: '30px', lineHeight: '1.8', fontSize: '0.9em', color: T.text }}>{howToEx.howTo}</p>
          <div style={{ marginTop: 'auto', background: T.card, padding: '20px', borderRadius: '20px', borderLeft: `4px solid ${T.acc}` }}>
            <div style={{ fontSize: '0.7em', fontWeight: 'bold', color: T.acc }}>RECOMP TIP</div>
            <div style={{ fontSize: '0.8em', marginTop: '5px' }}>Always prioritize form over weight. For fat loss, keep rest to 60s. For muscle gain, control the eccentric (lowering phase).</div>
          </div>
        </div>
      )}

      {/* FOOTER ACTION */}
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
