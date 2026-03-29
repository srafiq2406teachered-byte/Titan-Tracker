import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, Flame, ChevronLeft, BarChart3, Plus, Timer, Save, Edit3, Dumbbell } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THE MASTER EXERCISE LIBRARY (Detailed Machine + Alternatives) ---
  const LIBRARY = [
    { id: "sq", name: "Leg Press / Goblet Squat", muscle: "Quads", machine: "Leg Press Machine or Hammer Strength", alt: "Dumbbell Goblet Squat", howTo: "Feet shoulder-width on platform. Lower until knees are at 90 degrees. Drive through heels." },
    { id: "bp", name: "Chest Press / Bench Press", muscle: "Chest", machine: "Converging Chest Press Machine", alt: "Barbell or Dumbbell Flat Bench", howTo: "Align handles with mid-chest. Retract shoulder blades. Press forward without locking elbows." },
    { id: "row", name: "Seated Row", muscle: "Back", machine: "Cable Row or Chest-Supported Machine", alt: "Dumbbell One-Arm Row", howTo: "Sit tall. Pull handles to navel. Squeeze shoulder blades together. Don't lean back." },
    { id: "ohp", name: "Shoulder Press", muscle: "Shoulders", machine: "Shoulder Press Machine", alt: "Dumbbell Overhead Press", howTo: "Adjust seat so handles are at ear level. Press up. Keep core tight to avoid arching back." },
    { id: "lp", name: "Lat Pulldown", muscle: "Lats", machine: "Lat Pulldown Cable Station", alt: "Pull-ups or Assisted Pull-up Machine", howTo: "Grip bar wide. Pull down to upper chest. Focus on pulling with elbows, not hands." },
    { id: "rdl", name: "Romanian Deadlift", muscle: "Hamstrings", machine: "Smith Machine (Optional)", alt: "Barbell or DB RDL", howTo: "Hinge hips back. Keep back flat. Lower weight until stretch is felt in hamstrings. Snap hips forward." },
    { id: "le", name: "Leg Extension", muscle: "Quads", machine: "Leg Extension Machine", alt: "Sissy Squats", howTo: "Align knees with machine hinge. Extend legs fully. 1s squeeze at top." },
    { id: "lc", name: "Leg Curl", muscle: "Hamstrings", machine: "Lying or Seated Leg Curl", alt: "Dumbbell Leg Curls", howTo: "Curl heels toward glutes. Keep hips pressed into the pad." },
    { id: "lat", name: "Lateral Raise", muscle: "Shoulders", machine: "Lateral Raise Machine", alt: "Dumbbell Lateral Raise", howTo: "Lead with elbows. Stop at shoulder height. Slight forward lean." }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 93, height: 180, age: 43 });
  const [config, setConfig] = useState({ restTime: 60, theme: '#38bdf8' });
  const [plans, setPlans] = useState([
    { id: 'wA', name: "WORKOUT A", list: ["sq", "bp", "row"] },
    { id: 'wB', name: "WORKOUT B", list: ["ohp", "lp", "rdl"] }
  ]);
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. CALCULATIONS ---
  const bmi = (bio.weight / ((bio.height/100)**2)).toFixed(1);
  const tdee = Math.round((10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5) * 1.375);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const saveSettings = () => {
    localStorage.setItem('titan_v22', JSON.stringify({ history, bio, config, plans }));
    alert("Settings Saved!");
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: config.theme, text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V22</span></h1>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setActiveSession(null)} style={{ background: T.card, border: 'none', color: T.text, padding: '8px', borderRadius: '8px' }}><ChevronLeft size={18}/></button>
                <div onClick={() => setTimeLeft(config.restTime)} style={{ background: T.acc, color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                    {timeLeft > 0 ? `${timeLeft}s` : 'START REST'}
                </div>
            </div>

            {activeSession.list.map(exId => {
              const ex = LIBRARY.find(l => l.id === exId);
              return (
                <div key={exId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name}</div>
                    <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                  </div>
                  {(sessionData[exId] || [{w:'', r:''}]).map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <input type="number" placeholder="KG" value={s.w} onChange={e => {
                          const sets = [...(sessionData[exId] || [])];
                          sets[i].w = parseInt(e.target.value) || '';
                          setSessionData({...sessionData, [exId]: sets});
                      }} style={{ width: '100%', background: T.bg, border: 'none', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                      <input type="number" placeholder="REPS" value={s.r} onChange={e => {
                          const sets = [...(sessionData[exId] || [])];
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
                  <button onClick={() => setSessionData({...sessionData, [exId]: [...(sessionData[exId] || []), {w:'', r:''}]})} style={{ width: '100%', padding: '8px', background: T.card, border: 'none', borderRadius: '10px', color: T.acc, fontSize: '0.7em' }}>+ SET</button>
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW: BUILDER */}
        {view === 'builder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontWeight: '900' }}>WORKOUT ARCHITECT</h2>
            {plans.map((p, idx) => (
              <div key={p.id} style={{ background: T.surf, padding: '15px', borderRadius: '20px' }}>
                <input value={p.name} onChange={e => {
                   const newPlans = [...plans];
                   newPlans[idx].name = e.target.value;
                   setPlans(newPlans);
                }} style={{ background: 'none', border: 'none', color: T.acc, fontWeight: '900', marginBottom: '10px' }} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                   {p.list.map(eid => <span key={eid} style={{ fontSize: '0.6em', background: T.card, padding: '4px 8px', borderRadius: '5px' }}>{eid}</span>)}
                   <button onClick={() => {
                     const eid = prompt("Enter Exercise ID (sq, bp, row, ohp, lp, rdl, le, lc, lat)");
                     if(eid) {
                       const newPlans = [...plans];
                       newPlans[idx].list.push(eid);
                       setPlans(newPlans);
                     }
                   }} style={{ fontSize: '0.6em', color: T.acc }}>+ ADD</button>
                </div>
              </div>
            ))}
            <button onClick={() => setPlans([...plans, { id: Date.now(), name: "NEW WORKOUT", list: [] }])} style={{ background: T.acc, color: '#000', padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>CREATE NEW ROUTINE</button>
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
              <div style={{ marginTop: '20px', padding: '15px', background: T.card, borderRadius: '15px', textAlign: 'center' }}>
                 <div style={{ fontSize: '0.6em', color: T.mute }}>CURRENT BMI</div>
                 <div style={{ fontSize: '1.5em', fontWeight: '900', color: T.acc }}>{bmi}</div>
              </div>
            </div>

            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <label style={{ fontSize: '0.6em', color: T.mute }}>REST TIMER (SECONDS)</label>
              <input type="number" value={config.restTime} onChange={e => setConfig({...config, restTime: parseInt(e.target.value) || 0})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '10px', color: '#fff', marginBottom: '15px' }} />
              
              <label style={{ fontSize: '0.6em', color: T.mute }}>THEME COLOR</label>
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                {['#38bdf8', '#fbbf24', '#f472b6', '#4ade80'].map(c => (
                  <div key={c} onClick={() => setConfig({...config, theme: c})} style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, border: config.theme === c ? '2px solid white' : 'none' }} />
                ))}
              </div>
            </div>

            <button onClick={saveSettings} style={{ background: T.acc, color: '#000', padding: '20px', borderRadius: '20px', fontWeight: '950', border: 'none', display: 'flex', justifyContent: 'center', gap: '10px' }}>
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

      {/* HOW-TO OVERLAY (Detailed Machine Specs) */}
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
              <div style={{ fontSize: '0.6em', color: '#fbbf24', fontWeight: '900' }}>ALTERNATIVE (IF BUSY)</div>
              <div style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{howToEx.alt}</div>
            </div>
            <div style={{ lineHeight: '1.6', fontSize: '0.85em' }}>
               <div style={{ fontWeight: '900', marginBottom: '5px' }}>INSTRUCTIONS:</div>
               {howToEx.howTo}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
