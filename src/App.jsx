import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Settings, LayoutGrid, Trash2, ChevronRight, ChevronDown, 
  ChevronUp, Activity, BarChart3, RotateCcw
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. RESTORED COLOR SCHEMES ---
  const THEMES = {
    TITAN_OG: { name: "Titan Orange", bg: '#000000', surface: '#111111', accent: '#FF5C00', text: '#FFFFFF', border: '#222' },
    CYAN: { name: "Deep Cyan", bg: '#050B0D', surface: '#0D1517', accent: '#00F0FF', text: '#E0F7FA', border: '#1A2628' },
    STEALTH: { name: "Carbon", bg: '#000', surface: '#111', accent: '#FFF', text: '#FFF', border: '#333' }
  };

  // --- 2. FULL EXERCISE DATABASE ---
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

  // --- 3. STATE ---
  const [view, setView] = useState('train');
  const [themeKey, setThemeKey] = useState('TITAN_OG');
  const [activeSession, setActiveSession] = useState(null);
  const [extraActivities, setExtraActivities] = useState([]);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expandedLog, setExpandedLog] = useState(null);
  const [mounted, setMounted] = useState(false);

  const T = THEMES[themeKey];

  // --- 4. PERSISTENCE ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('titan_theme');
    const savedHistory = localStorage.getItem('titan_history');
    if (savedTheme) setThemeKey(savedTheme);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_theme', themeKey);
      localStorage.setItem('titan_history', JSON.stringify(history));
    }
  }, [themeKey, history, mounted]);

  // --- 5. LOGIC & METRICS ---
  const startPreset = (key) => {
    const p = PRESETS[key];
    const exercises = MASTER_LIST.filter(ex => p.ids.includes(ex.id)).map(ex => ({ ...ex, sets: 3, rest: p.rest }));
    setActiveSession({ ...p, exercises });
    setView('train');
  };

  const addExtra = (name, group) => {
    const isCardio = group === 'CARDIO';
    const newEx = { id: `ext-${Date.now()}`, name, sets: isCardio ? 1 : 3, rest: 60, isCardio };
    setExtraActivities([...extraActivities, newEx]);
    setView('train');
  };

  const calculateMetrics = () => {
    if (history.length === 0) return { vol: 0, sets: 0, peak: 0 };
    let totalVol = 0; let totalSets = 0; let peakWeight = 0;
    history.forEach(session => {
      totalVol += session.vol;
      session.details.forEach(ex => {
        totalSets += ex.sets.length;
        ex.sets.forEach(s => { if(s.w > peakWeight) peakWeight = s.w; });
      });
    });
    return { vol: totalVol, sets: totalSets, peak: peakWeight };
  };

  const finishSession = () => {
    let sessionVol = 0;
    const allEx = [...(activeSession?.exercises || []), ...extraActivities];
    const details = allEx.map(ex => {
      const sets = [...Array(ex.sets)].map((_, i) => {
        const w = parseFloat(exerciseData[`${ex.id}-${i}-w`] || 0);
        const r = parseFloat(exerciseData[`${ex.id}-${i}-r`] || 0);
        if (completedSets[`${ex.id}-${i}`]) sessionVol += (w * r);
        return { done: completedSets[`${ex.id}-${i}`], w, r, isCardio: ex.isCardio };
      }).filter(s => s.done);
      return { name: ex.name, sets };
    }).filter(ex => ex.sets.length > 0);

    const log = { id: Date.now(), date: new Date().toLocaleDateString('en-GB'), vol: sessionVol, details, preset: activeSession?.name || "Custom" };
    setHistory([log, ...history]);
    setActiveSession(null); setExtraActivities([]); setCompletedSets({}); setExerciseData({});
    setView('calendar');
  };

  if (!mounted) return null;

  const m = calculateMetrics();

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px 16px 120px 16px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: T.accent, fontWeight: '950', fontStyle: 'italic', fontSize: '26px', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '4px', background: T.surface, padding: '4px', borderRadius: '12px' }}>
          {[{v:'train', i:<Dumbbell size={18}/>}, {v:'library', i:<PlusCircle size={18}/>}, {v:'metrics', i:<BarChart3 size={18}/>}, {v:'calendar', i:<History size={18}/>}, {v:'settings', i:<Settings size={18}/>}]
            .map(b => (
              <button key={b.v} onClick={() => setView(b.v)} style={{ border: 'none', background: view === b.v ? T.accent : 'transparent', padding: '10px', borderRadius: '8px', color: view === b.v ? '#000' : '#555' }}>{b.i}</button>
            ))
          }
        </div>
      </div>

      {/* VIEW: METRICS (RESTORED) */}
      {view === 'metrics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#555' }}>LIFETIME VOL</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: T.accent }}>{m.vol.toLocaleString()}kg</div>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: '#555' }}>TOTAL SETS</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: T.accent }}>{m.sets}</div>
          </div>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px', textAlign: 'center', gridColumn: 'span 2' }}>
            <div style={{ fontSize: '10px', color: '#555' }}>PEAK LOAD (1RM ESTIMATE)</div>
            <div style={{ fontSize: '32px', fontWeight: '900', color: T.accent }}>{m.peak}kg</div>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY (RESTORED CATEGORIES) */}
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

      {/* VIEW: TRAIN (WITH PRESET TRIGGER) */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!activeSession && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
              <button onClick={() => startPreset('SHRED')} style={{ background: T.surface, border: `1px solid ${T.accent}`, padding: '20px', borderRadius: '20px', textAlign: 'left' }}><div style={{ fontWeight: '900', color: T.accent }}>START SHRED PROTOCOL</div><div style={{ fontSize: '11px', color: '#555' }}>45s Rest • High Intensity</div></button>
              <button onClick={() => startPreset('POWER')} style={{ background: T.surface, border: `1px solid ${T.accent}`, padding: '20px', borderRadius: '20px', textAlign: 'left' }}><div style={{ fontWeight: '900', color: T.accent }}>START POWER PROTOCOL</div><div style={{ fontSize: '11px', color: '#555' }}>90s Rest • Build Muscle</div></button>
            </div>
          )}
          {[...(activeSession?.exercises || []), ...extraActivities].map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', borderLeft: `5px solid ${ex.isCardio ? '#444' : T.accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px', color: T.accent }}>{ex.name.toUpperCase()}</span>
                {ex.id.startsWith('ext') && <Trash2 size={16} color="#444" onClick={() => setExtraActivities(extraActivities.filter(a => a.id !== ex.id))} />}
              </div>
              {[...Array(ex.sets)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button onClick={() => { setCompletedSets(p => ({...p, [`${ex.id}-${i}`]: !p[`${ex.id}-${i}`]})); if(!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest); }}
                    style={{ width: '50px', height: '50px', borderRadius: '12px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? T.accent : '#222', color: '#000', fontWeight: '900' }}>{i+1}</button>
                  <input type="number" placeholder={ex.isCardio ? "MIN" : "KG"} value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: '#fff', textAlign: 'center', fontWeight: '800' }} />
                  <input type="number" placeholder={ex.isCardio ? "KM" : "REPS"} value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: T.accent, textAlign: 'center', fontWeight: '800' }} />
                </div>
              ))}
            </div>
          ))}
          {(activeSession || extraActivities.length > 0) && <button onClick={finishSession} style={{ background: T.accent, padding: '25px', borderRadius: '24px', border: 'none', fontWeight: '900', color: '#000' }}>LOG ELITE SESSION</button>}
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => setThemeKey(key)} style={{ background: T.surface, border: themeKey === key ? `2px solid ${theme.accent}` : 'none', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.accent }}></div>
              <span style={{ fontWeight: '700' }}>{theme.name}</span>
            </button>
          ))}
          <button onClick={() => { if(window.confirm('Wipe History?')) setHistory([]); }} style={{ marginTop: '20px', background: '#331111', color: '#ff4444', border: 'none', padding: '15px', borderRadius: '15px', fontWeight: '700' }}>RESET DATA</button>
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.text, color: T.bg, padding: '20px', borderRadius: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Clock size={28} /> <span style={{ fontSize: '36px', fontWeight: '900' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: T.accent, border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
