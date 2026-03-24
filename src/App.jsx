import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, X, ChevronRight, Activity, Trash2, StopCircle } from 'lucide-react';

const TitanTracker = () => {
  // --- HARD-CODED MASTER DATA ---
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

  const MASTER_LIBRARY = {
    LEGS: ["Leg Extension", "Calf Raise", "Glute Bridge"],
    PUSH: ["Incline Chest Press", "Shoulder Press", "Tricep Pushdown"],
    PULL: ["Face Pulls", "Bicep Curls", "Hammer Curls"]
  };

  // --- STATE ---
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState([]);
  const [sessionStartTime] = useState(() => Date.now());
  const [sessionElapsed, setSessionElapsed] = useState("00:00");

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedSets = localStorage.getItem('titan_sets_v22');
    const savedData = localStorage.getItem('titan_metrics_v22');
    const savedCustom = localStorage.getItem('titan_custom_v22');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    if (savedCustom) setCustomExercises(JSON.parse(savedCustom));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_sets_v22', JSON.stringify(completedSets));
      localStorage.setItem('titan_metrics_v22', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v22', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - sessionStartTime) / 1000);
      setSessionElapsed(`${Math.floor(diff/60).toString().padStart(2,'0')}:${(diff%60).toString().padStart(2,'0')}`);
      if (timeLeft > 0) setTimeLeft(p => p - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStartTime, timeLeft]);

  // --- REMOVAL LOGIC ---
  const removeWorkout = (id) => {
    if (window.confirm("Remove this exercise from your session?")) {
      setCustomExercises(prev => prev.filter(ex => ex.id !== id));
      // Clean up data associated with this ID
      const newSets = { ...completedSets };
      const newData = { ...exerciseData };
      Object.keys(newSets).forEach(k => { if (k.startsWith(id)) delete newSets[k]; });
      Object.keys(newData).forEach(k => { if (k.startsWith(id)) delete newData[k]; });
      setCompletedSets(newSets);
      setExerciseData(newData);
    }
  };

  const THEME = { orange: '#FF5C00', bg: '#000', card: '#111', border: '#222', textDim: '#555' };
  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.bg, minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '10px', boxSizing: 'border-box', overflowX: 'hidden' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: THEME.textDim }}>{sessionElapsed}</div>
        </div>
        <div style={{ display: 'flex', gap: '5px', background: THEME.card, padding: '4px', borderRadius: '12px' }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><PlusCircle size={20} color={view === 'library' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><BarChart3 size={20} color={view === 'metrics' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[...MASTER_PROTOCOL, ...customExercises].map((ex) => (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '18px', padding: '15px', borderLeft: `5px solid ${ex.isCustom ? '#333' : THEME.orange}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', margin: 0 }}>{ex.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: THEME.orange, fontWeight: '900', fontSize: '11px' }}>{ex.goal}</span>
                  {ex.isCustom && <Trash2 size={16} color="#444" onClick={() => removeWorkout(ex.id)} />}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[...Array(ex.sets + (exerciseData[`${ex.id}-extra`] || 0))].map((_, i) => {
                  const key = `${ex.id}-${i}`;
                  const isDone = completedSets[key];
                  return (
                    <div key={i} style={{ display: 'flex', gap:
