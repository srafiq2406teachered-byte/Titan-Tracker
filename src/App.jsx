import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Dumbbell, BarChart3, PlusCircle, X, ChevronRight, Activity, Trash2, StopCircle, Timer, Zap, History, TrendingUp, Trophy, Star } from 'lucide-react';

const TitanTracker = () => {
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

  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [history, setHistory] = useState([]);
  const [showPB, setShowPB] = useState(false);

  useEffect(() => {
    const savedSets = localStorage.getItem('titan_sets_v30');
    const savedData = localStorage.getItem('titan_metrics_v30');
    const savedHistory = localStorage.getItem('titan_history_v30');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_sets_v30', JSON.stringify(completedSets));
      localStorage.setItem('titan_metrics_v30', JSON.stringify(exerciseData));
      localStorage.setItem('titan_history_v30', JSON.stringify(history));
    }
  }, [completedSets, exerciseData, history, mounted]);

  const getStats = () => {
    let volume = 0, reps = 0, sSets = 0, max1RM = 0;
    MASTER_PROTOCOL.forEach(ex => {
      for (let i = 0; i < ex.sets; i++) {
        const key = `${ex.id}-${i}`;
        if (completedSets[key]) {
          const w = parseFloat(exerciseData[`${key}-w`] || 0);
          const r = parseFloat(exerciseData[`${key}-r`] || 0);
          volume += (w * r); reps += r; sSets++;
          const current1RM = w * (1 + (r / 30));
          if (current1RM > max1RM) max1RM = current1RM;
        }
      }
    });
    return { volume, max1RM: Math.round(max1RM) };
  };

  const handleFinish = () => {
    const stats = getStats();
    if (stats.volume === 0) return;

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
      setTimeout(() => setShowPB(false), 5000);
    }
    setCompletedSets({}); setExerciseData({});
    setView('metrics');
  };

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#111', border: '#222', textDim: '#555' };
  const stats = getStats();
  const maxVolHistory = Math.max(...history.map(h => h.volume), 1);

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '10px', position: 'relative' }}>
      
      {/* PB CELEBRATION OVERLAY */}
      {showPB && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 92, 0, 0.9)', zIndex: 3000, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <Trophy size={100} color="#000" />
          <h1 style={{ color: '#000', fontSize: '42px', fontWeight: '900' }}>NEW PB!</h1>
          <p style={{ color: '#000', fontWeight: 'bold' }}>You just crushed your previous record.</p>
        </div>
      )}

      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '4px', background: THEME.card, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '8px', borderRadius: '8px' }}><Dumbbell size={18} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '8px', borderRadius: '8px' }}><TrendingUp size={18} color={view === 'metrics' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('calendar')} style={{ background: view === 'calendar' ? THEME.orange : 'transparent', border: 'none', padding: '8px', borderRadius: '8px' }}><History size={18} color={view === 'calendar' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* METRICS VIEW */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: THEME.card, padding: '20px', borderRadius: '20px', border: `1px solid ${THEME.border}` }}>
             <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '5px' }}>
              {history.slice(-10).map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                  <div style={{ width: '100%', background: h.isPB ? '#FFD700' : THEME.orange, height: `${(h.volume / maxVolHistory) * 100}%`, borderRadius: '3px', minHeight: '4px', position: 'relative' }}>
                    {h.isPB && <Star size={8} color="#000" style={{ position: 'absolute', top: '-12px', left: '25%' }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: THEME.card, padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: THEME.textDim }}>VOLUME</div>
              <div style={{ fontSize: '24px', fontWeight: '900' }}>{stats.volume}kg</div>
            </div>
            <div style={{ background: THEME.card, padding: '15px', borderRadius: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: THEME.textDim }}>BEST 1RM</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: THEME.orange }}>{stats.max1RM}kg</div>
            </div>
          </div>
        </div>
      )}

      {/* TRAIN VIEW */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {MASTER_PROTOCOL.map((ex) => (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '18px', padding: '15px', borderLeft: `4px solid ${THEME.orange}` }}>
              <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '10px' }}>{ex.name}</div>
              {[...Array(ex.sets)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button onClick={() => { setCompletedSets({...completedSets, [`${ex.id}-${i}`]: !completedSets[`${ex.id}-${i}`]}); if(!completedSets[`${ex.id}-${i}`]) setTimeLeft(ex.rest); }} 
                    style={{ width: '45px', height: '45px', background: completedSets[`${ex.id}-${i}`] ? THEME.orange : '#222', border: 'none', borderRadius: '10px', color: '#000', fontWeight: '900' }}>
                    {i+1}
                  </button>
                  <input type="number" placeholder="KG" value={exerciseData[`${ex.id}-${i}-w`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-w`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '10px', color: '#fff', textAlign: 'center' }} />
                  <input type="number" placeholder="R" value={exerciseData[`${ex.id}-${i}-r`] || ''} onChange={e => setExerciseData({...exerciseData, [`${ex.id}-${i}-r`]: e.target.value})} style={{ flex: 1, background: '#000', border: '1px solid #222', borderRadius: '10px', color: THEME.orange, textAlign: 'center' }} />
                </div>
              ))}
            </div>
          ))}
          <button onClick={handleFinish} style={{ background: THEME.orange, padding: '20px', borderRadius: '15px', border: 'none', fontWeight: '900', color: '#000' }}>FINISH & LOG</button>
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '10px', right: '10px', backgroundColor: '#FFF', color: '#000', padding: '12px', borderRadius: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `3px solid ${THEME.orange}`, zIndex: 2000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} /> <span style={{ fontSize: '24px', fontWeight: '900' }}>{timeLeft}s</span></div>
          <button onClick={() => { setTimeLeft(0); if ('vibrate' in navigator) navigator.vibrate(200); }} style={{ background: THEME.orange, border: 'none', padding: '8px 12px', borderRadius: '8px' }}><StopCircle size={18} /></button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
