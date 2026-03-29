import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, Flame, ChevronLeft, BarChart3, Plus, Timer, Scale } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THE DATABASE (ALL 3 WORKOUTS) ---
  const EX = {
    sq: { id: "sq", name: "Goblet Squat / Leg Press", muscle: "Quads", howTo: "Drive through heels. Keep chest up. Parallel depth." },
    bp: { id: "bp", name: "Flat Bench Press", muscle: "Chest", howTo: "Retract blades. Touch mid-chest. Drive feet." },
    row: { id: "row", name: "Chest Supported Row", muscle: "Back", howTo: "Squeeze blades. Elbows past torso." },
    rdl: { id: "rdl", name: "Romanian Deadlift", muscle: "Hamstrings", howTo: "Hinge hips back. Flat back. Feel the stretch." },
    lat: { id: "lat", name: "Lateral Raises", muscle: "Shoulders", howTo: "Lead with elbows. Stop at shoulder height." },
    dl: { id: "dl", name: "Deadlift (Conventional)", muscle: "Full Body", howTo: "Mid-foot under bar. Pull slack. Stand tall." },
    ohp: { id: "ohp", name: "Overhead Press", muscle: "Shoulders", howTo: "Glutes tight. Press vertical. Head through window." },
    lp: { id: "lp", name: "Lat Pulldown", muscle: "Back", howTo: "Pull to upper chest. Elbows down and back." },
    le: { id: "le", name: "Leg Extensions", muscle: "Quads", howTo: "Full extension. 1s squeeze at top. Slow down." },
    fp: { id: "fp", name: "Face Pulls", muscle: "Rear Delts", howTo: "Pull to forehead. External rotation." },
    lun: { id: "lun", name: "Walking Lunges", muscle: "Legs", howTo: "Long steps. 90-degree angles. Stable core." },
    inc: { id: "inc", name: "Incline Machine Press", muscle: "Upper Chest", howTo: "Handles mid-chest. 45-degree angle press." },
    sr: { id: "sr", name: "Seated Cable Row", muscle: "Back", howTo: "Legs slightly bent. Pull to navel." },
    lc: { id: "lc", name: "Leg Curls", muscle: "Hamstrings", howTo: "Hips down. Heels to glutes. Controlled return." },
    arm: { id: "arm", name: "Bicep/Tricep Superset", muscle: "Arms", howTo: "Curls then Pushdowns. Zero rest between." }
  };

  const RECOMP_PLAN = [
    { id: 'wA', name: "WORKOUT A", list: [EX.sq, EX.bp, EX.row, EX.rdl, EX.lat] },
    { id: 'wB', name: "WORKOUT B", list: [EX.dl, EX.ohp, EX.lp, EX.le, EX.fp] },
    { id: 'wC', name: "WORKOUT C", list: [EX.lun, EX.inc, EX.sr, EX.lc, EX.arm] }
  ];

  // --- 2. STATE ---
  const [view, setView] = useState('menu'); 
  const [unit, setUnit] = useState('metric');
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState({ weight: 80, height: 180, age: 43, activity: 1.375 });
  const [activeSession, setActiveSession] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [howToEx, setHowToEx] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- 3. LOGIC: BMR & TDEE (RECOMP ESSENTIALS) ---
  const bmr = 10 * bio.weight + 6.25 * bio.height - 5 * bio.age + 5;
  const tdee = Math.round(bmr * bio.activity);
  const recompTarget = tdee - 250;

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    const saved = localStorage.getItem('titan_v21_master');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.history) setHistory(data.history);
      if (data.bio) setBio(data.bio);
      if (data.unit) setUnit(data.unit);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v21_master', JSON.stringify({ history, bio, unit }));
  }, [history, bio, unit]);

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V21</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'intel', i:<BarChart3 size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN (The Core App) */}
        {view === 'menu' && activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => setActiveSession(null)} style={{ background: T.card, border: 'none', color: T.text, padding: '8px', borderRadius: '8px' }}><ChevronLeft size={18}/></button>
                <div onClick={() => setTimeLeft(60)} style={{ background: T.acc, color: '#000', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <Timer size={14}/> {timeLeft > 0 ? `${timeLeft}s` : 'REST'}
                </div>
            </div>

            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name.toUpperCase()}</div>
                  <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                </div>
                {(sessionData[ex.instId] || [{w:'', r:''}]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input type="number" placeholder={unit === 'metric' ? "KG" : "LB"} value={s.w} onChange={e => {
                        const sets = [...(sessionData[ex.instId] || [{w:'', r:''}])];
                        sets[i].w = e.target.value;
                        setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '100%', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                    <input type="number" placeholder="REPS" value={s.r} onChange={e => {
                        const sets = [...(sessionData[ex.instId] || [{w:'', r:''}])];
                        sets[i].r = e.target.value;
                        setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '100%', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                  </div>
                ))}
                <button onClick={() => {
                    const current = sessionData[ex.instId] || [{w:'', r:''}];
                    setSessionData({...sessionData, [ex.instId]: [...current, {w: current[current.length-1].w, r: ''}]});
                }} style={{ width: '100%', padding: '10px', background: T.card, border: 'none', borderRadius: '12px', color: T.acc, fontSize: '0.7em', fontWeight: 'bold' }}>+ ADD SET</button>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: MENU (Program Selection) */}
        {view === 'menu' && !activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RECOMP_PLAN.map(r => (
              <div key={r.id} onClick={() => { 
                const list = r.list.map(ex => ({ ...ex, instId: `${ex.id}-${Math.random()}` }));
                setActiveSession({ ...r, list });
              }} style={{ background: T.surf, padding: '20px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${T.card}` }}>
                <span style={{ fontWeight: '900' }}>{r.name}</span>
                <Play size={20} color={T.acc} />
              </div>
            ))}
          </div>
        )}

        {/* VIEW: INTEL (Tonnage Analytics) */}
        {view === 'intel' && (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
             <h2 style={{ fontSize: '1.2em', fontWeight: '950', color: T.acc }}>INTELLIGENCE</h2>
             <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
                <div style={{ color: T.mute, fontSize: '0.6em' }}>RECOMP CALORIE TARGET</div>
                <div style={{ fontSize: '1.8em', fontWeight: '950' }}>{recompTarget} <span style={{fontSize:'0.4em', color: T.acc}}>KCAL/DAY</span></div>
             </div>
             {history.map((h, i) => (
                <div key={i} style={{ background: T.card, padding: '15px', borderRadius: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8em', fontWeight: 'bold' }}>
                    <span>{h.name}</span>
                    <span style={{color: T.acc}}>{h.date}</span>
                  </div>
                </div>
             ))}
           </div>
        )}

        {/* VIEW: SETTINGS (BMR Restore) */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '0.8em', marginBottom: '15px', color: T.acc }}>BIOMETRICS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['weight', 'height', 'age'].map(k => (
                  <div key={k}>
                    <label style={{ fontSize: '0.5em', color: T.mute }}>{k.toUpperCase()}</label>
                    <input type="number" value={bio[k]} onChange={e => setBio({...bio, [k]: Number(e.target.value)})} style={{ width: '100%', background: T.bg, border: 'none', padding: '12px', borderRadius: '10px', color: '#fff' }} />
                  </div>
                ))}
                <button onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')} style={{ background: T.card, color: T.acc, border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>{unit.toUpperCase()}</button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* HOW-TO MODAL */}
      {howToEx && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 1000, padding: '30px' }}>
          <button onClick={() => setHowToEx(null)} style={{ background: T.card, border: 'none', color: '#fff', padding: '10px', borderRadius: '10px' }}><X size={20}/></button>
          <h2 style={{ fontWeight: '950', fontSize: '1.5em', marginTop: '20px' }}>{howToEx.name}</h2>
          <p style={{ marginTop: '20px', lineHeight: '1.6', color: T.mute }}>{howToEx.howTo}</p>
        </div>
      )}

      {/* FINISH BUTTON */}
      {activeSession && view === 'menu' && (
        <div style={{ position: 'fixed', bottom: 15, left: 15, right: 15 }}>
          <button onClick={() => {
            const details = activeSession.list.map(ex => ({ name: ex.name, sets: (sessionData[ex.instId] || []).filter(s => s.w && s.r) }));
            setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
            setActiveSession(null); setView('intel');
          }} style={{ width: '100%', padding: '20px', background: T.acc, color: '#000', borderRadius: '20px', fontWeight: '950', border: 'none' }}>LOG SESSION</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
