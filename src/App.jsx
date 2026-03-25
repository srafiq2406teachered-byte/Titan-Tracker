import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Trash2, ChevronDown, ChevronUp, Zap, Activity, Box, LayoutGrid
} from 'lucide-react';

const TitanTracker = () => {
  // --- CORE PROTOCOL ---
  const PROTOCOL = [
    { id: "A1", name: "Leg Press Machine", sets: 3, group: "LEGS", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, group: "PULL", rest: 60 },
    { id: "B1", name: "Chest Press Machine", sets: 3, group: "PUSH", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, group: "LEGS", rest: 60 },
    { id: "C1", name: "Seated Cable Row", sets: 3, group: "PULL", rest: 60 },
    { id: "C2", name: "DB Overhead Press", sets: 3, group: "PUSH", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, group: "CORE", rest: 30 },
    { id: "D2", name: "Walking Lunges", sets: 3, group: "LEGS", rest: 30 }
  ];

  // --- PRESET LIBRARY (Categories for Extra Page) ---
  const LIBRARY = {
    LEGS: ["Hip Abductor", "Hip Adductor", "Leg Extension", "Calf Press"],
    PUSH: ["Tricep Pushdown", "Shoulder Press Machine", "Dips"],
    PULL: ["Bicep Curl Machine", "Face Pulls", "Hammer Curls"],
    CARDIO: ["Treadmill", "Stationary Bike", "Elliptical", "Stairmaster"]
  };

  // --- THEME DEFINITION ---
  const THEME = {
    bg: '#0A0A0B',
    surface: '#161618',
    surfaceLight: '#222225',
    accent: '#FF4D00', // Electric Ember
    accentDim: '#3D1B0B',
    text: '#FFFFFF',
    textDim: '#8E8E93',
    border: 'rgba(255, 255, 255, 0.08)',
    success: '#32D74B'
  };

  const [view, setView] = useState('train');
  const [activeExtras, setActiveExtras] = useState([]);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);

  // --- PERSISTENCE ---
  useEffect(() => {
    const sSets = localStorage.getItem('tt_v37_sets');
    const sData = localStorage.getItem('tt_v37_data');
    const sHist = localStorage.getItem('tt_v37_hist');
    const sExts = localStorage.getItem('tt_v37_exts');
    if (sSets) setCompletedSets(JSON.parse(sSets));
    if (sData) setExerciseData(JSON.parse(sData));
    if (sHist) setHistory(JSON.parse(sHist));
    if (sExts) setActiveExtras(JSON.parse(sExts));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tt_v37_sets', JSON.stringify(completedSets));
      localStorage.setItem('tt_v37_data', JSON.stringify(exerciseData));
      localStorage.setItem('tt_v37_hist', JSON.stringify(history));
      localStorage.setItem('tt_v37_exts', JSON.stringify(activeExtras));
    }
  }, [completedSets, exerciseData, history, activeExtras, mounted]);

  const addFromLibrary = (name, group) => {
    const id = `extra-${Date.now()}`;
    const isCardio = group === 'CARDIO';
    setActiveExtras([...activeExtras, { id, name, group, sets: isCardio ? 1 : 3, isCardio }]);
    setView('train');
  };

  const getStats = () => {
    let vol = 0;
    [...PROTOCOL, ...activeExtras].forEach(ex => {
      for (let i = 0; i < ex.sets; i++) {
        if (completedSets[`${ex.id}-${i}`]) {
          const w = parseFloat(exerciseData[`${ex.id}-${i}-w`] || 0);
          const r = parseFloat(exerciseData[`${ex.id}-${i}-r`] || 0);
          vol += (w * r);
        }
      }
    });
    return vol;
  };

  const handleFinish = () => {
    const vol = getStats();
    if (vol === 0 && activeExtras.length === 0) return;
    const log = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      vol,
      details: [...PROTOCOL, ...activeExtras].map(ex => ({
        name: ex.name,
        sets: [...Array(ex.sets)].map((_, i) => ({
          done: completedSets[`${ex.id}-${i}`],
          w: exerciseData[`${ex.id}-${i}-w`],
          r: exerciseData[`${ex.id}-${i}-r`]
        })).filter(s => s.done)
      })).filter(ex => ex.sets.length > 0)
    };
    setHistory([log, ...history]);
    setCompletedSets({}); setExerciseData({}); setActiveExtras([]);
    setView('calendar');
  };

  if (!mounted) return null;

  return (
    <div style={{ background: THEME.bg, minHeight: '100vh', color: THEME.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: 'env(safe-area-inset-top) 16px 120px 16px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingTop: '10px' }}>
        <div>
          <h1 style={{ color: THEME.accent, fontWeight: '900', fontStyle: 'italic', fontSize: '24px', margin: 0, letterSpacing: '-0.5px' }}>TITAN</h1>
          <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: '700', letterSpacing: '1px' }}>DOHA ELITE V37</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: THEME.surface, padding: '6px', borderRadius: '14px', border: `1px solid ${THEME.border}` }}>
          {[
            { id: 'train', icon: <Dumbbell size={20} /> },
            { id: 'library', icon: <LayoutGrid size={20} /> },
            { id: 'metrics', icon: <TrendingUp size={20} /> },
            { id: 'calendar', icon: <History size={20} /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{ border: 'none', background: view === tab.id ? THEME.accent : 'transparent', padding: '10px', borderRadius: '10px', color: view === tab.id ? '#000' : THEME.textDim, transition: 'all 0.2s ease' }}>{tab.icon}</button>
          ))}
        </div>
      </div>

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {Object.entries(LIBRARY).map(([group, items]) => (
            <div key={group} style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '11px', color: THEME.textDim, fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' }}>{group}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {items.map(item => (
                  <button key={item} onClick={() => addFromLibrary(item, group)} style={{ background: THEME.surface, border: `1px solid ${THEME.border}`, color: THEME.text, padding: '18px 14px', borderRadius: '16px', fontSize: '13px', fontWeight: '700', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PlusCircle size={14} color={THEME.accent} /> {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[...PROTOCOL, ...activeExtras].map(ex => (
            <div key={ex.id} style={{ background: THEME.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${THEME.border}`, position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                <span style={{ fontWeight: '800', fontSize: '14px', color: ex.id.startsWith('extra') ? THEME.textDim : THEME.accent }}>{ex.name.toUpperCase()}</span>
                {ex.id.startsWith('extra') && <Trash2 size={16} color={THEME.textDim} onClick={() => setActiveExtras(activeExtras.filter(ae => ae.id !== ex.id))} />}
              </div>
              
              {[...Array(ex.sets)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <button onClick={() => { setCompletedSets(prev => ({ ...prev, [`${ex.id}-${i}`]: !prev[`${ex.id}-${i}`] })); if (!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest); }} 
                    style={{ width: '54px', height: '54px', borderRadius: '16px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? THEME.accent : THEME.surfaceLight, color: completedSets[`${ex.id}-${i}`] ? '#000' : THEME.textDim, fontWeight: '900', fontSize: '18px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>{i+1}</button>
                  <input type="number" placeholder={ex.isCardio ? "MINS" : "KG"} value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={{ flex: 1.2, background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '16px', color: THEME.text, textAlign: 'center', fontWeight: '800', fontSize: '16px' }} />
                  <input type="number" placeholder={ex.isCardio ? "KM" : "REPS"} value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{ flex: 1, background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '16px', color: THEME.accent, textAlign: 'center', fontWeight: '800', fontSize: '16px' }} />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleFinish} style={{ background: THEME.accent, padding: '24px', borderRadius: '22px', border: 'none', fontWeight: '900', fontSize: '18px', color: '#000', marginTop: '10px', boxShadow: `0 8px 24px ${THEME.accentDim}` }}>LOG ELITE SESSION</button>
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: THEME.surface, padding: '40px 20px', borderRadius: '30px', textAlign: 'center', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: '12px', color: THEME.textDim, fontWeight: '800', letterSpacing: '1px', marginBottom: '10px' }}>SESSION VOLUME</div>
            <div style={{ fontSize: '64px', fontWeight: '900', color: THEME.accent }}>{getStats().toLocaleString()}<span style={{ fontSize: '20px', marginLeft: '4px' }}>kg</span></div>
          </div>
        </div>
      )}

      {/* VIEW: CALENDAR */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map(log => (
            <div key={log.id} style={{ background: THEME.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${THEME.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '18px' }}>{log.date}</div>
                  <div style={{ fontSize: '12px', color: THEME.textDim, marginTop: '4px' }}>{log.details.length} Exercises Complete</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: '900', color: THEME.accent }}>{log.vol.toLocaleString()}kg</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FLOATING TIMER */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', color: '#000', padding: '18px 25px', borderRadius: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2000, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Activity size={24} className="animate-pulse" />
            <span style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span>
          </div>
          <button onClick={() => setTimeLeft(0)} style={{ background: '#000', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: '900', fontSize: '14px' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
