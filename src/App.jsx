import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, Dumbbell, BarChart3, PlusCircle, X, 
  ChevronRight, Activity, Trash2, StopCircle, Timer, Zap, 
  History, TrendingUp, Trophy, Star, ChevronDown, ChevronUp, PieChart 
} from 'lucide-react';

const TitanTracker = () => {
  // --- MASTER DATA & MUSCLE MAPPING ---
  const MASTER_PROTOCOL = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10", rest: 60, group: "Legs" },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", rest: 60, group: "Back" },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10", rest: 60, group: "Chest" },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15", rest: 60, group: "Legs" },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12", rest: 60, group: "Back" },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12", rest: 60, group: "Shoulders" },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s", rest: 30, group: "Core" },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", rest: 30, group: "Legs" }
  ];

  // --- STATE ---
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [showPB, setShowPB] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_sets_v32');
    const savedData = localStorage.getItem('titan_metrics_v32');
    const savedHistory = localStorage.getItem('titan_history_v32');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_sets_v32', JSON.stringify(completedSets));
      localStorage.setItem('titan_metrics_v32', JSON.stringify(exerciseData));
      localStorage.setItem('titan_history_v32', JSON.stringify(history));
    }
  }, [completedSets, exerciseData, history, mounted]);

  // --- ANALYTICS ENGINE ---
  const getStats = () => {
    let volume = 0, max1RM = 0;
    let groupVol = { Legs: 0, Back: 0, Chest: 0, Shoulders: 0, Core: 0 };
    
    MASTER_PROTOCOL.forEach(ex => {
      for (let i = 0; i < ex.sets; i++) {
        const key = `${ex.id}-${i}`;
        if (completedSets[key]) {
          const w = parseFloat(exerciseData[`${key}-w`] || 0);
          const r = parseFloat(exerciseData[`${key}-r`] || 0);
          const setVol = w * r;
          volume += setVol;
          groupVol[ex.group] = (groupVol[ex.group] || 0) + setVol;
          if (r > 0) {
            const current1RM = w * (1 + (r / 30));
            if (current1RM > max1RM) max1RM = current1RM;
          }
        }
      }
    });
    return { volume, max1RM: Math.round(max1RM), groupVol };
  };

  const getLastPerformance = (exId) => {
    if (history.length === 0) return null;
    for (let i = history.length - 1; i >= 0; i--) {
      const entry = history[i].exercises?.[exId];
      if (entry) return entry;
    }
    return null;
  };

  const handleFinish = () => {
    const stats = getStats();
    if (stats.volume === 0) return alert("Log some weight first!");

    const allTimeBest = history.length > 0 ? Math.max(...history.map(h => h.volume)) : 0;
    const isNewPB = stats.volume > allTimeBest && history.length > 0;

    // Deep Save: Capturing every set detail for history
    const sessionDetails = {};
    MASTER_PROTOCOL.forEach(ex => {
      const sets = [];
      for (let i = 0; i < ex.sets; i++) {
        if (completedSets[`${ex.id}-${i}`]) {
          sets.push({ w: exerciseData[`${ex.id}-${i}-w`], r: exerciseData[`${ex.id}-${i}-r`] });
        }
      }
      if (sets.length > 0) sessionDetails[ex.id] = { name: ex.name, sets };
    });

    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      volume: stats.volume,
      peak: stats.max1RM,
      isPB: isNewPB,
      exercises: sessionDetails,
      groupVol: stats.groupVol
    };

    setHistory([...history, newEntry]);
    if (isNewPB) { setShowPB(true); setTimeout(() => setShowPB(false), 4000); }
    setCompletedSets({}); setExerciseData({});
    setView('calendar');
  };

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#111', border: '#222', textDim: '#555', gold: '#FFD700' };
  const stats = getStats();
  const maxVolHistory = Math.max(...history.map(h => h.volume), 1);

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '10px 10px 120px 10px' }}>
      
      {/* PB CELEBRATION */}
      {showPB && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 92, 0, 0.98)', zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Trophy size={140} color="#000" strokeWidth={3} />
          <h1 style={{ color: '#000', fontSize: '50px', fontWeight: '950', margin: '0' }}>NEW PB</h1>
          <div style={{ color: '#000', fontSize: '24px', fontWeight: '800' }}>{stats.volume} KG CRUSHED</div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '10px 5px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '950', fontStyle: 'italic', color: THEME.orange, margin: 0, letterSpacing: '-1px' }}>TITAN</h1>
          <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: '900', letterSpacing: '2px' }}>V32.0 ELITE</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '6px', borderRadius: '18px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><Dumbbell size={22} color={view === 'train' ? '#000' : '#666'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><TrendingUp size={22} color={view === 'metrics' ? '#000' : '#666'} /></button>
          <button onClick={() => setView('calendar')} style={{ background: view === 'calendar' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><History size={22} color={view === 'calendar' ? '#000' : '#666'} /></button>
        </div>
      </header>

      {/* VIEW: ENHANCED METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Trend Chart */}
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '28px', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: '12px', color: THEME.textDim, fontWeight: '900', marginBottom: '25px' }}>SESSION VOLUME TREND</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', gap: '8px' }}>
              {history.slice(-8).map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '100%', background: h.isPB ? THEME.gold : THEME.orange, height: `${(h.volume / maxVolHistory) * 100}%`, borderRadius: '6px', minHeight: '8px', position: 'relative', transition: 'height 0.5s ease' }}>
                    {h.isPB && <Star size={12} color="#000" fill="#000" style={{ position: 'absolute', top: '-18px', left: '20%' }} />}
                  </div>
                  <span style={{ fontSize: '9px', color: THEME.textDim, fontWeight: 'bold' }}>{h.date.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Muscle Distribution Breakdown */}
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '28px', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: '12px', color: THEME.textDim, fontWeight: '900', marginBottom: '15px' }}>MUSCLE GROUP VOLUME (LIVE)</div>
            {Object.entries(stats.groupVol).map(([name, vol]) => (
              <div key={name} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 'bold' }}>{name}</span>
                  <span style={{ color: THEME.orange }}>{vol.toLocaleString()} kg</span>
                </div>
                <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: THEME.orange, width: `${(vol / (stats.volume || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN (WITH GHOST DATA) */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {MASTER_PROTOCOL.map((ex) => {
            const last = getLastPerformance(ex.id);
            return (
              <div key={ex.id} style={{ background: THEME.card, borderRadius: '24px', padding: '20px', border: `1px solid ${THEME.border}`, borderLeft: `6px solid ${THEME.orange}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{ex.name}</div>
                    <div style={{ fontSize: '11px', color: THEME.textDim, fontWeight: 'bold', marginTop: '2px' }}>TARGET: {ex.goal} REPS</div>
                  </div>
                  {last && (
                    <div style={{ background: '#1a1a1a', padding: '5px 10px', borderRadius: '10px', textAlign: 'right', border: '1px solid #333' }}>
                      <div style={{ fontSize: '9px', color: THEME.orange, fontWeight: '900' }}>LAST SESSION</div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{last.sets[0]?.w}kg x {last.sets[0]?.r}</div>
                    </div>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[...Array(ex.sets)].map((_, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => { 
                          setCompletedSets({...completedSets, [`${ex.id}-${i}`]: !completedSets[`${ex.id}-${i}`]}); 
                          if(!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest);
                        }} 
                        style={{ width: '55px', height: '55px', background: completedSets[`${ex.id}-${i}`] ? THEME.orange : '#1a1a1a', border: 'none', borderRadius: '15px', color: '#000', fontWeight: '900', fontSize: '20px' }}
                      >
                        {completedSets[`${ex.id}-${i}`] ? '✓' : i + 1}
                      </button>
                      <input 
                        type="number" inputMode="decimal" placeholder="KG" 
                        value={exerciseData[`${ex.id}-${i}-w`] || ''} 
                        onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} 
                        style={{ flex: 1.2, background: '#000', border: `1px solid ${THEME.border}`, borderRadius: '15px', color: '#fff', textAlign: 'center', fontSize: '18px', fontWeight: '900' }} 
                      />
                      <input 
                        type="number" inputMode="numeric" placeholder="REPS" 
                        value={exerciseData[`${ex.id}-${i}-r`] || ''} 
                        onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} 
                        style={{ flex: 1, background: '#000', border: `1px solid ${THEME.border}`, borderRadius: '15px', color: THEME.orange, textAlign: 'center', fontSize: '18px', fontWeight: '900' }} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          <button onClick={handleFinish} style={{ background: THEME.orange, padding: '25px', borderRadius: '25px', border: 'none', fontWeight: '950', color: '#000', fontSize: '20px', marginTop: '10px', boxShadow: `0 15px 30px rgba(255, 92, 0, 0.25)` }}>LOG ELITE SESSION</button>
        </div>
      )}

      {/* VIEW: DEEP-DIVE LOGS */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontSize: '12px', color: THEME.textDim, fontWeight: '900', letterSpacing: '2px', paddingLeft: '5px' }}>SESSION ARCHIVE</h2>
          {[...history].reverse().map((log) => (
            <div key={log.id} style={{ background: THEME.card, borderRadius: '24px', border: `1px solid ${log.isPB ? THEME.gold : THEME.border}`, overflow: 'hidden' }}>
              <div 
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '950', color: log.isPB ? THEME.gold : '#fff' }}>{log.date} {log.isPB && '🏆'}</div>
                  <div style={{ fontSize: '12px', color: THEME.textDim, fontWeight: 'bold' }}>{Object.keys(log.exercises).length} Exercises Completed</div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '950', color: THEME.orange }}>{log.volume.toLocaleString()}</div>
                    <div style={{ fontSize: '9px', color: THEME.textDim, fontWeight: '900' }}>TOTAL KG</div>
                  </div>
                  {expandedLog === log.id ? <ChevronUp size={20} color={THEME.textDim} /> : <ChevronDown size={20} color={THEME.textDim} />}
                </div>
              </div>
              
              {/* Expandable Details */}
              {expandedLog === log.id && (
                <div style={{ padding: '0 20px 20px 20px', borderTop: `1px solid ${THEME.border}`, background: '#080808' }}>
                  {Object.values(log.exercises).map((ex, idx) => (
                    <div key={idx} style={{ marginTop: '15px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: THEME.orange, marginBottom: '5px' }}>{ex.name}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {ex.sets.map((s, si) => (
                          <div key={si} style={{ background: '#111', padding: '5px 10px', borderRadius: '8px', fontSize: '11px', border: '1px solid #222' }}>
                            <span style={{ color: THEME.textDim }}>S{si+1}:</span> <b>{s.w}kg × {s.r}</b>
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

      {/* REST TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '35px', left: '15px', right: '15px', backgroundColor: '#FFF', color: '#000', padding: '18px 30px', borderRadius: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `5px solid ${THEME.orange}`, zIndex: 9000, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Activity size={28} className="animate-pulse" /> 
            <span style={{ fontSize: '38px', fontWeight: '950', fontFamily: 'monospace' }}>{timeLeft}s</span>
          </div>
          <button 
            onClick={() => { setTimeLeft(0); if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]); }} 
            style={{ background: THEME.orange, border: 'none', padding: '12px 25px', borderRadius: '20px', fontWeight: '950', fontSize: '16px' }}
          >
            SKIP
          </button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
