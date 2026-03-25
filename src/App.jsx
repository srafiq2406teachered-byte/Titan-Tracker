import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Settings, LayoutGrid, Zap, Flame, Target, Trash2, 
  ChevronRight, ChevronDown, ChevronUp, Save
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THEME ENGINE (Restored v39) ---
  const THEMES = {
    EMBER: { name: "Electric Ember", bg: '#0A0A0B', surface: '#161618', accent: '#FF4D00', text: '#FFFFFF', textDim: '#8E8E93', border: 'rgba(255, 77, 0, 0.1)' },
    CYAN: { name: "Deep Cyan", bg: '#050B0D', surface: '#0D1517', accent: '#00F0FF', text: '#E0F7FA', textDim: '#5C7E82', border: 'rgba(0, 240, 255, 0.1)' },
    CARBON: { name: "Stealth", bg: '#000', surface: '#111', accent: '#FFF', text: '#FFF', textDim: '#444', border: 'rgba(255,255,255,0.1)' }
  };

  // --- 2. MASTER DATA (Restored v35/36) ---
  const CORE_DATA = [
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
    PUSH: ["Tricep Pushdown", "Shoulder Press Machine", "Dips"],
    PULL: ["Bicep Curl Machine", "Face Pulls", "Hammer Curls"],
    CARDIO: ["Treadmill", "Stationary Bike", "Elliptical"]
  };

  const PRESETS = {
    SHRED: { name: "TITAN: SHRED", sub: "Fat Burn (45s Rest)", rest: 45, ids: ["A1", "A2", "B1", "D1", "D2"] },
    POWER: { name: "TITAN: POWER", sub: "Muscle Build (90s Rest)", rest: 90, ids: ["A1", "A2", "B1", "B2", "C1", "C2"] }
  };

  // --- 3. STATE & PERSISTENCE (Restored v34/38) ---
  const [view, setView] = useState('presets');
  const [themeKey, setThemeKey] = useState('EMBER');
  const [activeSession, setActiveSession] = useState(null);
  const [extraActivities, setExtraActivities] = useState([]);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expandedLog, setExpandedLog] = useState(null);
  const [mounted, setMounted] = useState(false);

  const T = THEMES[themeKey];

  useEffect(() => {
    const savedTheme = localStorage.getItem('tt_theme');
    const savedHistory = localStorage.getItem('tt_history');
    const savedData = localStorage.getItem('tt_active_data');
    if (savedTheme) setThemeKey(savedTheme);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedData) setExerciseData(JSON.parse(savedData));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tt_theme', themeKey);
      localStorage.setItem('tt_history', JSON.stringify(history));
      localStorage.setItem('tt_active_data', JSON.stringify(exerciseData));
    }
  }, [themeKey, history, exerciseData, mounted]);

  // --- 4. ENGINE LOGIC ---
  const startSession = (key) => {
    const p = PRESETS[key];
    const exercises = CORE_DATA.filter(m => p.ids.includes(m.id)).map(m => ({ ...m, sets: 3, rest: p.rest }));
    setActiveSession({ ...p, exercises });
    setView('train');
  };

  const addExtra = (name, group) => {
    const isCardio = group === 'CARDIO';
    const newEx = { id: `ext-${Date.now()}`, name, sets: isCardio ? 1 : 3, rest: 60, isCardio };
    setExtraActivities([...extraActivities, newEx]);
    setView('train');
  };

  const logSession = () => {
    let totalVol = 0;
    const allEx = [...(activeSession?.exercises || []), ...extraActivities];
    const details = allEx.map(ex => {
      const sets = [...Array(ex.sets)].map((_, i) => {
        const w = parseFloat(exerciseData[`${ex.id}-${i}-w`] || 0);
        const r = parseFloat(exerciseData[`${ex.id}-${i}-r`] || 0);
        if (completedSets[`${ex.id}-${i}`]) totalVol += (w * r);
        return { done: completedSets[`${ex.id}-${i}`], w, r };
      }).filter(s => s.done);
      return { name: ex.name, sets };
    }).filter(ex => ex.sets.length > 0);

    if (details.length === 0) return alert("No sets completed!");

    const newEntry = { id: Date.now(), date: new Date().toLocaleDateString('en-GB'), vol: totalVol, details, preset: activeSession?.name || "Custom" };
    setHistory([newEntry, ...history]);
    setActiveSession(null); setExtraActivities([]); setCompletedSets({}); setExerciseData({});
    setView('calendar');
  };

  if (!mounted) return null;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px 16px 120px 16px', transition: '0.3s' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: T.accent, fontWeight: '900', fontStyle: 'italic', margin: 0, fontSize: '24px' }}>TITAN</h1>
          <div style={{ fontSize: '10px', color: T.textDim, fontWeight: '800' }}>DOHA ELITE PROTOCOL</div>
        </div>
        <div style={{ display: 'flex', gap: '5px', background: T.surface, padding: '5px', borderRadius: '14px', border: `1px solid ${T.border}` }}>
          <button onClick={() => setView('presets')} style={{ border: 'none', background: view === 'presets' ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}><Target size={18} color={view === 'presets' ? '#000' : T.textDim} /></button>
          <button onClick={() => setView('library')} style={{ border: 'none', background: view === 'library' ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}><LayoutGrid size={18} color={view === 'library' ? '#000' : T.textDim} /></button>
          <button onClick={() => setView('calendar')} style={{ border: 'none', background: view === 'calendar' ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}><History size={18} color={view === 'calendar' ? '#000' : T.textDim} /></button>
          <button onClick={() => setView('settings')} style={{ border: 'none', background: view === 'settings' ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}><Settings size={18} color={view === 'settings' ? '#000' : T.textDim} /></button>
        </div>
      </div>

      {/* VIEW: PRESETS (Restored Functionality) */}
      {view === 'presets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => startSession(key)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '25px', borderRadius: '24px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ color: T.accent, fontWeight: '900', fontSize: '18px' }}>{p.name}</div><div style={{ fontSize: '12px', color: T.textDim }}>{p.sub}</div></div>
              <ChevronRight color={T.accent} />
            </button>
          ))}
        </div>
      )}

      {/* VIEW: LIBRARY (Restored v36 Categories) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(LIBRARY).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontSize: '11px', color: T.textDim, fontWeight: '900', marginBottom: '10px' }}>{group}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {items.map(item => (
                  <button key={item} onClick={() => addExtra(item, group)} style={{ background: T.surface, border: `1px solid ${T.border}`, color: '#fff', padding: '18px', borderRadius: '18px', fontSize: '13px', fontWeight: '700', textAlign: 'left' }}>+ {item}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN (The Hybrid UI) */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[...(activeSession?.exercises || []), ...extraActivities].map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}`, borderLeft: `5px solid ${ex.id.startsWith('ext') ? T.textDim : T.accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px', color: ex.id.startsWith('ext') ? T.textDim : T.accent }}>{ex.name.toUpperCase()}</span>
                {ex.id.startsWith('ext') && <Trash2 size={16} color={T.textDim} onClick={() => setExtraActivities(extraActivities.filter(a => a.id !== ex.id))} />}
              </div>
              {[...Array(ex.sets)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button onClick={() => { setCompletedSets(p => ({...p, [`${ex.id}-${i}`]: !p[`${ex.id}-${i}`]})); if(!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest); }}
                    style={{ width: '52px', height: '52px', borderRadius: '15px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? T.accent : '#222', color: '#000', fontWeight: '900' }}>{i+1}</button>
                  <input type="number" placeholder={ex.isCardio ? "MIN" : "KG"} value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={{ flex: 1, background: '#000', border: `1px solid ${T.border}`, borderRadius: '15px', color: '#fff', textAlign: 'center', fontWeight: '800' }} />
                  <input type="number" placeholder={ex.isCardio ? "KM" : "REPS"} value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{ flex: 1, background: '#000', border: `1px solid ${T.border}`, borderRadius: '15px', color: T.accent, textAlign: 'center', fontWeight: '800' }} />
                </div>
              ))}
            </div>
          ))}
          <button onClick={logSession} style={{ background: T.accent, padding: '25px', borderRadius: '24px', border: 'none', fontWeight: '950', color: '#000', marginTop: '10px', boxShadow: `0 10px 30px ${T.accent}33` }}>LOG ELITE SESSION</button>
        </div>
      )}

      {/* VIEW: CALENDAR (Deep History Restored) */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map(log => (
            <div key={log.id} style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              <div onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: '900', fontSize: '16px' }}>{log.date}</div><div style={{ fontSize: '12px', color: T.textDim }}>{log.preset}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ color: T.accent, fontWeight: '900', fontSize: '20px' }}>{log.vol.toLocaleString()}kg</div>{expandedLog === log.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}</div>
              </div>
              {expandedLog === log.id && (
                <div style={{ padding: '0 20px 20px 20px' }}>
                  {log.details.map((d, idx) => (
                    <div key={idx} style={{ borderTop: `1px solid ${T.border}`, padding: '10px 0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: T.accent }}>{d.name}</div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '5px' }}>
                        {d.sets.map((s, si) => <span key={si} style={{ fontSize: '10px', opacity: 0.6 }}>{s.w}x{s.r}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SETTINGS (Theme Selection) */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => setThemeKey(key)} style={{ background: T.surface, border: themeKey === key ? `2px solid ${theme.accent}` : `1px solid ${T.border}`, padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: theme.accent }}></div>
              <span style={{ fontWeight: '700' }}>{theme.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: T.text, color: T.bg, padding: '20px 30px', borderRadius: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Clock size={28} /> <span style={{ fontSize: '38px', fontWeight: '900', fontVariantNumeric: 'tabular-nums' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: T.accent, border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
