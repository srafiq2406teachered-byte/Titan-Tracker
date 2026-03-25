import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Settings, LayoutGrid, Trash2, ChevronRight, ChevronDown, 
  ChevronUp, Activity, BarChart3, Info, Calculator, Droplets, CheckCircle2
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. ENHANCED CONTRAST THEMES ---
  const THEMES = {
    NEON_AMBER: { name: "Neon Amber", bg: '#000', surface: '#000', accent: '#FF7A00', text: '#FFF', border: '#333', ghost: '#FF7A00' },
    ICE_CYAN: { name: "Ice Cyan", bg: '#000', surface: '#000', accent: '#00F0FF', text: '#FFF', border: '#222', ghost: '#00F0FF' },
    STARK_WHITE: { name: "Stark White", bg: '#000', surface: '#000', accent: '#FFF', text: '#FFF', border: '#444', ghost: '#AAA' }
  };

  const MASTER_LIST = [
    { id: "A1", name: "Leg Press Machine", group: "LEGS" },
    { id: "A2", name: "Lat Pulldown Machine", group: "PULL" },
    { id: "B1", name: "Chest Press Machine", group: "PUSH" },
    { id: "B2", name: "Seated Leg Curl", group: "LEGS" },
    { id: "C1", name: "Seated Cable Row", group: "PULL" },
    { id: "C2", name: "DB Overhead Press", group: "PUSH" },
    { id: "D1", name: "Plank / Captain's Chair", group: "CORE" },
    { id: "D2", name: "Walking Lunges", group: "LEGS" }
  ];

  const LIBRARY = {
    LEGS: ["Hip Abductor", "Hip Adductor", "Leg Extension", "Calf Press"],
    PUSH: ["Tricep Pushdown", "Shoulder Press Machine", "Dips", "Cable Flys"],
    PULL: ["Bicep Curl Machine", "Face Pulls", "Hammer Curls", "Preacher Curl"],
    CARDIO: ["Treadmill", "Stationary Bike", "Elliptical", "Stairmaster"]
  };

  const PRESETS = {
    SHRED: { name: "SHRED (Fat Loss)", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"] },
    POWER: { name: "POWER (Muscle)", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"] }
  };

  // --- 2. STATE ---
  const [view, setView] = useState('train');
  const [themeKey, setThemeKey] = useState('NEON_AMBER');
  const [activeSession, setActiveSession] = useState(null);
  const [extraActivities, setExtraActivities] = useState([]);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [setupNotes, setSetupNotes] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [expandedLog, setExpandedLog] = useState(null);
  const [plateCalcWeight, setPlateCalcWeight] = useState(60);
  const [recovery, setRecovery] = useState({ water: false, sleep: false, nutrition: false });
  const [mounted, setMounted] = useState(false);

  const T = THEMES[themeKey];

  // --- 3. PERSISTENCE ---
  useEffect(() => {
    const saved = {
      theme: localStorage.getItem('tt_v45_theme'),
      hist: localStorage.getItem('tt_v45_hist'),
      notes: localStorage.getItem('tt_v45_notes'),
      recov: localStorage.getItem('tt_v45_recov')
    };
    if (saved.theme) setThemeKey(saved.theme);
    if (saved.hist) setHistory(JSON.parse(saved.hist));
    if (saved.notes) setSetupNotes(JSON.parse(saved.notes));
    if (saved.recov) setRecovery(JSON.parse(saved.recov));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tt_v45_theme', themeKey);
      localStorage.setItem('tt_v45_hist', JSON.stringify(history));
      localStorage.setItem('tt_v45_notes', JSON.stringify(setupNotes));
      localStorage.setItem('tt_v45_recov', JSON.stringify(recovery));
    }
  }, [themeKey, history, setupNotes, recovery, mounted]);

  // --- 4. UTILITIES ---
  const getGhostValue = (exId, setIndex, type) => {
    const lastSession = history.find(log => log.details.some(d => d.id === exId));
    if (!lastSession) return null;
    const exEntry = lastSession.details.find(d => d.id === exId);
    return exEntry?.sets[setIndex]?.[type] || null;
  };

  const calculatePlates = (target) => {
    let weightPerSide = (target - 20) / 2;
    if (weightPerSide < 0) return "BASE BAR";
    const plates = [20, 15, 10, 5, 2.5];
    const result = [];
    plates.forEach(p => {
      while (weightPerSide >= p) {
        result.push(p);
        weightPerSide -= p;
      }
    });
    return result.length > 0 ? result.join('kg, ') + 'kg' : "BASE BAR";
  };

  const finishSession = () => {
    let sessionVol = 0;
    const allEx = [...(activeSession?.exercises || []), ...extraActivities];
    const details = allEx.map(ex => {
      const sets = [...Array(ex.sets)].map((_, i) => {
        const w = parseFloat(exerciseData[`${ex.id}-${i}-w`] || 0);
        const r = parseFloat(exerciseData[`${ex.id}-${i}-r`] || 0);
        const rpe = exerciseData[`${ex.id}-${i}-rpe`] || 5;
        if (completedSets[`${ex.id}-${i}`]) sessionVol += (w * r);
        return { done: completedSets[`${ex.id}-${i}`], w, r, rpe, isCardio: ex.isCardio };
      }).filter(s => s.done);
      return { id: ex.id, name: ex.name, sets };
    }).filter(ex => ex.sets.length > 0);

    const log = { id: Date.now(), date: new Date().toLocaleDateString('en-GB'), vol: sessionVol, details, preset: activeSession?.name || "Custom" };
    setHistory([log, ...history]);
    setActiveSession(null); setExtraActivities([]); setCompletedSets({}); setExerciseData({});
    setView('calendar');
  };

  if (!mounted) return null;

  // --- 5. RENDER STYLES (Legibility Focus) ---
  const inputStyle = {
    width: '100%', height: '55px', background: '#111', border: `2px solid ${T.border}`, 
    borderRadius: '12px', color: '#FFF', textAlign: 'center', fontSize: '20px', fontWeight: '900'
  };

  const labelStyle = { fontSize: '14px', fontWeight: '800', color: T.accent, letterSpacing: '0.5px' };

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px 16px 140px 16px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* HEADER: Ultra-Bold */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: T.accent, fontWeight: '950', fontStyle: 'italic', fontSize: '28px', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '6px', background: '#111', padding: '6px', borderRadius: '16px', border: `2px solid ${T.border}` }}>
          {[
            {v:'train', i:<Dumbbell size={20}/>}, {v:'library', i:<PlusCircle size={20}/>}, 
            {v:'tools', i:<Calculator size={20}/>}, {v:'calendar', i:<History size={20}/>}, {v:'settings', i:<Settings size={20}/>}
          ].map(b => (
            <button key={b.v} onClick={() => setView(b.v)} style={{ border: 'none', background: view === b.v ? T.accent : 'transparent', padding: '12px', borderRadius: '12px', color: view === b.v ? '#000' : '#888' }}>{b.i}</button>
          ))}
        </div>
      </div>

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!activeSession && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => { const p=PRESETS.SHRED; setActiveSession({...p, exercises: MASTER_LIST.filter(ex => p.ids.includes(ex.id)).map(ex => ({...ex, sets: 3, rest: p.rest}))})}} style={{ background: '#111', border: `3px solid ${T.accent}`, padding: '25px', borderRadius: '24px', textAlign: 'left' }}><div style={{ fontWeight: '950', fontSize: '20px', color: T.accent }}>SHRED PROTOCOL</div><div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>45s Rest • Fat Loss</div></button>
              <button onClick={() => { const p=PRESETS.POWER; setActiveSession({...p, exercises: MASTER_LIST.filter(ex => p.ids.includes(ex.id)).map(ex => ({...ex, sets: 3, rest: p.rest}))})}} style={{ background: '#111', border: `3px solid ${T.accent}`, padding: '25px', borderRadius: '24px', textAlign: 'left' }}><div style={{ fontWeight: '950', fontSize: '20px', color: T.accent }}>POWER PROTOCOL</div><div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>90s Rest • Muscle Build</div></button>
            </div>
          )}

          {[...(activeSession?.exercises || []), ...extraActivities].map(ex => (
            <div key={ex.id} style={{ background: '#111', padding: '20px', borderRadius: '28px', border: `2px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontWeight: '950', fontSize: '16px', color: T.accent, textTransform: 'uppercase' }}>{ex.name}</span>
                <Trash2 size={20} color="#444" onClick={() => setExtraActivities(extraActivities.filter(a => a.id !== ex.id))} />
              </div>

              {/* SETUP NOTES: High Vis */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', background: '#000', padding: '10px', borderRadius: '12px' }}>
                <Info size={16} color={T.accent} />
                <input placeholder="SET MACHINE SETUP NOTES..." value={setupNotes[ex.id] || ''} onChange={e => setSetupNotes({...setupNotes, [ex.id]: e.target.value})} style={{ background: 'transparent', border: 'none', color: '#AAA', fontSize: '14px', fontWeight: '700', width: '100%' }} />
              </div>

              {[...Array(ex.sets)].map((_, i) => {
                const ghostW = getGhostValue(ex.id, i, 'w');
                const ghostR = getGhostValue(ex.id, i, 'r');
                return (
                  <div key={i} style={{ marginBottom: '20px', borderBottom: `1px solid ${T.border}`, paddingBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button onClick={() => { setCompletedSets(p => ({...p, [`${ex.id}-${i}`]: !p[`${ex.id}-${i}`]})); if(!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest); }}
                        style={{ width: '60px', height: '60px', borderRadius: '16px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? T.accent : '#222', color: '#000', fontWeight: '950', fontSize: '24px' }}>{i+1}</button>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: T.ghost, fontWeight: '900', textAlign: 'center', marginBottom: '4px' }}>{ghostW ? `LAST: ${ghostW}` : 'NEW'}</div>
                        <input type="number" placeholder={ex.isCardio ? "MIN" : "KG"} value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={inputStyle} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '11px', color: T.ghost, fontWeight: '900', textAlign: 'center', marginBottom: '4px' }}>{ghostR ? `LAST: ${ghostR}` : 'NEW'}</div>
                        <input type="number" placeholder={ex.isCardio ? "KM" : "REPS"} value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{...inputStyle, color: T.accent}} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {(activeSession || extraActivities.length > 0) && <button onClick={finishSession} style={{ background: T.accent, padding: '30px', borderRadius: '24px', border: 'none', fontWeight: '950', color: '#000', fontSize: '20px', boxShadow: `0 10px 40px ${T.accent}44` }}>FINISH SESSION</button>}
        </div>
      )}

      {/* VIEW: TOOLS */}
      {view === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#111', padding: '30px', borderRadius: '28px', border: `2px solid ${T.border}` }}>
            <div style={labelStyle}>PLATE CALCULATOR</div>
            <input type="number" value={plateCalcWeight} onChange={e => setPlateCalcWeight(e.target.value)} style={{ ...inputStyle, height: '70px', fontSize: '32px', marginTop: '15px' }} />
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '18px', fontWeight: '900', color: '#FFF' }}>SIDES: <span style={{ color: T.accent }}>{calculatePlates(plateCalcWeight)}</span></div>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {Object.entries(LIBRARY).map(([group, items]) => (
            <div key={group}>
              <div style={labelStyle}>{group}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                {items.map(name => (
                  <button key={name} onClick={() => addExtra(name, group)} style={{ background: '#111', border: `2px solid ${T.border}`, color: '#FFF', padding: '20px', borderRadius: '18px', textAlign: 'left', fontWeight: '800', fontSize: '14px' }}>+ {name}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => setThemeKey(key)} style={{ background: '#111', border: themeKey === key ? `3px solid ${theme.accent}` : `2px solid ${T.border}`, padding: '25px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: theme.accent }}></div>
              <span style={{ fontWeight: '900', fontSize: '18px' }}>{theme.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* TIMER HUD: Oversized for visibility */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.accent, color: '#000', padding: '25px 35px', borderRadius: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}><Clock size={32} strokeWidth={3} /> <span style={{ fontSize: '48px', fontWeight: '950', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: '#000', border: 'none', padding: '15px 25px', borderRadius: '18px', fontWeight: '950', color: '#FFF' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
