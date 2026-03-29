import React, { useState, useEffect } from 'react';
import { Play, Settings, Activity, Trash2, X, Info, Flame, ChevronLeft, BarChart3, Plus } from 'lucide-react';

const TitanTracker = () => {
  // --- 1. DATA ---
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
    { id: 'wA', name: "WORKOUT A", list: [EX.sq, EX.bp, EX.row, EX.rdl, EX.lat] },
    { id: 'wB', name: "WORKOUT B", list: [EX.dl, EX.ohp, EX.lp, EX.le, EX.fp] },
    { id: 'wC', name: "WORKOUT C", list: [EX.lun, EX.inc, EX.sr, EX.lc, EX.arm] }
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
    const saved = localStorage.getItem('titan_v20_stable');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.history) setHistory(data.history);
      if (data.bio) setBio(data.bio);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titan_v20_stable', JSON.stringify({ history, bio }));
  }, [history, bio]);

  const T = { bg: '#020617', surf: '#0f172a', card: '#1e293b', acc: '#38bdf8', text: '#f8fafc', mute: '#94a3b8' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '12px', fontFamily: 'system-ui', maxWidth: '450px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      
      {/* PERSISTENT HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontWeight: '950', fontSize: '1.1em' }}>TITAN<span style={{color: T.acc}}>V20</span></h1>
        <div style={{ display: 'flex', background: T.surf, padding: '4px', borderRadius: '12px', border: `1px solid ${T.card}` }}>
          {[ {id:'menu', i:<Play size={18}/>}, {id:'intel', i:<BarChart3 size={18}/>}, {id:'settings', i:<Settings size={18}/>} ].map(n => (
            <button key={n.id} onClick={() => { setView(n.id); if(n.id !== 'train') setActiveSession(null); }} style={{ border: 'none', background: view === n.id ? T.acc : 'transparent', color: view === n.id ? '#000' : T.acc, padding: '8px', borderRadius: '8px' }}>{n.i}</button>
          ))}
        </div>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: '120px' }}>
        
        {/* VIEW: TRAIN (Workout in progress) */}
        {activeSession && view === 'train' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h2 style={{ fontSize: '1em', fontWeight: '900' }}>{activeSession.name}</h2>
            {activeSession.list.map(ex => (
              <div key={ex.instId} style={{ background: T.surf, padding: '15px', borderRadius: '20px', border: `1px solid ${T.card}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontWeight: '900', fontSize: '0.85em' }}>{ex.name.toUpperCase()}</div>
                  <button onClick={() => setHowToEx(ex)} style={{ background: T.card, border: 'none', color: T.acc, padding: '5px', borderRadius: '50%' }}><Info size={16}/></button>
                </div>

                {/* THE REPS/WEIGHTS GRID */}
                {(sessionData[ex.instId] || [{w:'', r:''}]).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ width: '15px', fontSize: '0.6em', color: T.mute }}>{i+1}</div>
                    <input type="number" placeholder="KG" value={s.w} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].w = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '100%', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                    <input type="number" placeholder="REPS" value={s.r} onChange={e => {
                      const sets = [...(sessionData[ex.instId] || [])];
                      sets[i].r = e.target.value;
                      setSessionData({...sessionData, [ex.instId]: sets});
                    }} style={{ width: '100%', background: T.bg, border: '1px solid #334155', borderRadius: '10px', color: '#fff', textAlign: 'center', padding: '10px' }} />
                  </div>
                ))}

                {/* RESTORED ADD SET BUTTON */}
                <button onClick={() => {
                  const s = sessionData[ex.instId] || [{w:'', r:''}];
                  setSessionData({...sessionData, [ex.instId]: [...s, {w: s[s.length-1].w, r: ''}]});
                }} style={{ width: '100%', padding: '10px', background: T.card, border: 'none', borderRadius: '12px', color: T.acc, fontSize: '0.7em', fontWeight: 'bold' }}>+ ADD SET</button>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: MENU (Select workout) */}
        {view === 'menu' && !activeSession && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {RECOMP_PLAN.map(r => (
              <div key={r.id} onClick={() => { 
                const list = r.list.map(ex => ({ ...ex, instId: `${ex.id}-${Math.random()}` }));
                setActiveSession({ ...r, list });
                setView('train');
              }} style={{ background: T.surf, padding: '20px', borderRadius: '24px', border: `1px solid ${T.card}`, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '900' }}>{r.name}</span>
                <Play size={20} color={T.acc} />
              </div>
            ))}
          </div>
        )}

        {/* VIEW: INTEL (METRICS) */}
        {view === 'intel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontSize: '1em', fontWeight: '900', color: T.acc }}>METRICS & INSIGHTS</h2>
            <div style={{ background: T.surf, padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '5px' }}>Total Tonnage</div>
              <p style={{ fontSize: '0.7em', color: T.mute }}>Multiply weight by reps for every set. This measures the total 'work' done. Increasing this is the key to muscle growth.</p>
            </div>
            <div style={{ background: T.surf, padding: '15px', borderRadius: '15px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginBottom: '5px' }}>RPE (Effort)</div>
              <p style={{ fontSize: '0.7em', color: T.mute }}>Rate of Perceived Exertion. Aim for 8/10 (2 reps left in the tank) for the best recomp results.</p>
            </div>
          </div>
        )}

        {/* VIEW: SETTINGS */}
        {view === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ background: T.surf, padding: '20px', borderRadius: '24px' }}>
              <h3 style={{ fontSize: '0.8em', marginBottom: '10px' }}>USER PROFILE</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                   <label style={{ fontSize: '0.6em', color: T.mute }}>AGE</label>
                   <input type="number" value={bio.age} onChange={e => setBio({...bio, age: e.target.value})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div>
                   <label style={{ fontSize: '0.6em', color: T.mute }}>WEIGHT (KG)</label>
                   <input type="number" value={bio.weight} onChange={e => setBio({...bio, weight: e.target.value})} style={{ width: '100%', background: T.bg, border: 'none', padding: '10px', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* HOW-TO OVERLAY */}
      {howToEx && (
        <div style={{ position: 'fixed', inset: 0, background: T.bg, zIndex: 1000, padding: '30px' }}>
          <button onClick={() => setHowToEx(null)} style={{ background: T.card, border: 'none', color: '#fff', padding: '10px', borderRadius: '10px' }}><X size={20}/></button>
          <h2 style={{ fontWeight: '950', fontSize: '1.5em', marginTop: '20px' }}>{howToEx.name}</h2>
          <p style={{ marginTop: '20px', lineHeight: '1.6' }}>{howToEx.howTo}</p>
        </div>
      )}

      {/* FINISH BUTTON */}
      {activeSession && view === 'train' && (
        <div style={{ position: 'fixed', bottom: 15, left: 15, right: 15 }}>
          <button onClick={() => {
            const details = activeSession.list.map(ex => ({ name: ex.name, sets: (sessionData[ex.instId] || []).filter(s => s.w && s.r) }));
            setHistory([{ date: new Date().toLocaleDateString(), name: activeSession.name, details }, ...history]);
            setActiveSession(null); setView('intel');
          }} style={{ width: '100%', padding: '20px', background: T.acc, color: '#000', borderRadius: '20px', fontWeight: '950', border: 'none' }}>LOG WORKOUT</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
