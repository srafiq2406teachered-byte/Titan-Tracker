import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Trophy, Star, 
  ChevronDown, ChevronUp, Clock, PlusCircle, Trash2, X 
} from 'lucide-react';

const TitanTracker = () => {
  // --- MASTER PROTOCOL (Fixed Core) ---
  const MASTER_PROTOCOL = [
    { id: "A1", name: "Leg Press Machine", sets: 3, group: "Legs", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, group: "Back", rest: 60 },
    { id: "B1", name: "Chest Press Machine", sets: 3, group: "Chest", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, group: "Legs", rest: 60 },
    { id: "C1", name: "Seated Cable Row", sets: 3, group: "Back", rest: 60 },
    { id: "C2", name: "DB Overhead Press", sets: 3, group: "Shoulders", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, group: "Core", rest: 30 },
    { id: "D2", name: "Walking Lunges", sets: 3, group: "Legs", rest: 30 }
  ];

  const [view, setView] = useState('train');
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState([]); // Extra activities state
  const [history, setHistory] = useState([]);
  const [expandedLog, setExpandedLog] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_v34_sets');
    const savedData = localStorage.getItem('titan_v34_data');
    const savedHistory = localStorage.getItem('titan_v34_history');
    const savedCustom = localStorage.getItem('titan_v34_custom');
    
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_v34_sets', JSON.stringify(completedSets));
      localStorage.setItem('titan_v34_data', JSON.stringify(exerciseData));
      localStorage.setItem('titan_v34_history', JSON.stringify(history));
      localStorage.setItem('titan_v34_custom', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, history, customExercises, mounted]);

  // --- LOGIC: ADD EXTRA ACTIVITY ---
  const addExtraActivity = () => {
    const name = prompt("Enter machine or exercise name:");
    if (!name) return;
    const newEx = {
      id: `custom-${Date.now()}`,
      name: name,
      sets: 3, // Defaulting to 3 sets
      group: "Extra",
      rest: 60,
      isCustom: true
    };
    setCustomExercises([...customExercises, newEx]);
  };

  const removeExtra = (id) => {
    setCustomExercises(customExercises.filter(ex => ex.id !== id));
  };

  // --- ANALYTICS ---
  const getSessionStats = () => {
    let vol = 0;
    const allExercises = [...MASTER_PROTOCOL, ...customExercises];
    allExercises.forEach(ex => {
      for (let i = 0; i < ex.sets; i++) {
        if (completedSets[`${ex.id}-${i}`]) {
          const w = parseFloat(exerciseData[`${ex.id}-${i}-w`] || 0);
          const r = parseFloat(exerciseData[`${ex.id}-${i}-r`] || 0);
          vol += (w * r);
        }
      }
    });
    return { vol };
  };

  const handleLogWorkout = () => {
    const stats = getSessionStats();
    if (stats.vol === 0) return alert("Log some data first!");

    const allExercises = [...MASTER_PROTOCOL, ...customExercises];
    const logEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      totalVolume: stats.vol,
      details: allExercises.map(ex => ({
        name: ex.name,
        sets: [...Array(ex.sets)].map((_, i) => ({
          done: completedSets[`${ex.id}-${i}`],
          w: exerciseData[`${ex.id}-${i}-w`],
          r: exerciseData[`${ex.id}-${i}-r`]
        })).filter(s => s.done)
      })).filter(ex => ex.sets.length > 0)
    };

    setHistory([logEntry, ...history]);
    setCompletedSets({});
    setExerciseData({});
    setCustomExercises([]); // Clear extras after logging
    setView('calendar');
  };

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#121212', border: '#282828' };
  const currentStats = getSessionStats();

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', padding: '15px 15px 120px 15px', fontFamily: 'sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ color: THEME.orange, fontWeight: '950', fontStyle: 'italic', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '8px', background: '#111', padding: '5px', borderRadius: '15px', border: '1px solid #222' }}>
          <button onClick={() => setView('train')} style={{ border: 'none', background: view === 'train' ? THEME.orange : 'transparent', padding: '10px', borderRadius: '10px' }}><Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ border: 'none', background: view === 'metrics' ? THEME.orange : 'transparent', padding: '10px', borderRadius: '10px' }}><TrendingUp size={20} color={view === 'metrics' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('calendar')} style={{ border: 'none', background: view === 'calendar' ? THEME.orange : 'transparent', padding: '10px', borderRadius: '10px' }}><History size={20} color={view === 'calendar' ? '#000' : '#444'} /></button>
        </div>
      </div>

      {/* TRAIN VIEW */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[...MASTER_PROTOCOL, ...customExercises].map(ex => (
            <div key={ex.id} style={{ background: THEME.card, padding: '20px', borderRadius: '22px', border: `1px solid ${THEME.border}`, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '13px', color: THEME.orange }}>{ex.name.toUpperCase()}</span>
                {ex.isCustom && <button onClick={() => removeExtra(ex.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444' }}><Trash2 size={16}/></button>}
              </div>
              
              {[...Array(ex.sets)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button 
                    onClick={() => {
                      setCompletedSets(prev => ({ ...prev, [`${ex.id}-${i}`]: !prev[`${ex.id}-${i}`] }));
                      if (!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest);
                    }}
                    style={{ width: '50px', height: '50px', borderRadius: '12px', border: 'none', background: completedSets[`${ex.id}-${i}`] ? THEME.orange : '#1a1a1a', color: '#000', fontWeight: '900' }}
                  >
                    {i+1}
                  </button>
                  <input type="number" placeholder="KG" value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: '#fff', textAlign: 'center', fontWeight: 'bold' }} />
                  <input type="number" placeholder="R" value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '12px', color: THEME.orange, textAlign: 'center', fontWeight: 'bold' }} />
                </div>
              ))}
            </div>
          ))}
          
          <button onClick={addExtraActivity} style={{ background: '#111', color: THEME.orange, padding: '15px', borderRadius: '15px', border: `1px dashed ${THEME.orange}`, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <PlusCircle size={20} /> ADD EXTRA ACTIVITY
          </button>
          
          <button onClick={handleLogWorkout} style={{ background: THEME.orange, padding: '22px', borderRadius: '18px', border: 'none', fontWeight: '950', fontSize: '16px', color: '#000', marginTop: '10px' }}>FINISH & LOG SESSION</button>
        </div>
      )}

      {/* METRICS VIEW */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: THEME.card, padding: '30px', borderRadius: '25px', textAlign: 'center', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: '11px', color: '#555', fontWeight: '900', letterSpacing: '1px' }}>SESSION VOLUME</div>
            <div style={{ fontSize: '56px', fontWeight: '950', color: THEME.orange }}>{currentStats.vol.toLocaleString()} <span style={{ fontSize: '18px' }}>KG</span></div>
          </div>
          
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '25px', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: '11px', color: '#555', fontWeight: '900', marginBottom: '15px' }}>VOLUME HISTORY</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '5px' }}>
              {history.slice(-10).reverse().map((h, i) => (
                <div key={i} style={{ flex: 1, background: THEME.orange, height: `${(h.totalVolume / Math.max(...history.map(x => x.totalVolume), 1)) * 100}%`, borderRadius: '4px' }}></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOGS VIEW */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.map(log => (
            <div key={log.id} style={{ background: THEME.card, borderRadius: '20px', border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
              <div onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '900', fontSize: '16px' }}>{log.date}</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{log.details.length} Exercises</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ color: THEME.orange, fontWeight: '900', fontSize: '20px' }}>{log.totalVolume.toLocaleString()}kg</div>
                  {expandedLog === log.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </div>
              </div>
              {expandedLog === log.id && (
                <div style={{ padding: '0 20px 20px 20px', background: '#080808' }}>
                  {log.details.map((ex, i) => (
                    <div key={i} style={{ borderTop: '1px solid #1a1a1a', padding: '10px 0' }}>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: THEME.orange, marginBottom: '5px' }}>{ex.name}</div>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {ex.sets.map((s, si) => (
                          <div key={si} style={{ fontSize: '10px', background: '#111', padding: '4px 8px', borderRadius: '6px' }}>
                            {s.w}kg x {s.r}
                          </div>
                        ))}
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
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: '#fff', color: '#000', padding: '20px', borderRadius: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 500, border: `5px solid ${THEME.orange}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Clock size={28} /> <span style={{ fontSize: '36px', fontWeight: '900' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: THEME.orange, border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: '900' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
