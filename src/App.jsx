import React, { useState, useEffect } from 'react';

const App = () => {
  const [view, setView] = useState('workout');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [session, setSession] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // --- FULL DOHA 6-DAY PROTOCOL ---
  const day = new Date().getDay();
  const workouts = {
    1: { name: "Push Alpha", ex: ["Chest Press", "Shoulder Press", "Tricep Extension"] },
    2: { name: "Pull Alpha", ex: ["Lat Pulldown", "Seated Row", "Bicep Curl"] },
    3: { name: "Titan Legs", ex: ["Leg Press", "Leg Curl", "Calf Raise"] },
    4: { name: "Push Beta", ex: ["Incline Press", "Lateral Raise", "Dips"] },
    5: { name: "Pull Beta", ex: ["Pull Ups", "Hammer Curl", "Face Pulls"] },
    6: { name: "Titan Legs", ex: ["Hack Squat", "Leg Extension", "Seated Curl"] },
    0: { name: "Rest Day", ex: [] }
  };
  const current = workouts[day] || workouts[1];

  const updateWeight = (exName, setIdx, val) => {
    const updated = [...(session[exName] || [40, 40, 40])]; 
    updated[setIdx] = val; // Store as string to allow easy typing
    setSession({ ...session, [exName]: updated });
  };

  const saveWorkout = () => {
    const entry = { id: Date.now(), name: current.name, date: new Date().toLocaleDateString(), data: session };
    const newHistory = [entry, ...history].slice(0, 15);
    setHistory(newHistory);
    localStorage.setItem('titan-h', JSON.stringify(newHistory));
    setView('history');
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  // --- MOBILE-OPTIMIZED STEALTH STYLES ---
  const s = {
    container: { backgroundColor: '#000', minHeight: '100vh', color: '#fff', padding: '15px', fontFamily: 'sans-serif', paddingBottom: '100px' },
    header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #111', paddingBottom: '10px' },
    card: { backgroundColor: '#0A0A0A', borderRadius: '20px', padding: '20px', marginBottom: '20px', border: '1px solid #1a1a1a' },
    // Vertical Input Styling
    inputRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #111' },
    input: { backgroundColor: '#111', color: '#EA580C', border: '1px solid #222', borderRadius: '12px', padding: '12px', width: '100px', textAlign: 'center', fontSize: '20px', fontWeight: 'bold', outline: 'none' },
    btnMain: { backgroundColor: '#EA580C', color: '#fff', border: 'none', borderRadius: '15px', padding: '20px', width: '100%', fontWeight: '900', fontSize: '18px', textTransform: 'uppercase', marginTop: '20px' },
    navTab: (active) => ({ flex: 1, padding: '12px', border: 'none', borderRadius: '10px', backgroundColor: active ? '#111' : 'transparent', color: active ? '#EA580C' : '#444', fontWeight: 'bold', fontSize: '12px' })
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontStyle: 'italic', fontWeight: '900' }}>{current.name}</h1>
          <span style={{ fontSize: '10px', color: '#444' }}>DOHA PROTOCOL</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#06B6D4', fontWeight: 'bold' }}>93.0kg</div>
          <div style={{ fontSize: '9px', color: '#444' }}>TARGET</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px', backgroundColor: '#050505', padding: '5px', borderRadius: '12px' }}>
        <button onClick={() => setView('workout')} style={s.navTab(view === 'workout')}>PROTOCOL</button>
        <button onClick={() => setView('history')} style={s.navTab(view === 'history')}>LOGBOOK</button>
      </div>

      {view === 'workout' ? (
        <div>
          {current.ex.map(ex => (
            <div key={ex} style={s.card}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#EA580C', textTransform: 'uppercase' }}>{ex}</h2>
              <div>
                {[0, 1, 2].map(i => (
                  <div key={i} style={s.inputRow}>
                    <span style={{ color: '#444', fontWeight: 'bold', fontSize: '12px' }}>SET {i + 1}</span>
                    <input 
                      type="number" 
                      inputMode="decimal" // Forces numeric keypad on mobile
                      style={s.input} 
                      value={session[ex]?.[i] || ''} 
                      placeholder="40"
                      onChange={(e) => updateWeight(ex, i, e.target.value)} 
                    />
                  </div>
                ))}
              </div>
              <button onClick={() => setTimeLeft(60)} style={{ width: '100%', background: 'none', border: '1px solid #111', color: '#333', padding: '10px', marginTop: '10px', borderRadius: '10px', fontSize: '11px' }}>START 60S REST</button>
            </div>
          ))}
          <button onClick={saveWorkout} style={s.btnMain}>SUBMIT SESSION</button>
        </div>
      ) : (
        history.map(h => (
          <div key={h.id} style={s.card}>
            <div style={{ color: '#444', fontSize: '10px' }}>{h.date}</div>
            <div style={{ fontWeight: 'bold', color: '#EA580C' }}>{h.name}</div>
          </div>
        ))
      )}

      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#EA580C', color: 'white', padding: '15px 40px', borderRadius: '50px', fontSize: '32px', fontWeight: '900', boxShadow: '0 10px 30px rgba(234, 88, 12, 0.4)' }}>
          {timeLeft}s
        </div>
      )}
    </div>
  );
};

export default App;
