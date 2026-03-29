import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, ChevronLeft, BarChart3, Plus, Timer, Save, Edit3, ClipboardList } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THE NON-ABBREVIATED MASTER LIBRARY ---
  const EXERCISE_LIBRARY = [
    { id: "leg_press", name: "Leg Press", muscle: "Quads", machine: "Seated Leg Press Sled", alt: "Dumbbell Goblet Squat", howTo: "Place feet shoulder-width on the platform. Lower the weight until knees are at 90 degrees. Drive through your heels." },
    { id: "chest_press", name: "Machine Chest Press", muscle: "Chest", machine: "Converging Chest Press", alt: "Flat Dumbbell Bench Press", howTo: "Adjust seat height so handles align with mid-chest. Press forward and squeeze the pectorals." },
    { id: "seated_row", name: "Seated Cable Row", muscle: "Back", machine: "Cable Row Station", alt: "One-Arm Dumbbell Row", howTo: "Sit with a slight bend in knees. Pull the handle toward your navel while squeezing shoulder blades." },
    { id: "overhead_press", name: "Shoulder Press Machine", muscle: "Shoulders", machine: "Vertical Press Machine", alt: "Dumbbell Overhead Press", howTo: "Press handles directly upward until arms are nearly locked. Keep your back pressed into the seat." },
    { id: "lat_pulldown", name: "Lat Pulldown", muscle: "Lats", machine: "Wide Grip Cable Station", alt: "Assisted Pull-Up Machine", howTo: "Grip the bar wider than shoulders. Pull the bar down to your upper chest by driving your elbows down." },
    { id: "romanian_deadlift", name: "Romanian Deadlift", muscle: "Hamstrings", machine: "Smith Machine or Barbell", alt: "Dumbbell Romanian Deadlift", howTo: "Hinge at the hips, keeping your back flat. Lower the weight until you feel a stretch in your hamstrings." },
    { id: "leg_extension", name: "Leg Extension", muscle: "Quads", machine: "Seated Leg Extension", alt: "Sissy Squat", howTo: "Extend your legs fully and hold the contraction for one second at the top. Lower the weight slowly." },
    { id: "leg_curl", name: "Leg Curl", muscle: "Hamstrings", machine: "Lying or Seated Leg Curl", alt: "Dumbbell Leg Curl", howTo: "Curl your heels toward your glutes. Keep your hips firmly against the padding." },
    { id: "lateral_raise", name: "Lateral Raise", muscle: "Shoulders", machine: "Lateral Raise Machine", alt: "Dumbbell Lateral Raise", howTo: "Raise your arms out to the sides until they are level with your shoulders. Lead with your elbows." }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 93, height: 180, age: 43 });
  const [config, setConfig] = useState({ restTime: 60, theme: '#38bdf8' });
  const [plans, setPlans] = useState([]); // Empty by default
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. ANALYTICS ---
  const bmi = (bio.weight / ((bio.height/100)**2)).toFixed(1);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const saveAll = () => {
    localStorage.setItem('titan_v23_final', JSON.stringify({ history, bio, config, plans }));
    alert("Profile and Workouts Saved!");
  };

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: config.theme, text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* PERSISTENT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V23</span></h1>
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
                <div onClick={() => setTimeLeft(config.restTime)} style={{ background: T.acc, color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>{timeLeft > 0 ? `${timeLeft}s` : 'START REST'}</div>
            </div>
            {activeSession.list.map(exId => {
              const ex = EXERCISE_LIBRARY.find(l => l.id === exId);
              return (
                <div key={exId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name}</div>
                    <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                  </div>
                  {(sessionData[exId] || [{w:'', r:''}]).map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
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

        {/* VIEW: BUILDER */}
        {view === 'builder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontWeight: '900', color: T.acc }}>WORKOUT ARCHITECT</h2>
            {plans.map((p, pIdx) => (
              <div key={p.id} style={{ background: T.surf, padding: '15px', borderRadius: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <input value={p.name} onChange={e => {
                        const n = [...plans]; n[pIdx].name = e.target.value; setPlans(n);
                    }} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: '900' }} />
                    <button onClick={() => { const n = [...plans]; n.splice(pIdx, 1); setPlans(n); }}><Trash2 size={16} color="#ef4444"/></button>
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
            <button onClick={() => setPlans([...plans, { id: Date.now(), name: "NEW WORKOUT", list: [] }])} style={{ background: T.acc, color: '#000', padding: '15px', borderRadius: '15px', fontWeight: 'bold' }}>CREATE NEW ROUTINE</button>
          </div>
        )}

        {/* VIEW: INTEL */}
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
            <div style={{ background: T.surf, padding: '20px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '0.8em', marginBottom: '10px' }}>SESSION HISTORY</h3>
                {history.length === 0 ? <p style={{ fontSize: '0.7em', color: T.mute }}>No sessions logged.</p> : history.map((h, i) => (
                    <div key={i} style={{ fontSize: '0.7em', borderBottom: `1px solid ${T.card}`, padding: '10px 0' }}>{h.date} - {h.name}</div>
                ))}
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
            {plans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <ClipboardList size={40} color={T.mute} style={{ margin: '0 auto 10px' }}/>
                    <p style={{ fontSize: '0.8em', color: T.mute }}>No workouts found. Go to the Builder tab to create your first routine.</p>
                </div>
            ) : plans.map(p => (
              <div key={p.id} onClick={() => setActiveSession(p)} style={{ background: T.surf, padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${T.card}` }}>
                <span style={{ fontWeight: '900' }}>{p.name}</span>
                <Play size={20} color={T.acc} fill={T.acc}/>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* HOW-TO OVERLAY */}
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
