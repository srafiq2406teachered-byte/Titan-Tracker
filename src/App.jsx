import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, ChevronLeft, BarChart3, Edit3, Save, ClipboardList, Timer } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. FULL TITLE MASTER LIBRARY ---
  const EXERCISE_LIBRARY = [
    { id: "leg_press", name: "Leg Press", muscle: "Quads", machine: "Seated Leg Press Sled", alt: "Dumbbell Goblet Squat", howTo: "Place feet shoulder-width. Lower until knees are 90°. Drive through heels." },
    { id: "chest_press", name: "Machine Chest Press", muscle: "Chest", machine: "Converging Chest Press", alt: "Flat Dumbbell Bench Press", howTo: "Handles at mid-chest level. Retract blades. Press forward." },
    { id: "seated_row", name: "Seated Cable Row", muscle: "Back", machine: "Cable Row Station", alt: "One-Arm Dumbbell Row", howTo: "Sit tall. Pull handle to navel. Squeeze shoulder blades." },
    { id: "overhead_press", name: "Shoulder Press Machine", muscle: "Shoulders", machine: "Vertical Press Machine", alt: "Dumbbell Overhead Press", howTo: "Press upward. Keep core tight. Head through 'window' at top." },
    { id: "lat_pulldown", name: "Lat Pulldown", muscle: "Lats", machine: "Wide Grip Cable Station", alt: "Assisted Pull-Up Machine", howTo: "Pull bar to upper chest. Focus on driving elbows down." },
    { id: "romanian_deadlift", name: "Romanian Deadlift", muscle: "Hamstrings", machine: "Smith Machine or Barbell", alt: "Dumbbell Romanian Deadlift", howTo: "Hinge hips back. Flat back. Lower until hamstrings stretch." },
    { id: "leg_extension", name: "Leg Extension", muscle: "Quads", machine: "Seated Leg Extension", alt: "Sissy Squat", howTo: "Extend legs fully. 1s squeeze at top. Controlled lowering." },
    { id: "leg_curl", name: "Leg Curl", muscle: "Hamstrings", machine: "Lying or Seated Leg Curl", alt: "Dumbbell Leg Curl", howTo: "Curl heels to glutes. Keep hips pressed into pad." },
    { id: "lateral_raise", name: "Lateral Raise", muscle: "Shoulders", machine: "Lateral Raise Machine", alt: "Dumbbell Lateral Raise", howTo: "Raise arms to sides. Lead with elbows. Stop at shoulder height." },
    { id: "walking_lunge", name: "Walking Lunge", muscle: "Legs", machine: "Open Floor Space", alt: "Split Squat", howTo: "Take a long step. Both knees at 90°. Keep torso upright." }
  ];

  // --- 2. STATE & PRE-MADE RESTORATION ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 93, height: 180, age: 43 });
  const [config, setConfig] = useState({ restTime: 60, theme: '#38bdf8' });
  const [plans, setPlans] = useState([
    { id: 'wA', name: "WORKOUT A: FOUNDATION", list: ["leg_press", "chest_press", "seated_row", "romanian_deadlift", "lateral_raise"] },
    { id: 'wB', name: "WORKOUT B: STRUCTURAL", machine: "deadlift", list: ["romanian_deadlift", "overhead_press", "lat_pulldown", "leg_extension", "lateral_raise"] },
    { id: 'wC', name: "WORKOUT C: HYPERTROPHY", list: ["walking_lunge", "chest_press", "seated_row", "leg_curl", "lateral_raise"] }
  ]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. PERSISTENCE & ANALYTICS ---
  const bmi = (bio.weight / ((bio.height/100)**2)).toFixed(1);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const saveAll = () => {
    localStorage.setItem('titan_v24_hybrid', JSON.stringify({ history, bio, config, plans }));
    alert("Profile, Workouts, and Timer Settings Saved!");
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: config.theme, text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V24</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'builder', i:<Edit3 size={18}/>}, {id:'intel', i:<BarChart3 size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN SESSION */}
        {view === 'menu' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setActiveSession(null)} style={{ background: T.card, border: 'none', color: T.text, padding: '8px', borderRadius: '8px' }}><ChevronLeft size={18}/></button>
                <div onClick={() => setTimeLeft(config.restTime)} style={{ background: T.acc, color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                    {timeLeft > 0 ? `${timeLeft}s` : 'START REST'}
                </div>
            </div>
            {activeSession.list.map(exId => {
              const ex = EXERCISE_LIBRARY.find(l => l.id === exId);
              if (!ex) return null;
              return (
                <div key={exId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name.toUpperCase()}</div>
                    <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                  </div>
                  {(sessionData[exId] || [{w:'', r:''}]).map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input type="number" placeholder="KG" value={s.w} onChange={e => {
                        const sets = [...(sessionData[exId] || [{w:'', r:''}])];
                        sets[i].w = parseInt(e.target.value) || '';
                        setSessionData({...sessionData, [exId]: sets});
                      }} style={{ width: '100%', background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                      <input type="number" placeholder="REPS" value={s.r} onChange={e => {
                        const sets = [...(sessionData[exId] || [{w:'', r:''}])];
                        sets[i].r = parseInt(e.target.value) || '';
                        setSessionData({...sessionData, [exId]: sets});
                      }} style={{ width: '100%', background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                      <button onClick={() => {
                        const sets = [...sessionData[exId]];
                        sets.splice(i, 1);
                        setSessionData({...sessionData, [exId]: sets});
                      }} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button onClick={() => setSessionData({...sessionData, [exId]: [...(sessionData[exId] || []), {w:'', r:''}]})} style={{ width: '100%', padding: '8px', background: T.card, border: 'none', borderRadius: '10px', color: T.acc, fontSize: '0.7em' }}>+ ADD SET</button>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW: WORKOUT BUILDER */}
        {view === 'builder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontWeight: '900', color: T.acc }}>WORKOUT ARCHITECT</h2>
            {plans.map((p, pIdx) => (
              <div key={p.id} style={{ background: T.surf, padding: '15px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <input value={p.name} onChange={e => {
                        const n = [...plans]; n[pIdx].name = e.target.value; setPlans(n);
                    }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: '900', width: '80%' }} />
                    <button onClick={() => { if(confirm('Delete?')) { const n = [...plans]; n.splice(pIdx, 1); setPlans(n); } }}><Trash2 size={16} color="#ef4444"/></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {p.list.map(eid => (
                        <span key={eid} style={{ fontSize: '0.6em', background: T.card, padding: '4px 10px', borderRadius: '20px' }}>
                            {EXERCISE_LIBRARY.find(l => l.id === eid)?.name}
                        </span>
                    ))}
                    <select onChange={e => {
                        if (e.target.value === "") return;
                        const n = [...plans]; n[pIdx].list.push(e.target.value); setPlans(n);
                        e.target.value = "";
                    }} style={{ background: T.acc, color: '#000', fontSize: '0.6em', borderRadius: '5px', border: 'none' }}>
                        <option value="">+ ADD EXERCISE</option>
                        {EXERCISE_LIBRARY.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                </div>
              </div>
            ))}
            <button onClick={() => setPlans([...plans, { id: Date.now(), name: "CUSTOM ROUTINE", list: [] }])} style={{ background: T.acc, color: '#000', padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>CREATE NEW ROUTINE</button>
          </div>
        )}

        {/* VIEW: INTEL & ANALYTICS */}
        {view === 'intel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontWeight: '900', color: T.acc }}>ANALYTICS</h2>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: T.card, padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6em', color: T.mute }}>BMI</div>
                    <div style={{ fontSize: '1.2em', fontWeight: '900' }}>{bmi}</div>
                </div>
                <div style={{ background: T.card, padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.6em', color: T.mute }}>AGE</div>
                    <div style={{ fontSize: '1.2em', fontWeight: '900' }}>{bio.age}</div>
                </div>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                   <label style={{ fontSize: '0.6em', color: T.mute }}>WEIGHT (KG)</label>
                   <input type="number" value={bio.weight} onChange={e => setBio({...bio, weight: parseInt(e.target.value) || 0})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '10px', color: '#fff' }} />
                </div>
                <div>
                   <label style={{ fontSize: '0.6em', color: T.mute }}>HEIGHT (CM)</label>
                   <input type="number" value={bio.height} onChange={e => setBio({...bio, height: parseInt(e.target.value) || 0})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '10px', color: '#fff' }} />
                </div>
              </div>
            </div>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <label style={{ fontSize: '0.6em', color: T.mute }}>REST TIMER (SECONDS)</label>
              <input type="number" value={config.restTime} onChange={e => setConfig({...config, restTime: parseInt(e.target.value) || 0})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '10px', color: '#fff', marginBottom: '15px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                {['#38bdf8', '#fbbf24', '#f472b6', '#4ade80'].map(c => (
                  <div key={c} onClick={() => setConfig({...config, theme: c})} style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, border: config.theme === c ? '2px solid white' : 'none' }} />
                ))}
              </div>
            </div>
            <button onClick={saveAll} style={{ background: T.acc, color: '#000', padding: '20px', borderRadius: '20px', fontWeight: '950', border: 'none', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Save size={20}/> SAVE ALL CONFIGURATIONS
            </button>
          </div>
        )}

        {/* VIEW: MENU (Select Workout) */}
        {view === 'menu' && !activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plans.map(p => (
              <div key={p.id} onClick={() => setActiveSession(p)} style={{ background: T.surf, padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${T.card}` }}>
                <span style={{ fontWeight: '900' }}>{p.name}</span>
                <Play size={20} color={T.acc} fill={T.acc}/>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAILED INFORMATION MODAL */}
      {howToEx && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 1000, padding: '30px', overflowY: 'auto' }}>
          <button onClick={() => setHowToEx(null)} style={{ background: T.card, border: 'none', color: '#fff', padding: '10px', borderRadius: '10px' }}><X size={20}/></button>
          <h2 style={{ fontWeight: '950', fontSize: '1.5em', marginTop: '20px', color: T.acc }}>{howToEx.name}</h2>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.card, padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '0.6em', color: T.acc, fontWeight: '900' }}>PRIMARY MACHINE</div>
              <div style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{howToEx.machine}</div>
            </div>
            <div style={{ background: T.card, padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontSize: '0.6em', color: '#fbbf24', fontWeight: '900' }}>ALTERNATIVE ACTIVITY</div>
              <div style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{howToEx.alt}</div>
            </div>
            <p style={{ lineHeight: '1.6', fontSize: '0.85em', color: T.mute }}>{howToEx.howTo}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
