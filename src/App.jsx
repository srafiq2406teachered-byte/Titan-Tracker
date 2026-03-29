import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, ChevronLeft, BarChart3, Edit3, Save, ClipboardList, Timer, Heart } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. EXPANDED LIBRARY (STRENGTH + CARDIO) ---
  const EXERCISE_LIBRARY = [
    { id: "leg_press", name: "Leg Press", muscle: "Quads", machine: "Seated Leg Press Sled", alt: "Dumbbell Goblet Squat", howTo: "Feet shoulder-width. Lower until knees 90°. Drive through heels." },
    { id: "chest_press", name: "Machine Chest Press", muscle: "Chest", machine: "Converging Chest Press", alt: "Flat Dumbbell Bench Press", howTo: "Handles at mid-chest. Retract blades. Press forward." },
    { id: "seated_row", name: "Seated Cable Row", muscle: "Back", machine: "Cable Row Station", alt: "One-Arm Dumbbell Row", howTo: "Sit tall. Pull handle to navel. Squeeze shoulder blades." },
    { id: "overhead_press", name: "Shoulder Press Machine", muscle: "Shoulders", machine: "Vertical Press Machine", alt: "Dumbbell Overhead Press", howTo: "Press upward. Keep core tight. Head through window at top." },
    { id: "lat_pulldown", name: "Lat Pulldown", muscle: "Lats", machine: "Wide Grip Cable Station", alt: "Assisted Pull-Up Machine", howTo: "Pull bar to upper chest. Drive elbows down." },
    { id: "romanian_deadlift", name: "Romanian Deadlift", muscle: "Hamstrings", machine: "Smith Machine or Barbell", alt: "Dumbbell Romanian Deadlift", howTo: "Hinge hips back. Flat back. Lower until hamstrings stretch." },
    { id: "lateral_raise", name: "Lateral Raise", muscle: "Shoulders", machine: "Lateral Raise Machine", alt: "Dumbbell Lateral Raise", howTo: "Raise arms to sides. Lead with elbows. Stop at shoulder height." },
    // --- CARDIO ADDITIONS ---
    { id: "treadmill", name: "Treadmill Incline Walk", muscle: "Cardio", machine: "Treadmill", alt: "Outdoor Incline Walk", howTo: "Set incline to 5-10%. Walk at 4.5-5.5 km/h. Keep hands off rails to maximize burn." },
    { id: "stationary_bike", name: "Stationary Bike", muscle: "Cardio", machine: "Upright or Recumbent Bike", alt: "Outdoor Cycling", howTo: "Maintain 70-80 RPM. Aim for Zone 2 (can talk but slightly breathless)." },
    { id: "rowing_machine", name: "Rowing Machine", muscle: "Cardio/Back", machine: "Concept2 or Water Rower", alt: "Burpees", howTo: "Drive with legs first, then lean back, then pull with arms. Reverse on return." },
    { id: "stair_climber", name: "Stair Climber", muscle: "Cardio/Glutes", machine: "Stairmaster", alt: "Step-ups", howTo: "Stand upright. Take full steps. Avoid leaning on the side handles." }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 93, height: 180, age: 43 });
  const [config, setConfig] = useState({ restTime: 60, theme: '#38bdf8' });
  const [plans, setPlans] = useState([
    { id: 'wA', name: "WORKOUT A: FOUNDATION", list: ["leg_press", "chest_press", "seated_row", "lateral_raise", "treadmill"] },
    { id: 'wB', name: "WORKOUT B: STRUCTURAL", list: ["romanian_deadlift", "overhead_press", "lat_pulldown", "lateral_raise", "stationary_bike"] },
    { id: 'wC', name: "WORKOUT C: HYPERTROPHY", list: ["chest_press", "seated_row", "lateral_raise", "stair_climber"] }
  ]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. BMI LOGIC ---
  const heightM = bio.height / 100;
  const bmiVal = (bio.weight / (heightM * heightM)).toFixed(1);
  
  const getBmiInfo = (val) => {
    if (val < 18.5) return { cat: "Underweight", col: "#60a5fa", tip: "Focus on caloric surplus." };
    if (val < 25) return { cat: "Healthy", col: "#4ade80", tip: "Maintain current composition." };
    if (val < 30) return { cat: "Overweight", col: "#fbbf24", tip: "Ideal for Recomposition (Muscle up, Fat down)." };
    return { cat: "Obese", col: "#ef4444", tip: "Focus on consistent deficit and low-impact cardio." };
  };
  const bmiInfo = getBmiInfo(parseFloat(bmiVal));

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const saveAll = () => {
    localStorage.setItem('titan_v25', JSON.stringify({ history, bio, config, plans }));
    alert("Configurations Saved Successfully!");
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: config.theme, text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V25</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'builder', i:<Edit3 size={18}/>}, {id:'intel', i:<BarChart3 size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN */}
        {view === 'menu' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setActiveSession(null)} style={{ background: T.card, border: 'none', color: T.text, padding: '8px', borderRadius: '8px' }}><ChevronLeft size={18}/></button>
                <div onClick={() => setTimeLeft(config.restTime)} style={{ background: T.acc, color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{timeLeft > 0 ? `${timeLeft}s` : 'REST'}</div>
            </div>
            {activeSession.list.map(exId => {
              const ex = EXERCISE_LIBRARY.find(l => l.id === exId);
              const isCardio = ex?.muscle === 'Cardio';
              return (
                <div key={exId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '900', fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {isCardio && <Heart size={14} color={T.acc}/>} {ex?.name.toUpperCase()}
                    </div>
                    <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                  </div>
                  {(sessionData[exId] || [{w:'', r:''}]).map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input type="number" placeholder={isCardio ? "KM/H" : "KG"} value={s.w} onChange={e => {
                        const sets = [...(sessionData[exId] || [{w:'', r:''}])];
                        sets[i].w = parseInt(e.target.value) || '';
                        setSessionData({...sessionData, [exId]: sets});
                      }} style={{ width: '100%', background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                      <input type="number" placeholder={isCardio ? "MINS" : "REPS"} value={s.r} onChange={e => {
                        const sets = [...(sessionData[exId] || [{w:'', r:''}])];
                        sets[i].r = parseInt(e.target.value) || '';
                        setSessionData({...sessionData, [exId]: sets});
                      }} style={{ width: '100%', background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                      <button onClick={() => { const sets = [...sessionData[exId]]; sets.splice(i, 1); setSessionData({...sessionData, [exId]: sets}); }} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button onClick={() => setSessionData({...sessionData, [exId]: [...(sessionData[exId] || []), {w:'', r:''}]})} style={{ width: '100%', padding: '8px', background: T.card, border: 'none', borderRadius: '10px', color: T.acc, fontSize: '0.7em' }}>+ ADD SET/INTERVAL</button>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW: INTEL (BMI DIAGNOSTIC) */}
        {view === 'intel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontWeight: '900', color: T.acc }}>HEALTH INTELLIGENCE</h2>
            <div style={{ background: T.surf, padding: '25px', borderRadius: '25px', textAlign: 'center', border: `2px solid ${bmiInfo.col}` }}>
                <div style={{ fontSize: '0.7em', color: T.mute, letterSpacing: '2px' }}>BODY MASS INDEX</div>
                <div style={{ fontSize: '3em', fontWeight: '950', color: bmiInfo.col }}>{bmiVal}</div>
                <div style={{ background: bmiInfo.col, color: '#000', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', marginTop: '5px' }}>{bmiInfo.cat.toUpperCase()}</div>
                <p style={{ fontSize: '0.75em', marginTop: '15px', color: T.text, lineHeight: '1.5' }}>{bmiInfo.tip}</p>
            </div>
            
            <div style={{ background: T.surf, padding: '20px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '0.7em', color: T.mute, marginBottom: '10px' }}>HEIGHT DATA (180CM)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75em' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Healthy Range</span><span style={{color: '#4ade80'}}>60.0 - 81.0 KG</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Overweight Range</span><span style={{color: '#fbbf24'}}>81.1 - 97.2 KG</span></div>
                </div>
            </div>
          </div>
        )}

        {/* VIEW: BUILDER (Add Cardio) */}
        {view === 'builder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontWeight: '900', color: T.acc }}>WORKOUT ARCHITECT</h2>
            {plans.map((p, pIdx) => (
              <div key={p.id} style={{ background: T.surf, padding: '15px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <input value={p.name} onChange={e => { const n = [...plans]; n[pIdx].name = e.target.value; setPlans(n); }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: '900', width: '80%' }} />
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
                    }} style={{ background: T.acc, color: '#000', fontSize: '0.6em', borderRadius: '5px', border: 'none', fontWeight: 'bold' }}>
                        <option value="">+ ADD EXERCISE/CARDIO</option>
                        {EXERCISE_LIBRARY.map(l => <option key={l.id} value={l.id}>{l.name} ({l.muscle})</option>)}
                    </select>
                </div>
              </div>
            ))}
            <button onClick={() => setPlans([...plans, { id: Date.now(), name: "CUSTOM ROUTINE", list: [] }])} style={{ background: T.acc, color: '#000', padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>CREATE NEW ROUTINE</button>
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

        {/* VIEW: MENU */}
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

      {/* INFORMATION MODAL */}
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
