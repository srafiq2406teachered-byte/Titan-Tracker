import React, { useState, useEffect } from 'react';

const App = () => {
  const [view, setView] = useState('workout');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [session, setSession] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const day = new Date().getDay();
  const workouts = {
    1: { name: "Push Alpha", ex: ["Chest Press", "Shoulder Press"] },
    2: { name: "Pull Alpha", ex: ["Lat Pulldown", "Rows"] },
    3: { name: "Titan Legs", ex: ["Leg Press", "Leg Curls"] },
    0: { name: "Rest & Recovery", ex: [] }
  };
  const current = workouts[day] || workouts[1];

  const updateWeight = (exName, setIdx, val) => {
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
      return () => clearTimeout(t);
    }
  }, [timeLeft]);

  // --- CLEAN SYSTEM UI STYLES ---
  const s = {
    body: { backgroundColor: '#f4f4f7', minHeight: '100vh', color: '#1a1a1a', padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    card: { backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e1e1e8' },
    input: { backgroundColor: '#f9f9fb', color: '#1a1a1a', border: '1px solid #d1d1d6', borderRadius: '8px', padding: '12px', width: '75px', textAlign: 'center', fontSize: '16px' },
    btnPrimary: { backgroundColor: '#007aff', color: 'white', border: 'none', borderRadius: '12px', padding: '16px', width: '100%', fontWeight: '600', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
    navBtn: (active) => ({ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: active ? '#ffffff' : 'transparent', color: active ? '#007aff' : '#8e8e93', fontWeight: '600', boxShadow: active ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' })
  };

  return (
    <div style={s.body}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>{current.name}</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#8e8e93' }}>{new Date().toDateString()}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#007aff' }}>93.0kg</div>
          <div style={{ fontSize: '10px', color: '#8e8e93', fontWeight: 'bold', textTransform: 'uppercase' }}>Target</div>
        </div>
      </header>

      <nav style={{ display: 'flex', backgroundColor: '#e3e3e8', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
        <button onClick={() => setView('workout')} style={s.navBtn(view === 'workout')}>Workout</button>
        <button onClick={() => setView('history')} style={s.navBtn(view === 'history')}>Logbook</button>
      </nav>

      {view === 'workout' ? (
        <div>
          {current.ex.map(ex => (
            <div key={ex} style={s.card}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700' }}>{ex}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {[0, 1, 2].map(i => (
                  <div key={i}>
                    <label style={{ display: 'block', fontSize: '10px', color: '#8e8e93', textAlign: 'center', marginBottom: '4px', fontWeight: '600' }}>SET {i + 1}</label>
                    <input type="number" style={s.input} value={session[ex]?.[i] || 40} onChange={(e) => updateWeight(ex, i, e.target.value)} />
                  </div>
                ))}
              </div>
              <button onClick={() => setTimeLeft(60)} style={{ background: 'none', border: 'none', color: '#007aff', fontSize: '13px', fontWeight: '600', marginTop: '16px', padding: 0, cursor: 'pointer' }}>Start 60s Rest</button>
            </div>
          ))}
          <button onClick={saveWorkout} style={s.btnPrimary}>Finish Session</button>
        </div>
      ) : (
        <div>
          {history.length > 0 ? history.map(h => (
            <div key={h.id} style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#8e8e93' }}>{h.date}</div>
                  <div style={{ fontWeight: '700', fontSize: '16px' }}>{h.name}</div>
                </div>
                <div style={{ color: '#34c759', fontWeight: 'bold' }}>✓ Done</div>
              </div>
            </div>
          )) : <div style={{ textAlign: 'center', padding: '40px', color: '#8e8e93' }}>No sessions logged yet.</div>}
        </div>
      )}

      {timeLeft > 0 && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#1a1a1a', color: 'white', padding: '12px 24px', borderRadius: '40px', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zindex: 1000 }}>
          Rest: {timeLeft}s
        </div>
      )}
    </div>
  );
};

export default App;
