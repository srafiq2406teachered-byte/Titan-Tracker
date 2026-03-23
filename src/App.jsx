import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, Clock, Trophy, BarChart3, Scale, Zap, 
  Flame, Calendar, PieChart, AlertCircle, ZapOff, TrendingUp 
} from 'lucide-react';

const TitanTracker = () => {
  // --- 1. CORE STATE ---
  const [view, setView] = useState('workout'); 
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // --- 2. DYNAMIC TITAN PROTOCOLS (By Day) ---
  const currentWorkout = useMemo(() => {
    const day = new Date().getDay(); 
    const splits = {
      1: { name: "Push Alpha", type: "Push", exercises: [{ id: "P1", name: "Chest Press", sets: 3, reps: 10 }, { id: "P2", name: "DB Shoulder Press", sets: 3, reps: 12 }] },
      2: { name: "Pull Alpha", type: "Pull", exercises: [{ id: "L1", name: "Lat Pulldown", sets: 3, reps: 12 }, { id: "L2", name: "Cable Row", sets: 3, reps: 12 }] },
      3: { name: "Titan Legs", type: "Legs", exercises: [{ id: "A1", name: "Leg Press", sets: 4, reps: 10 }, { id: "B2", name: "Seated Leg Curl", sets: 3, reps: 15 }] },
      4: { name: "Push Beta", type: "Push", exercises: [{ id: "P1", name: "Chest Press", sets: 4, reps: 8 }, { id: "P5", name: "Dips", sets: 3, reps: 10 }] },
      5: { name: "Pull Beta", type: "Pull", exercises: [{ id: "L4", name: "Pull Ups", sets: 3, reps: 8 }, { id: "L6", name: "Hammer Curls", sets: 3, reps: 12 }] },
      6: { name: "Titan Legs", type: "Legs", exercises: [{ id: "A1", name: "Leg Press", sets: 3, reps: 12 }, { id: "G2", name: "Leg Extensions", sets: 3, reps: 15 }] },
      0: { name: "Rest & Recovery", type: "Rest", exercises: [] }
    };
    return splits[day] || splits[0];
  }, []);

  // --- 3. GHOST WEIGHTS & SESSION STATE ---
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('titan-w-sets-v5');
    return saved ? JSON.parse(saved) : {};
  });

  // Pre-fill sets based on history or defaults
  useEffect(() => {
    const newSession = { ...session };
    let needsUpdate = false;
    currentWorkout.exercises.forEach(ex => {
      if (!newSession[ex.id]) {
        const lastEntry = history.find(h => h.sessionData?.[ex.id])?.sessionData?.[ex.id];
        newSession[ex.id] = lastEntry || Array(ex.sets).fill(40);
        needsUpdate = true;
      }
    });
    if (needsUpdate) setSession(newSession);
  }, [currentWorkout, history]);

  // --- 4. ANALYTICS: MUSCLE PORTFOLIO ---
  const portfolio = useMemo(() => {
    const totals = { Push: 0, Pull: 0, Legs: 0 };
    history.slice(0, 15).forEach(entry => {
      const type = entry.split?.split(' ')[0];
      const key = type === 'Titan' ? 'Legs' : type;
      if (totals[key] !== undefined) totals[key] += entry.volume || 0;
    });
    const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
    return Object.entries(totals).map(([name, val]) => ({
      name,
      value: val,
      percent: grandTotal ? Math.round((val / grandTotal) * 100) : 0
    }));
  }, [history]);

  // --- 5. LOGIC HANDLERS ---
  const updateWeight = (exId, sIdx, val) => {
    const updated
