import React, { useState, useEffect } from 'react';

const App = () => {
  const [view, setView] = useState('workout');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [session, setSession] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // --- DOHA PROTOCOL ---
  const day = new Date().getDay();
  const workouts = {
    1: { name: "Push Alpha", ex: ["Chest Press", "Shoulder Press"] },
    2: { name: "Pull Alpha", ex: ["Lat Pulldown", "Rows"] },
    3: { name: "Titan Legs", ex: ["Leg Press", "Leg Curls"] },
    0: { name: "Rest & Recovery", ex: [] }
  };
  const current = workouts[day] || workouts[1];

  // --- LOGIC HANDLERS ---
  const updateWeight = (exName, setIdx, val) => {
    // FIXED: Initialized correctly to prevent Vercel Build Error
    const updated = [...(session[exName] || [40, 40, 40])]; 
    updated[setIdx] = parseFloat(val) || 0;
    setSession({ ...session, [exName]: updated });
  };

  const saveWorkout = () => {
    const entry = { id: Date.now(), name: current.name, date: new Date().toLocaleDateString(), data: session };
    const newHistory = [entry, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('titan-h', JSON.stringify(newHistory));
    setView('history');
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      if (timeLeft === 1 && navigator.vibrate) navigator.vibrate([200, 100, 200]);
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  // --- STYLES ---
  const s = {
    body: { backgroundColor: '#070707', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'sans-serif' },
    card: { backgroundColor: '#111', borderRadius: '24px', padding: '20px', marginBottom: '15px', border: '1px solid #222' },
    input: { backgroundColor: '#000', color: '#EA580C', border: '1px solid #333', borderRadius: '10px', padding: '10px', width: '70px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' },
    btn: { backgroundColor: '#EA580C', color: 'white', border: 'none', borderRadius: '20px', padding: '15px', width: '100%', fontWeight: '900', marginTop: '10px', cursor: 'pointer' }
  };

  return (
    <div style={s.body}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>DOHA 2026</div>
          <h1 style={{ margin: 0, fontStyle: 'italic', textTransform: 'uppercase' }}>{current.name}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>MASS TARGET</div>
          <div style={{ color: '#06B6D4', fontWeight: 'bold' }}>93.0KG</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setView('workout')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: view === 'workout' ? '#EA580C' : '#222', color: 'white', fontWeight: 'bold' }}>THE PROTOCOL</button>
        <button onClick={() => setView('history')} style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', backgroundColor: view === 'history' ? '#EA580C' : '#222', color: 'white', fontWeight: 'bold' }}>LOGBOOK</button>
      </div>

      {view === 'workout' ? (
        <div>
          {current.ex.map(ex => (
            <div key={ex} style={s.card}>
              <h3 style={{ margin: '0 0 15px 0', color: '#EA580C', fontStyle: 'italic' }}>{ex}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <div style={{ fontSize: '9px', color: '#555', textAlign: 'center', marginBottom: '5px' }}>SET {i + 1}</div>
                    <input type="number" style={s.input} value={session[ex]?.[i] || 40} onChange={(e) => updateWeight(ex, i, e.target.value)} />
                  </div>
                ))}
              </div>
              <button onClick={() => setTimeLeft(60)} style={{ background: 'none', border: '1px solid #333', color: '#666', fontSize: '10px', marginTop: '15px', padding: '5px 10px', borderRadius: '8px' }}>START 60S REST</button>
            </div>
          ))}
          <button onClick={saveWorkout} style={s.btn}>SUBMIT SESSION</button>
        </div>
      ) : (
        <div>
          {history.map(h => (
            <div key={h.id} style={s.card}>
              <div style={{ fontSize: '10px', color: '#666' }}>{h.date}</div>
              <div style={{ fontWeight: 'bold', color: '#EA580C' }}>{h.name}</div>
            </div>
          ))}
        </div>
      )}

      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', color: 'black', padding: '20px 50px', borderRadius: '25px', fontSize: '40px', fontWeight: 'bold', zIndex: 100 }}>
          {timeLeft}
        </div>
      )}
    </div>
  );
};

export default App;
