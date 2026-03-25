import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Settings, LayoutGrid, Trash2, ChevronRight, ChevronDown, 
  ChevronUp, Activity, BarChart3, Info, Calculator, Droplets, CheckCircle2
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THEME & CONSTANTS ---
  const THEMES = {
    EMBER: { name: "Electric Ember", bg: '#000', surface: '#111', accent: '#FF5C00', text: '#FFF', border: '#222' },
    CYAN: { name: "Deep Cyan", bg: '#050B0D', surface: '#0D1517', accent: '#00F0FF', text: '#E0F7FA', border: '#1A2628' },
    CARBON: { name: "Carbon Stealth", bg: '#000', surface: '#111', accent: '#FFF', text: '#FFF', border: '#333' }
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
  const [themeKey, setThemeKey] = useState('EMBER');
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
      theme: localStorage.getItem('tt_theme'),
      hist: localStorage.getItem('tt_hist'),
      notes: localStorage.getItem('tt_notes'),
      recov: localStorage.getItem('tt_recov')
    };
    if (saved.theme) setThemeKey(saved.theme);
    if (saved.hist) setHistory(JSON.parse(saved.hist));
    if (saved.notes) setSetupNotes(JSON.parse(saved.notes));
    if (saved.recov) setRecovery(JSON.parse(saved.recov));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tt_theme', themeKey);
      localStorage.setItem('tt_hist', JSON.stringify(history));
      localStorage.setItem('tt_notes', JSON.stringify(setupNotes));
      localStorage.setItem('tt_recov', JSON.stringify(recovery));
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
    let weightPerSide = (target - 20) / 2; // Assuming 20kg bar/base
    if (weightPerSide < 0) return "Base Only";
    const plates = [20, 15, 10, 5, 2.5];
    const result = [];
    plates.forEach(p => {
      while (weightPerSide >= p) {
        result.push(p);
        weightPerSide -= p;
      }
    });
    return result.join('kg, ') + 'kg';
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

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px 16px 120px 16px', fontFamily: 'sans-serif' }}>
      
      {/* NAVBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: T.accent, fontWeight: '950', fontStyle: 'italic', fontSize: '24px', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '4px', background: T.surface, padding: '4px', borderRadius: '12px', border: `1px solid ${T.border}` }}>
          {[
            {v:'train', i:<Dumbbell size={18}/>}, {v:'library', i:<PlusCircle size={18}/>}, 
            {v:'tools', i:<Calculator size={18}/>}, {v:'calendar', i:<History size={18}/>}, {v:'settings', i:<Settings size={18}/>}
          ].map(b => (
            <button key={b.v} onClick={() => setView(b.v)} style={{ border: 'none', background: view === b.v ? T.accent : 'transparent', padding: '10px', borderRadius: '8px', color: view === b.v ? '#000' : '#444' }}>{b.i}</button>
          ))}
        </div>
      </div>

      {/* VIEW: TRAIN (Progressive Overload Focus) */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!activeSession && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => { const p=PRESETS.SHRED; setActiveSession({...p, exercises: MASTER_LIST.filter(ex => p.ids.includes(ex.id)).map(ex => ({...ex, sets: 3, rest: p.rest}))})}} style={{ background: T.surface, border: `1px solid ${T.accent}`, padding: '20px', borderRadius: '20px', textAlign: 'left' }}><div style={{ fontWeight: '900', color: T.accent }}>SHRED PROTOCOL</div><div style={{ fontSize: '11px', color: '#555' }}>45s Rest • Fat Loss Focus</div></button>
              <button onClick={() => { const p=PRESETS.POWER; setActiveSession({...p, exercises: MASTER_LIST.filter(ex => p.ids.includes(ex.id)).map(ex => ({...ex, sets: 3, rest: p.rest}))})}} style={{ background: T.surface, border: `1px solid ${T.accent}`, padding: '20px', borderRadius: '20px', textAlign: 'left' }}><div style={{ fontWeight: '900', color: T.accent }}>POWER PROTOCOL</div><div style={{ fontSize: '11px', color: '#555' }}>90s Rest • Muscle Build Focus</div></button>
            </div>
          )}

          {[...(activeSession?.exercises || []), ...extraActivities].map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px', color: T.accent }}>{ex.name.toUpperCase()}</span>
                <Trash2 size={16} color="#333" onClick={() => setExtraActivities(extraActivities.filter(a => a.id !== ex.id))} />
              </div>

              {/* MACHINE SETUP NOTE */}
              <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <Info size={14} color="#444" />
                <input placeholder="Setup (e.g. Seat #3)" value={setupNotes[ex.id] || ''} onChange={e => setSetupNotes({...setupNotes, [ex.id]: e.target.value})} style={{ background: 'transparent', border: 'none', color: '#555', fontSize: '11px', width: '100%' }} />
              </div>

              {[...Array(ex.sets)].map((_, i) => {
                const ghostW = getGhostValue(ex.id, i, 'w');
                const ghostR = getGhostValue(ex.id, i, 'r');
                return (
                  <div key={i} style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                      <button onClick={() => { setCompletedSets(p => ({...p, [`${ex.id}-${i}`]: !p[`${ex.id}-${i}`]})); if(!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest); }}
                        style={{ width: '50px', height: '50px', borderRadius: '12px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? T.accent : '#222', color: '#000', fontWeight: '900' }}>{i+1}</button>
                      <div style={{ flex: 1 }}>
                        {ghostW && <div style={{ fontSize: '10px', color: '#444', textAlign: 'center' }}>Last: {ghostW}{ex.isCardio ? 'min' : 'kg'}</div>}
                        <input type="number" placeholder={ex.isCardio ? "MIN" : "KG"} value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={{ width: '100%', height: '35px', background: '#000', border: '1px solid #222', borderRadius: '10px', color: '#fff', textAlign: 'center', fontWeight: '800' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        {ghostR && <div style={{ fontSize: '10px', color: '#444', textAlign: 'center' }}>Last: {ghostR}{ex.isCardio ? 'km' : ''}</div>}
                        <input type="number" placeholder={ex.isCardio ? "KM" : "REPS"} value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{ width: '100%', height: '35px', background: '#000', border: '1px solid #222', borderRadius: '10px', color: T.accent, textAlign: 'center', fontWeight: '800' }} />
                      </div>
                    </div>
                    {/* VELOCITY / RPE SLIDER */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '9px', color: '#444' }}>INTENSITY (1-10)</span>
                      <input type="range" min="1" max="10" value={exerciseData[`${ex.id}-${i}-rpe`] || 5} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-rpe`]: e.target.value})} style={{ flex: 1, accentColor: T.accent, height: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {(activeSession || extraActivities.length > 0) && <button onClick={finishSession} style={{ background: T.accent, padding: '25px', borderRadius: '24px', border: 'none', fontWeight: '950', color: '#000' }}>COMPLETE SESSION</button>}
        </div>
      )}

      {/* VIEW: TOOLS (Plate Calc & Recovery) */}
      {view === 'tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Calculator size={20} color={T.accent}/> <span style={{ fontWeight: '900' }}>PLATE CALCULATOR</span></div>
            <input type="number" value={plateCalcWeight} onChange={e => setPlateCalcWeight(e.target.value)} style={{ width: '100%', background: '#000', border: `1px solid ${T.border}`, padding: '15px', borderRadius: '15px', color: T.accent, fontSize: '24px', fontWeight: '900', textAlign: 'center' }} />
            <div style={{ marginTop: '15px', textAlign: 'center', color: '#888' }}>Load per side: <span style={{ color: '#fff', fontWeight: '700' }}>{calculatePlates(plateCalcWeight)}</span></div>
          </div>

          <div style={{ background: T.surface, padding: '25px', borderRadius: '24px', border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}><Droplets size={20} color={T.accent}/> <span style={{ fontWeight: '900' }}>RECOVERY PROTOCOL</span></div>
            {Object.keys(recovery).map(key => (
              <button key={key} onClick={() => setRecovery({...recovery, [key]: !recovery[key]})} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'transparent', borderBottom: '1px solid #222', borderTop: 'none', borderLeft: 'none', borderRight: 'none', color: recovery[key] ? T.accent : '#555' }}>
                <span style={{ textTransform: 'uppercase', fontWeight: '700', fontSize: '12px' }}>{key}</span>
                {recovery[key] ? <CheckCircle2 size={18}/> : <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #333' }}/>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY (Categorized) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(LIBRARY).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: '900', marginBottom: '10px' }}>{group}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {items.map(name => (
                  <button key={name} onClick={() => addExtra(name, group)} style={{ background: T.surface, border: `1px solid ${T.border}`, color: '#fff', padding: '15px', borderRadius: '15px', textAlign: 'left', fontWeight: '700' }}>+ {name}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => setThemeKey(key)} style={{ background: T.surface, border: themeKey === key ? `2px solid ${theme.accent}` : 'none', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.accent }}></div>
              <span style={{ fontWeight: '700' }}>{theme.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.text, color: T.bg, padding: '20px', borderRadius: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Clock size={28} /> <span style={{ fontSize: '40px', fontWeight: '900' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: T.accent, border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
