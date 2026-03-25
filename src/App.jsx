import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Settings, LayoutGrid, Zap, Flame, Target, Trash2, 
  ChevronRight, ChevronDown, ChevronUp, Save, Activity
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. MODERN THEMES ---
  const THEMES = {
    EMBER: { name: "Electric Ember", bg: '#0A0A0B', surface: '#161618', accent: '#FF4D00', text: '#FFFFFF', textDim: '#8E8E93', border: 'rgba(255, 77, 0, 0.1)' },
    CYAN: { name: "Deep Cyan", bg: '#050B0D', surface: '#0D1517', accent: '#00F0FF', text: '#E0F7FA', textDim: '#5C7E82', border: 'rgba(0, 240, 255, 0.1)' },
    CARBON: { name: "Stealth", bg: '#000', surface: '#111', accent: '#FFF', text: '#FFF', textDim: '#444', border: 'rgba(255,255,255,0.1)' }
  };

  // --- 2. 2026 SCIENTIFIC PRESETS ---
  // Protocol: High Frequency (2-3x per muscle/week) + Progressive Overload
  const PRESETS = {
    RECOMP_A: { 
      name: "TITAN: RECOMP A", 
      sub: "Upper/Lower Split (Strength Focus)", 
      rest: 120, // 2-min rest for heavy compound priority
      ids: ["A1", "A2", "B1", "C2", "D1"] 
    },
    RECOMP_B: { 
      name: "TITAN: RECOMP B", 
      sub: "Hypertrophy/Volume Focus", 
      rest: 75, // Moderate rest for metabolic stress
      ids: ["B2", "C1", "D2", "ext-leg-ext", "ext-tri"] 
    },
    METABOLIC: {
      name: "TITAN: METABOLIC",
      sub: "Full Body + Cardio Finisher",
      rest: 45,
      ids: ["A1", "B1", "C1", "ext-treadmill"]
    }
  };

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
    LEGS: [{id: "ext-leg-ext", name: "Leg Extension"}, {id: "ext-abd", name: "Hip Abductor"}, {id: "ext-add", name: "Hip Adductor"}],
    PUSH: [{id: "ext-tri", name: "Tricep Pushdown"}, {id: "ext-dip", name: "Dips"}],
    PULL: [{id: "ext-bc", name: "Bicep Machine"}, {id: "ext-fp", name: "Face Pulls"}],
    CARDIO: [{id: "ext-treadmill", name: "Treadmill", isCardio: true}, {id: "ext-bike", name: "Bike", isCardio: true}]
  };

  // --- 3. STATE ---
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

  // --- 4. PERSISTENCE ENGINE (Restored) ---
  useEffect(() => {
    const saved = {
      theme: localStorage.getItem('tt_theme'),
      history: localStorage.getItem('tt_history'),
      data: localStorage.getItem('tt_data')
    };
    if (saved.theme) setThemeKey(saved.theme);
    if (saved.history) setHistory(JSON.parse(saved.history));
    if (saved.data) setExerciseData(JSON.parse(saved.data));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tt_theme', themeKey);
      localStorage.setItem('tt_history', JSON.stringify(history));
      localStorage.setItem('tt_data', JSON.stringify(exerciseData));
    }
  }, [themeKey, history, exerciseData, mounted]);

  // --- 5. LOGIC ---
  const startSession = (key) => {
    const p = PRESETS[key];
    // Find all exercises from CORE or LIBRARY
    const exercises = [...CORE_DATA, ...Object.values(LIBRARY).flat()]
      .filter(ex => p.ids.includes(ex.id))
      .map(ex => ({ ...ex, sets: ex.isCardio ? 1 : 3, rest: p.rest }));
    setActiveSession({ ...p, exercises });
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
        return { done: completedSets[`${ex.id}-${i}`], w, r, isCardio: ex.isCardio };
      }).filter(s => s.done);
      return { name: ex.name, sets };
    }).filter(ex => ex.sets.length > 0);

    const newEntry = { id: Date.now(), date: new Date().toLocaleDateString('en-GB'), vol: totalVol, details, preset: activeSession?.name || "Custom" };
    setHistory([newEntry, ...history]);
    setActiveSession(null); setExtraActivities([]); setCompletedSets({});
    setView('calendar');
  };

  if (!mounted) return null;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '20px 16px 120px 16px', transition: '0.3s' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: T.accent, fontWeight: '900', fontStyle: 'italic', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '5px', background: T.surface, padding: '5px', borderRadius: '14px', border: `1px solid ${T.border}` }}>
          {[
            { id: 'presets', icon: <Target size={18}/> },
            { id: 'library', icon: <LayoutGrid size={18}/> },
            { id: 'calendar', icon: <History size={18}/> },
            { id: 'settings', icon: <Settings size={18}/> }
          ].map(btn => (
            <button key={btn.id} onClick={() => setView(btn.id)} style={{ border: 'none', background: view === btn.id ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}>
              {React.cloneElement(btn.icon, { color: view === btn.id ? '#000' : T.textDim })}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: PRESETS (The Engine) */}
      {view === 'presets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '10px', color: T.textDim, fontWeight: '900', letterSpacing: '1px' }}>RECOMP PROTOCOLS</div>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => startSession(key)} style={{ background: T.surface, border: `1px solid ${T.border}`, padding: '25px', borderRadius: '24px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: T.accent, fontWeight: '950', fontSize: '18px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', color: T.textDim }}>{p.sub}</div>
              </div>
              <ChevronRight color={T.accent} />
            </button>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN (The Core) */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[...(activeSession?.exercises || []), ...extraActivities].map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${T.border}`, borderLeft: `6px solid ${ex.isCardio ? '#444' : T.accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px', color: T.accent }}>{ex.name.toUpperCase()}</span>
                {ex.id.startsWith('ext') && <Trash2 size={16} onClick={() => setExtraActivities(extraActivities.filter(a => a.id !== ex.id))} />}
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
          <button onClick={logSession} style={{ background: T.accent, padding: '25px', borderRadius: '24px', border: 'none', fontWeight: '950', color: '#000' }}>FINISH & LOG SESSION</button>
        </div>
      )}

      {/* VIEW: CALENDAR (Expandable History) */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.length === 0 && <div style={{ color: T.textDim, textAlign: 'center', marginTop: '40px' }}>No sessions logged yet.</div>}
          {history.map(log => (
            <div key={log.id} style={{ background: T.surface, borderRadius: '24px', border: `1px solid ${T.border}` }}>
              <div onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: '900' }}>{log.date}</div><div style={{ fontSize: '11px', color: T.textDim }}>{log.preset}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ color: T.accent, fontWeight: '900' }}>{log.vol.toLocaleString()}kg</span> {expandedLog === log.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</div>
              </div>
              {expandedLog === log.id && (
                <div style={{ padding: '0 20px 20px 20px', borderTop: `1px solid ${T.border}` }}>
                  {log.details.map((d, i) => (
                    <div key={i} style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: T.accent }}>{d.name}</div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {d.sets.map((s, si) => <span key={si} style={{ fontSize: '10px', opacity: 0.6 }}>Set {si+1}: {s.w}{s.isCardio ? 'min' : 'kg'} x {s.r}{s.isCardio ? 'km' : ''}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
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
