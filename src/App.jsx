import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Dumbbell, BarChart3, PlusCircle, X, ChevronRight, Activity, Trash2, StopCircle, Timer, Zap, History, TrendingUp, Trophy, Star } from 'lucide-react';

const TitanTracker = () => {
  // --- MASTER DATA ---
  const MASTER_PROTOCOL = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", rest: 60 },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15", rest: 60 },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12", rest: 60 },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s", rest: 30 },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", rest: 30 }
  ];

  // --- STATE MANAGEMENT ---
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [showPB, setShowPB] = useState(false);

  // --- PERSISTENCE LAYER ---
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_sets_v31');
    const savedData = localStorage.getItem('titan_metrics_v31');
    const savedHistory = localStorage.getItem('titan_history_v31');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_sets_v31', JSON.stringify(completedSets));
      localStorage.setItem('titan_metrics_v31', JSON.stringify(exerciseData));
      localStorage.setItem('titan_history_v31', JSON.stringify(history));
    }
  }, [completedSets, exerciseData, history, mounted]);

  // --- CALCULATION ENGINE ---
  const getStats = () => {
    let volume = 0, max1RM = 0;
    MASTER_PROTOCOL.forEach(ex => {
      for (let i = 0; i < ex.sets; i++) {
        const key = `${ex.id}-${i}`;
        if (completedSets[key]) {
          const w = parseFloat(exerciseData[`${key}-w`] || 0);
          const r = parseFloat(exerciseData[`${key}-r`] || 0);
          volume += (w * r);
          if (r > 0) {
            const current1RM = w * (1 + (r / 30));
            if (current1RM > max1RM) max1RM = current1RM;
          }
        }
      }
    });
    return { volume, max1RM: Math.round(max1RM) };
  };

  const handleFinish = () => {
    const stats = getStats();
    if (stats.volume === 0) return alert("Log some weight first!");

    const allTimeBest = history.length > 0 ? Math.max(...history.map(h => h.volume)) : 0;
    const isNewPB = stats.volume > allTimeBest && history.length > 0;

    const newEntry = {
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      volume: stats.volume,
      peak: stats.max1RM,
      isPB: isNewPB
    };

    setHistory([...history, newEntry]);
    if (isNewPB) {
      setShowPB(true);
      setTimeout(() => setShowPB(false), 4000);
    }
    setCompletedSets({}); setExerciseData({});
    setView('calendar');
  };

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#111', border: '#222', textDim: '#555' };
  const stats = getStats();
  const maxVolHistory = Math.max(...history.map(h => h.volume), 1);

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '10px 10px 100px 10px', position: 'relative' }}>
      
      {/* PB CELEBRATION */}
      {showPB && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 92, 0, 0.95)', zIndex: 5000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Trophy size={120} color="#000" />
          <h1 style={{ color: '#000', fontSize: '48px', fontWeight: '900', margin: '10px 0' }}>NEW PB!</h1>
          <p style={{ color: '#000', fontWeight: '900', fontSize: '20px' }}>{stats.volume} KG TOTAL VOLUME</p>
        </div>
      )}

      {/* FIXED HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '5px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
          <div style={{ fontSize: '10px', color: THEME.textDim, fontWeight: 'bold' }}>DOHA ELITE PROTOCOL</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: THEME.card, padding: '5px', borderRadius: '15px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '10px' }}><Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '10px' }}><TrendingUp size={20} color={view === 'metrics' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('calendar')} style={{ background: view === 'calendar' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '10px' }}><History size={20} color={view === 'calendar' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* VIEW: METRICS & GRAPH */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '25px', border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: '11px', color: THEME.textDim, fontWeight: '900', marginBottom: '20px', letterSpacing: '1px' }}>VOLUME TREND (LAST 10)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', gap: '6px' }}>
              {history.length > 0 ? history.slice(-10).map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '100%', background: h.isPB ? '#FFD700' : THEME.orange, height: `${(h.volume / maxVolHistory) * 100}%`, borderRadius: '4px', minHeight: '5px', position: 'relative' }}>
                    {h.isPB && <Star size={10} color="#000" style={{ position: 'absolute', top: '-15px', left: '25%' }} />}
                  </div>
                  <span style={{ fontSize: '8px', color: THEME.textDim, fontWeight: 'bold' }}>{h.date}</span>
                </div>
              )) : <div style={{ width: '100%', textAlign: 'center', color: '#222', padding: '40px 0' }}>No Data Available</div>}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
             <div style={{ background: THEME.card, padding: '20px', borderRadius: '25px', border: `1px solid ${THEME.border}` }}>
                <div style={{ fontSize: '10px', color: THEME.textDim }}>LIVE VOLUME</div>
                <div style={{ fontSize: '28px', fontWeight: '900' }}>{stats.volume}<span style={{ fontSize: '12px', color: THEME.orange }}>kg</span></div>
             </div>
             <div style={{ background: THEME.card, padding: '20px', borderRadius: '25px', border: `1px solid ${THEME.border}` }}>
                <div style={{ fontSize: '10px', color: THEME.textDim }}>PEAK 1RM</div>
                <div style={{ fontSize: '28px', fontWeight: '900' }}>{stats.max1RM}<span style={{ fontSize: '12px', color: THEME.orange }}>kg</span></div>
             </div>
          </div>
        </div>
      )}

      {/* VIEW: TRAINING LOG */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MASTER_PROTOCOL.map((ex) => (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '20px', padding: '18px', borderLeft: `5px solid ${THEME.orange}`, border: `1px solid ${THEME.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontWeight: '900', fontSize: '15px', textTransform: 'uppercase' }}>{ex.name}</span>
                <span style={{ fontSize: '11px', color: THEME.textDim, fontWeight: 'bold' }}>GOAL: {ex.goal}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...Array(ex.sets)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => { 
                        setCompletedSets({...completedSets, [`${ex.id}-${i}`]: !completedSets[`${ex.id}-${i}`]}); 
                        if(!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest);
                      }} 
                      style={{ width: '50px', height: '50px', background: completedSets[`${ex.id}-${i}`] ? THEME.orange : '#1a1a1a', border: 'none', borderRadius: '12px', color: '#000', fontWeight: '900', fontSize: '18px' }}
                    >
                      {completedSets[`${ex.id}-${i}`] ? '✓' : i + 1}
                    </button>
                    <input 
                      type="number" inputMode="decimal" placeholder="KG" 
                      value={exerciseData[`${ex.id}-${i}-w`] || ''} 
                      onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} 
                      style={{ flex: 1, background: '#000', border: `1px solid ${THEME.border}`, borderRadius: '12px', color: '#fff', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }} 
                    />
                    <input 
                      type="number" inputMode="numeric" placeholder="REPS" 
                      value={exerciseData[`${ex.id}-${i}-r`] || ''} 
                      onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} 
                      style={{ flex: 1, background: '#000', border: `1px solid ${THEME.border}`, borderRadius: '12px', color: THEME.orange, textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleFinish} style={{ background: THEME.orange, padding: '22px', borderRadius: '20px', border: 'none', fontWeight: '900', color: '#000', fontSize: '18px', marginTop: '10px', boxShadow: '0 10px 20px rgba(255,92,0,0.2)' }}>FINISH & LOG SESSION</button>
        </div>
      )}

      {/* VIEW: CALENDAR HISTORY */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '12px', color: THEME.textDim, fontWeight: '900', letterSpacing: '1px' }}>WORKOUT LOGS</h2>
          {[...history].reverse().map((log, idx) => (
            <div key={idx} style={{ background: THEME.card, padding: '20px', borderRadius: '20px', border: `1px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: log.isPB ? '#FFD700' : '#fff' }}>{log.date} {log.isPB && '🏆'}</div>
                <div style={{ fontSize: '12px', color: THEME.textDim }}>Peak 1RM: {log.peak}kg</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: THEME.orange }}>{log.volume}kg</div>
                <div style={{ fontSize: '10px', color: THEME.textDim }}>TOTAL VOLUME</div>
              </div>
            </div>
          ))}
          {history.length === 0 && <div style={{ textAlign: 'center', padding: '50px', color: '#222' }}>No history found.</div>}
        </div>
      )}

      {/* REST TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', backgroundColor: '#FFF', color: '#000', padding: '15px 25px', borderRadius: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `4px solid ${THEME.orange}`, zIndex: 4000, boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><Clock size={24} /> <span style={{ fontSize: '32px', fontWeight: '900', fontFamily: 'monospace' }}>{timeLeft}s</span></div>
          <button onClick={() => { setTimeLeft(0); if ('vibrate' in navigator) navigator.vibrate(200); }} style={{ background: THEME.orange, border: 'none', padding: '12px 20px', borderRadius: '15px', fontWeight: '900' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
