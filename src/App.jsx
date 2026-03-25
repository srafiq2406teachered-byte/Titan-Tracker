import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Settings, LayoutGrid, Zap, Flame, Target, Trash2, ChevronRight
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. THEME ENGINE ---
  const THEMES = {
    EMBER: { name: "Electric Ember", bg: '#0A0A0B', surface: '#161618', accent: '#FF4D00', text: '#FFFFFF' },
    CYAN: { name: "Deep Cyan", bg: '#050B0D', surface: '#0D1517', accent: '#00F0FF', text: '#E0F7FA' },
    CARBON: { name: "Stealth", bg: '#000', surface: '#111', accent: '#FFF', text: '#FFF' }
  };

  // --- 2. MASTER REPOSITORY ---
  const CORE_MACHINES = [
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
    LEGS: ["Hip Abductor", "Hip Adductor", "Leg Extension"],
    PUSH: ["Tricep Pushdown", "Dips"],
    PULL: ["Bicep Curl Machine", "Face Pulls"],
    CARDIO: ["Treadmill", "Bike", "Elliptical"]
  };

  // --- 3. DAY PRESETS ---
  const PRESETS = {
    SHRED: { name: "TITAN: SHRED", sub: "Fat Burn Focus", rest: 45, coreIds: ["A1", "A2", "B1", "D1", "D2"] },
    POWER: { name: "TITAN: POWER", sub: "Muscle Build Focus", rest: 90, coreIds: ["A1", "A2", "B1", "B2", "C1", "C2"] }
  };

  // --- 4. STATE MANAGEMENT ---
  const [view, setView] = useState('presets');
  const [themeKey, setThemeKey] = useState('EMBER');
  const [activeSession, setActiveSession] = useState(null);
  const [extraActivities, setExtraActivities] = useState([]);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);

  const T = THEMES[themeKey];

  useEffect(() => {
    const savedTheme = localStorage.getItem('tt_theme');
    if (savedTheme) setThemeKey(savedTheme);
    setMounted(true);
  }, []);

  // --- 5. LOGIC HANDLERS ---
  const startSession = (key) => {
    const preset = PRESETS[key];
    const exercises = CORE_MACHINES.filter(m => preset.coreIds.includes(m.id))
      .map(m => ({ ...m, sets: 3, rest: preset.rest }));
    setActiveSession({ ...preset, exercises });
    setView('train');
  };

  const addExtra = (name, group) => {
    const isCardio = group === 'CARDIO';
    const newEx = { id: `ext-${Date.now()}`, name, sets: isCardio ? 1 : 3, rest: 60, isCardio };
    setExtraActivities([...extraActivities, newEx]);
    setView('train');
  };

  if (!mounted) return null;

  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, fontFamily: 'sans-serif', padding: '20px 16px 120px 16px' }}>
      
      {/* GLOBAL HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: T.accent, fontWeight: '900', fontStyle: 'italic', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '5px', background: T.surface, padding: '5px', borderRadius: '14px' }}>
          <button onClick={() => setView('presets')} style={{ border: 'none', background: view === 'presets' ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}><Target size={18} color={view === 'presets' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ border: 'none', background: view === 'library' ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}><LayoutGrid size={18} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('settings')} style={{ border: 'none', background: view === 'settings' ? T.accent : 'transparent', padding: '10px', borderRadius: '10px' }}><Settings size={18} color={view === 'settings' ? '#000' : '#444'} /></button>
        </div>
      </div>

      {/* VIEW: PRESETS (Day Selection) */}
      {view === 'presets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ fontSize: '11px', color: '#555', fontWeight: '900' }}>SELECT TRAINING GOAL</div>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => startSession(key)} style={{ background: T.surface, border: '1px solid rgba(255,255,255,0.05)', padding: '25px', borderRadius: '24px', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: T.accent, fontWeight: '900', fontSize: '18px' }}>{p.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>{p.sub} • {p.rest}s Rest</div>
              </div>
              <ChevronRight color={T.accent} />
            </button>
          ))}
        </div>
      )}

      {/* VIEW: LIBRARY (Extras) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(LIBRARY).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: '900', marginBottom: '10px' }}>{group}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {items.map(item => (
                  <button key={item} onClick={() => addExtra(item, group)} style={{ background: T.surface, border: 'none', color: '#fff', padding: '18px', borderRadius: '15px', fontSize: '13px', fontWeight: '700', textAlign: 'left' }}>+ {item}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN (The Core App) */}
      {view === 'train' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[...activeSession.exercises, ...extraActivities].map(ex => (
            <div key={ex.id} style={{ background: T.surface, padding: '20px', borderRadius: '24px', borderLeft: `4px solid ${ex.id.startsWith('ext') ? '#444' : T.accent}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px', color: ex.id.startsWith('ext') ? '#666' : T.accent }}>{ex.name.toUpperCase()}</span>
                {ex.id.startsWith('ext') && <Trash2 size={14} onClick={() => setExtraActivities(extraActivities.filter(a => a.id !== ex.id))} />}
              </div>
              {[...Array(ex.sets)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button onClick={() => { setCompletedSets(p => ({...p, [`${ex.id}-${i}`]: !p[`${ex.id}-${i}`]})); setTimeLeft(ex.rest); }}
                    style={{ width: '50px', height: '50px', borderRadius: '12px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? T.accent : '#222', color: '#000', fontWeight: '900' }}>{i+1}</button>
                  <input type="number" placeholder={ex.isCardio ? "MINS" : "KG"} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: '#fff', textAlign: 'center', fontWeight: '800' }} />
                  <input type="number" placeholder={ex.isCardio ? "KM" : "REPS"} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: T.accent, textAlign: 'center', fontWeight: '800' }} />
                </div>
              ))}
            </div>
          ))}
          <button onClick={() => setView('presets')} style={{ background: T.accent, padding: '22px', borderRadius: '20px', border: 'none', fontWeight: '900', color: '#000' }}>FINISH SESSION</button>
        </div>
      )}

      {/* VIEW: SETTINGS */}
      {view === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {Object.entries(THEMES).map(([key, theme]) => (
            <button key={key} onClick={() => { setThemeKey(key); localStorage.setItem('tt_theme', key); }} style={{ background: T.surface, border: themeKey === key ? `2px solid ${theme.accent}` : 'none', padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: theme.accent }}></div>
              <span style={{ fontWeight: '700' }}>{theme.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: '#fff', color: '#000', padding: '20px', borderRadius: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, border: `4px solid ${T.accent}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Clock size={28} /> <span style={{ fontSize: '36px', fontWeight: '900' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: T.accent, border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
