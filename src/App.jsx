import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Trash2, ChevronDown, ChevronUp, Zap, Activity, Box 
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

  // --- PRESET LIBRARY ---
  const LIBRARY = {
    LEGS: ["Hip Abductor", "Hip Adductor", "Leg Extension", "Calf Press"],
    PUSH: ["Tricep Pushdown", "Shoulder Press Machine", "Dips"],
    PULL: ["Bicep Curl Machine", "Face Pulls", "Hammer Curls"],
    CARDIO: ["Treadmill", "Stationary Bike", "Elliptical", "Stairmaster"]
  };

  const [view, setView] = useState('train');
  const [activeExtras, setActiveExtras] = useState([]);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expandedLog, setExpandedLog] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sSets = localStorage.getItem('tt_v36_sets');
    const sData = localStorage.getItem('tt_v36_data');
    const sHist = localStorage.getItem('tt_v36_hist');
    const sExts = localStorage.getItem('tt_v36_exts');
    if (sSets) setCompletedSets(JSON.parse(sSets));
    if (sData) setExerciseData(JSON.parse(sData));
    if (sHist) setHistory(JSON.parse(sHist));
    if (sExts) setActiveExtras(JSON.parse(sExts));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tt_v36_sets', JSON.stringify(completedSets));
      localStorage.setItem('tt_v36_data', JSON.stringify(exerciseData));
      localStorage.setItem('tt_v36_hist', JSON.stringify(history));
      localStorage.setItem('tt_v36_exts', JSON.stringify(activeExtras));
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

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#111', border: '#222' };

  if (!mounted) return null;

  return (
    <div style={{ background: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '15px 15px 120px 15px' }}>
      
      {/* NAVBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: THEME.orange, fontWeight: '900', fontStyle: 'italic', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '5px', background: '#111', padding: '5px', borderRadius: '15px' }}>
          <button onClick={() => setView('train')} style={{ border: 'none', background: view === 'train' ? THEME.orange : 'transparent', padding: '10px', borderRadius: '10px' }}><Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ border: 'none', background: view === 'library' ? THEME.orange : 'transparent', padding: '10px', borderRadius: '10px' }}><PlusCircle size={20} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ border: 'none', background: view === 'metrics' ? THEME.orange : 'transparent', padding: '10px', borderRadius: '10px' }}><TrendingUp size={20} color={view === 'metrics' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('calendar')} style={{ border: 'none', background: view === 'calendar' ? THEME.orange : 'transparent', padding: '10px', borderRadius: '10px' }}><History size={20} color={view === 'calendar' ? '#000' : '#444'} /></button>
        </div>
      </div>

      {/* VIEW: LIBRARY (Separate Page) */}
      {view === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {Object.entries(LIBRARY).map(([group, items]) => (
            <div key={group}>
              <div style={{ fontSize: '11px', color: '#555', fontWeight: '900', marginBottom: '10px', letterSpacing: '1px' }}>{group}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {items.map(item => (
                  <button key={item} onClick={() => addFromLibrary(item, group)} style={{ background: THEME.card, border: `1px solid ${THEME.border}`, color: '#fff', padding: '15px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', textAlign: 'left' }}>
                    + {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[...PROTOCOL, ...activeExtras].map(ex => (
            <div key={ex.id} style={{ background: THEME.card, padding: '20px', borderRadius: '22px', border: `1px solid ${THEME.border}`, borderLeft: ex.id.startsWith('extra') ? '4px solid #444' : `4px solid ${THEME.orange}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px', color: ex.id.startsWith('extra') ? '#666' : THEME.orange }}>{ex.name.toUpperCase()}</span>
                {ex.id.startsWith('extra') && <Trash2 size={16} color="#444" onClick={() => setActiveExtras(activeExtras.filter(ae => ae.id !== ex.id))} />}
              </div>
              {[...Array(ex.sets)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button onClick={() => { setCompletedSets(prev => ({ ...prev, [`${ex.id}-${i}`]: !prev[`${ex.id}-${i}`] })); if (!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest); }} 
                    style={{ width: '50px', height: '50px', borderRadius: '12px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? THEME.orange : '#1a1a1a', color: '#000', fontWeight: '900' }}>{i+1}</button>
                  <input type="number" placeholder={ex.isCardio ? "MINS" : "KG"} value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: '#fff', textAlign: 'center', fontWeight: 'bold' }} />
                  <input type="number" placeholder={ex.isCardio ? "KM" : "REPS"} value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: THEME.orange, textAlign: 'center', fontWeight: 'bold' }} />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleFinish} style={{ background: THEME.orange, padding: '25px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '18px', color: '#000' }}>LOG SESSION</button>
        </div>
      )}

      {/* VIEW: METRICS & CALENDAR (Simplified for clarity) */}
      {view === 'metrics' && <div style={{ background: THEME.card, padding: '30px', borderRadius: '25px', textAlign: 'center' }}><div style={{ fontSize: '12px', color: '#444' }}>SESSION VOLUME</div><div style={{ fontSize: '48px', fontWeight: '900', color: THEME.orange }}>{getStats().toLocaleString()}kg</div></div>}

      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map(log => (
            <div key={log.id} style={{ background: THEME.card, padding: '20px', borderRadius: '20px' }}>
              <div style={{ fontWeight: '900' }}>{log.date} — {log.vol.toLocaleString()}kg</div>
              <div style={{ fontSize: '11px', color: '#444', marginTop: '5px' }}>{log.details.map(d => d.name).join(', ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* TIMER */}
      {timeLeft > 0 && <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: '#fff', color: '#000', padding: '20px', borderRadius: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, border: `4px solid ${THEME.orange}` }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Clock size={28} /> <span style={{ fontSize: '36px', fontWeight: '900' }}>{timeLeft}s</span></div><button onClick={() => setTimeLeft(0)} style={{ background: THEME.orange, border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900' }}>SKIP</button></div>}
    </div>
  );
};

export default TitanTracker;
