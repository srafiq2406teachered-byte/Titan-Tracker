import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, ChevronLeft, BarChart3, Edit3, Save, ClipboardList, Timer, Heart, Target, Ruler } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. FULLY DETAILED ENCYCLOPEDIA ---
  const EXERCISE_LIBRARY = [
    { 
        id: "leg_press", name: "Leg Press", type: "strength", muscle: "Quads", 
        machine: "Seated Leg Press Sled", alt: "Dumbbell Goblet Squat", 
        howTo: "SETUP: Adjust seat so knees are at 90 degrees. EXECUTION: Place feet shoulder-width. Lower platform slowly. Drive through heels without locking knees." 
    },
    { 
        id: "chest_press", name: "Machine Chest Press", type: "strength", muscle: "Chest", 
        machine: "Converging Chest Press", alt: "Dumbbell Bench Press", 
        howTo: "SETUP: Align handles with mid-chest. EXECUTION: Retract shoulder blades. Press forward. Control the return to feel the stretch." 
    },
    { 
        id: "seated_row", name: "Seated Cable Row", type: "strength", muscle: "Back", 
        machine: "Cable Row Station", alt: "One-Arm Dumbbell Row", 
        howTo: "SETUP: Feet on pads, slight knee bend. EXECUTION: Sit tall. Pull handle to navel. Squeeze shoulder blades together. Do not swing torso." 
    },
    { 
        id: "romanian_deadlift", name: "Romanian Deadlift", type: "strength", muscle: "Hamstrings", 
        machine: "Smith Machine or Barbell", alt: "Dumbbell RDL", 
        howTo: "SETUP: Feet hip-width. EXECUTION: Hinge hips back with a flat back. Lower weight until hamstrings stretch. Drive hips forward to stand." 
    },
    { 
        id: "treadmill", name: "Treadmill Power Walk", type: "cardio", muscle: "Heart/Legs", 
        machine: "Standard Treadmill", alt: "Outdoor Incline Walk", 
        howTo: "SETUP: Start at 1.0 km/h. EXECUTION: Set incline to 5-8%. Walk at a rate where breathing is heavy but controlled. Do not hold rails." 
    },
    { 
        id: "stationary_bike", name: "Stationary Bike", type: "cardio", muscle: "Heart", 
        machine: "Upright Bike", alt: "Outdoor Cycling", 
        howTo: "SETUP: Seat height at hip level. EXECUTION: Maintain 70-80 RPM. Adjust resistance to keep heart rate in Zone 2." 
    },
    { 
        id: "stair_climber", name: "Stair Climber", type: "cardio", muscle: "Glutes", 
        machine: "Stairmaster", alt: "Step-ups", 
        howTo: "SETUP: Use emergency stop clip. EXECUTION: Stand upright. Take full steps. Focus on driving through the mid-foot." 
    }
  ];

  // --- 2. STATE WITH HYDRATION ---
  const [view, setView] = useState('menu'); 
  const [bio, setBio] = useState({ weight: 93, height: 180, age: 43, waist: 95, goalBmi: 24.5 });
  const [config, setConfig] = useState({ restTime: 60, theme: '#38bdf8' });
  const [plans, setPlans] = useState([
    { id: 'wA', name: "WORKOUT A: FOUNDATION", list: ["leg_press", "chest_press", "seated_row", "treadmill"] },
    { id: 'wB', name: "WORKOUT B: STRUCTURAL", list: ["romanian_deadlift", "stationary_bike"] },
    { id: 'wC', name: "WORKOUT C: HYPERTROPHY", list: ["stair_climber", "chest_press", "seated_row"] }
  ]);
  
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // HYDRATION HOOK: Runs once on mount to load saved data
  useEffect(() => {
    const saved = localStorage.getItem('titan_v28_persistent');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.bio) setBio(parsed.bio);
      if (parsed.config) setConfig(parsed.config);
      if (parsed.plans) setPlans(parsed.plans);
    }
  }, []);

  // --- 3. LOGIC & METRICS ---
  const heightM = bio.height / 100;
  const currentBmi = (bio.weight / (heightM * heightM)).toFixed(1);
  const targetWeight = (bio.goalBmi * (heightM * heightM)).toFixed(1);
  const weightGap = (bio.weight - targetWeight).toFixed(1);
  const whtr = (bio.waist / bio.height).toFixed(2);

  const getWhtrStatus = (val) => {
    if (val <= 0.42) return { label: "Lean", col: "#60a5fa" };
    if (val <= 0.52) return { label: "Healthy", col: "#4ade80" };
    return { label: "High Risk", col: "#ef4444" };
  };
  const whtrStatus = getWhtrStatus(parseFloat(whtr));

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const saveAll = () => {
    const dataToSave = { bio, config, plans };
    localStorage.setItem('titan_v28_persistent', JSON.stringify(dataToSave));
    alert("Profile and Theme Settings Saved!");
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: config.theme, text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* PERSISTENT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V28</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'builder', i:<Edit3 size={18}/>}, {id:'intel', i:<BarChart3 size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ paddingBottom: '120px' }}>
        
        {/* VIEW: SESSION TRACKER */}
        {view === 'menu' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setActiveSession(null)} style={{ background: T.card, border: 'none', color: T.text, padding: '8px', borderRadius: '8px' }}><ChevronLeft size={18}/></button>
                <div onClick={() => setTimeLeft(config.restTime)} style={{ background: T.acc, color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{timeLeft > 0 ? `${timeLeft}s` : 'REST'}</div>
            </div>
            {activeSession.list.map(exId => {
              const ex = EXERCISE_LIBRARY.find(l => l.id === exId);
              const isCardio = ex?.type === 'cardio';
              return (
                <div key={exId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex?.name.toUpperCase()}</div>
                    <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                  </div>
                  {(sessionData[exId] || [{p1:'', p2:'', p3:''}]).map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input type="number" step="0.1" placeholder={isCardio ? "RATE" : "KG"} value={s.p1} onChange={e => {
                        const sets = [...(sessionData[exId] || [{p1:'', p2:'', p3:''}])];
                        sets[i].p1 = e.target.value; setSessionData({...sessionData, [exId]: sets});
                      }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                      
                      <input type="number" placeholder={isCardio ? "MINS" : "REPS"} value={s.p2} onChange={e => {
                        const sets = [...(sessionData[exId] || [{p1:'', p2:'', p3:''}])];
                        sets[i].p2 = e.target.value; setSessionData({...sessionData, [exId]: sets});
                      }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                      
                      {isCardio && (
                        <input type="number" placeholder="INC %" value={s.p3} onChange={e => {
                            const sets = [...(sessionData[exId] || [{p1:'', p2:'', p3:''}])];
                            sets[i].p3 = e.target.value; setSessionData({...sessionData, [exId]: sets});
                        }} style={{ flex: 1, background: T.bg, border: 'none', borderRadius: '10px', color: T.acc, textAlign: 'center', padding: '10px' }} />
                      )}
                      <button onClick={() => { const sets = [...sessionData[exId]]; sets.splice(i, 1); setSessionData({...sessionData, [exId]: sets}); }} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button onClick={() => setSessionData({...sessionData, [exId]: [...(sessionData[exId] || []), {p1:'', p2:'', p3:''}]})} style={{ width: '100%', padding: '8px', background: T.card, border: 'none', borderRadius: '10px', color: T.acc, fontSize: '0.7em' }}>+ ADD RECORD</button>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW: INTEL */}
        {view === 'intel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontWeight: '900', color: T.acc }}>METRIC ANALYSIS</h2>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '25px', border: `1px solid ${whtrStatus.col}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.6em', color: T.mute }}>WAIST-TO-HEIGHT RATIO</div>
                    <div style={{ fontSize: '0.6em', background: whtrStatus.col, color: '#000', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>{whtrStatus.label}</div>
                </div>
                <div style={{ fontSize: '2.5em', fontWeight: '950' }}>{whtr}</div>
                <input type="number" value={bio.waist} onChange={e => setBio({...bio, waist: parseInt(e.target.value) || 0})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '12px', color: '#fff', marginTop: '10px' }} />
                <p style={{ fontSize: '0.65em', color: T.mute, marginTop: '8px' }}>Health target for 180cm height: Waist under 90cm.</p>
            </div>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Target size={30} color={T.acc}/>
                <div>
                    <div style={{ fontSize: '0.6em', color: T.mute }}>WEIGHT GAP</div>
                    <div style={{ fontWeight: 'bold' }}>{weightGap} KG to target weight.</div>
                </div>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS & COLOR */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div><label style={{ fontSize: '0.6em', color: T.mute }}>WEIGHT (KG)</label><input type="number" value={bio.weight} onChange={e => setBio({...bio, weight: parseInt(e.target.value) || 0})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '10px', color: '#fff' }} /></div>
                <div><label style={{ fontSize: '0.6em', color: T.mute }}>HEIGHT (CM)</label><input type="number" value={bio.height} onChange={e => setBio({...bio, height: parseInt(e.target.value) || 0})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '10px', color: '#fff' }} /></div>
              </div>
            </div>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <label style={{ fontSize: '0.6em', color: T.mute }}>THEME COLOR</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {['#38bdf8', '#fbbf24', '#f472b6', '#4ade80', '#a78bfa'].map(c => (
                  <div key={c} onClick={() => setConfig({...config, theme: c})} style={{ width: '35px', height: '35px', borderRadius: '50%', background: c, border: config.theme === c ? '3px solid white' : 'none', cursor: 'pointer' }} />
                ))}
              </div>
            </div>
            <button onClick={saveAll} style={{ background: T.acc, color: '#000', padding: '20px', borderRadius: '20px', fontWeight: '950', border: 'none', display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <Save size={20}/> SAVE ALL CONFIGURATIONS
            </button>
          </div>
        )}

        {/* VIEW: BUILDER & MENU */}
        {view === 'builder' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h2 style={{ fontWeight: '900', color: T.acc }}>WORKOUT ARCHITECT</h2>
                {plans.map((p, pIdx) => (
                    <div key={p.id} style={{ background: T.surf, padding: '15px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <input value={p.name} onChange={e => { const n = [...plans]; n[pIdx].name = e.target.value; setPlans(n); }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: '900', width: '80%' }} />
                            <button onClick={() => { if(confirm('Delete?')) { const n = [...plans]; n.splice(pIdx, 1); setPlans(n); } }}><Trash2 size={16} color="#ef4444"/></button>
                        </div>
                        <select onChange={e => { if (e.target.value === "") return; const n = [...plans]; n[pIdx].list.push(e.target.value); setPlans(n); e.target.value = ""; }} style={{ width: '100%', background: T.acc, color: '#000', fontSize: '0.7em', borderRadius: '10px', padding: '8px', border: 'none', fontWeight: 'bold' }}>
                            <option value="">+ ADD EXERCISE OR CARDIO</option>
                            {EXERCISE_LIBRARY.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type.toUpperCase()})</option>)}
                        </select>
                    </div>
                ))}
            </div>
        )}

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

      {/* MODAL */}
      {howToEx && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zHeigth: 1000, padding: '30px', overflowY: 'auto', zIndex: 1000 }}>
          <button onClick={() => setHowToEx(null)} style={{ background: T.card, border: 'none', color: '#fff', padding: '10px', borderRadius: '10px' }}><X size={20}/></button>
          <h2 style={{ fontWeight: '950', fontSize: '1.5em', marginTop: '20px', color: T.acc }}>{howToEx.name}</h2>
          <p style={{ marginTop: '20px', fontSize: '0.85em', background: T.surf, padding: '15px', borderRadius: '15px', color: '#fff', lineHeight: '1.6' }}>{howToEx.howTo}</p>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
