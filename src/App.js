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
