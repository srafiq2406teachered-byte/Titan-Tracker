import React, { useState, useEffect } from 'react';
import { Plus, Minus, CheckCircle, Clock, TrendingUp, Trophy, BarChart3, Target, Dumbbell, Flame, Scale, Zap } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('workout'); 
  const [bodyWeight, setBodyWeight] = useState(() => JSON.parse(localStorage.getItem('titan-bw') || '93.0'));
  const [minWeight, setMinWeight] = useState(() => JSON.parse(localStorage.getItem('titan-min-bw') || '93.0'));
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('titan-w') || '{"A1":80,"A2":40,"B1":45,"B2":35,"C1":35,"C2":10}'));
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-h') || '[]'));
  const [completed, setCompleted] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const workout = [
    { id: "A1", name: "Leg Press", sets: 3, reps: 10, goal: "80-100kg" },
    { id: "A2", name: "Lat Pulldown", sets: 3, reps: 12, goal: "40-50kg" },
    { id: "B1", name: "Chest Press", sets: 3, reps: 10, goal: "45-55kg" },
    { id: "B2", name: "Seated Leg Curl", sets: 3, reps: 15, goal: "35-45kg" },
    { id: "C1", name: "Cable Row", sets: 3, reps: 12, goal: "35-45kg" },
    { id: "C2", name: "DB Shoulder Press", sets: 3, reps: 12, goal: "10-12kg" }
  ];

  const adjustBW = (v) => {
    const n = Math.round((bodyWeight + v) * 10) / 10;
    setBodyWeight(n);
    if (n < minWeight) { setMinWeight(n); localStorage.setItem('titan-min-bw', n); }
    localStorage.setItem('titan-bw', n);
  };

  const calcVol = () => workout.reduce((a, e) => completed[e.id] ? a + (session[e.id] * e.sets * e.reps) : a, 0);
  const currentSessionCals = () => Math.round((bodyWeight * 4.2) + (calcVol()/1000 * 28));
  
  const save = () => {
    const v = calcVol(); if (v === 0) return;
    const entry = { date: new Date().toLocaleDateString('en-GB', {day:'2-digit', month:'short'}), volume: v, calories: currentSessionCals(), bw: bodyWeight, ts: new Date().toISOString(), id: Date.now() };
    const h = [entry, ...history].slice(0, 15);
    setHistory(h); localStorage.setItem('titan-h', JSON.stringify(h));
    setShowSummary(true);
  };

  useEffect(() => { localStorage.setItem('titan-w', JSON.stringify(session)); }, [session]);
  useEffect(() => { if (timeLeft > 0) { const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000); return () => clearTimeout(t); } }, [timeLeft]);

  const weeklyProg = history.filter(h => new Date(h.ts) >= new Date(new Date().setDate(new Date().getDate() - new Date().getDay()))).reduce((a, h) => a + h.volume, 0);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#
