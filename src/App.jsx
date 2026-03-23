import React, { useState, useEffect } from 'react';

const App = () => {
  const [view, setView] = useState('workout');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [session, setSession] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // --- DOHA 6-DAY FULL PROTOCOL ---
  const day = new Date().getDay();
  const workouts = {
    1: { name: "Push Alpha", ex: ["Chest Press", "Shoulder Press", "Tricep Pushdown"] },
    2: { name: "Pull Alpha", ex: ["Lat Pulldown", "Cable Rows", "Bicep Curls"] },
    3: { name: "Titan Legs", ex: ["Leg Press", "Leg Curls", "Calf Raises"] },
    4: { name: "Push Beta", ex: ["Incline Press", "Lateral Raises", "Dips"] },
    5: { name: "Pull Beta", ex: ["Pull Ups", "Hammer Curls", "Face Pulls"] },
    6: { name: "Titan Legs", ex: ["Squats", "Leg Extensions", "Seated Curls"] },
    0: { name: "Active Recovery", ex: ["Stretching", "Light Walk"] }
  };
  const current = workouts[day] || workouts[0];

  const updateWeight = (exName, setIdx, val) => {
    const updated = [...(session[exName] || [40, 40, 40])]; 
    updated[setIdx] = parseFloat(val) || 0;
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

  // --- STEALTH UI STYLES ---
  const s = {
    body: { backgroundColor: '#070707', minHeight: '100vh', color: '#ffffff', padding: '20px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#111', borderRadius: '24px', padding: '20px', marginBottom: '16px', border: '1px solid #222' },
    input: { backgroundColor: '#000', color: '#EA580C', border: '1px solid #333', borderRadius: '12px', padding: '12px', width: '75px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' },
    btnPrimary: { backgroundColor: '#EA580C', color: 'white', border: 'none', borderRadius: '20px', padding: '18px', width: '100%', fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', marginTop: '10px' },
    navBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', backgroundColor: active ? '#EA580C' : '#1a1a1a', color: 'white', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' })
  };

  return (
    <div style={s.body}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontStyle: 'italic', fontWeight: '900', textTransform: 'uppercase' }}>{current.name}</h1>
          <p style={{ margin: 0, fontSize: '10px', color: '#555', fontWeight: 'bold' }}>PROTOCOL: DOHA_v2</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#06B6D4', fontStyle: 'italic' }}>93.0kg</div>
          <div style={{ fontSize: '9px', color: '#555', fontWeight: 'bold' }}>TARGET MASS</div>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setView('workout')} style={s.navBtn(view === 'workout')}>The Protocol</button>
        <button onClick={() => setView('history')} style={s.navBtn(view === 'history')}>Logbook</button>
      </nav>

      {view === 'workout' ? (
        <div>
          {current.ex.map(ex => (
            <div key={ex} style={s.card}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '900', fontStyle: 'italic', color: '#EA580C', textTransform: 'uppercase' }}>{ex}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <label style={{ display: 'block', fontSize: '9px', color: '#444', textAlign: 'center', marginBottom: '4px', fontWeight: '900' }}>SET {i + 1}</label>
                    <input type="number" style={s.input} value={session[ex]?.[i] || 40} onChange={(e) => updateWeight(ex, i, e.target.value)} />
                  </div>
                ))}
              </div>
              <button onClick={() => setTimeLeft(60)} style={{ background: 'none', border: '1px solid #222', color: '#555', fontSize: '10px', fontWeight: 'bold', marginTop: '16px', padding: '8px 12px', borderRadius: '8px' }}>START 60S REST</button>
            </div>
          ))}
          <button onClick={saveWorkout} style={s.btnPrimary}>Execute Session</button>
        </div>
      ) : (
        <div>
          {history.map(h => (
            <div key={h.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#555' }}>{h.date}</div>
                  <div style={{ fontWeight: '900', fontStyle: 'italic', color: '#EA580C' }}>{h.name}</div>
                </div>
                <div style={{ color: '#06B6D4', fontWeight: '900' }}>SAVED</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#000', padding: '20px 50px', borderRadius: '30px', fontSize: '48px', fontWeight: '900', fontStyle: 'italic', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}>
          {timeLeft}
        </div>
      )}
    </div>
  );
};

export default App;
