import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, BarChart3, PlusCircle, Plus, X, ChevronRight } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train');
  const [timeLeft, setTimeLeft] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [customExercises, setCustomExercises] = useState(() => 
    JSON.parse(localStorage.getItem('titan_custom_v16') || '[]')
  );

  const DEFAULT_PLAN = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12", rest: 60 },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15", rest: 60 },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12", rest: 60 },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s", rest: 30 },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", rest: 30 }
  ];

  const FULL_PLAN = [...DEFAULT_PLAN, ...customExercises];

  useEffect(() => {
    const savedSets = localStorage.getItem('titan_completed_v16');
    const savedData = localStorage.getItem('titan_data_v16');
    if (savedSets) setCompletedSets(JSON.parse(savedSets));
    if (savedData) setExerciseData(JSON.parse(savedData));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('titan_completed_v16', JSON.stringify(completedSets));
      localStorage.setItem('titan_data_v16', JSON.stringify(exerciseData));
      localStorage.setItem('titan_custom_v16', JSON.stringify(customExercises));
    }
  }, [completedSets, exerciseData, customExercises, mounted]);

  const removeSet = (exId, setIdx) => {
    const key = `${exId}-${setIdx}`;
    const extraKey = `${exId}-extra`;
    const newSets = { ...completedSets };
    const newData = { ...exerciseData };
    delete newSets[key];
    delete newData[`${key}-w`];
    delete newData[`${key}-r`];
    
    // Only reduce the extra count if we are deleting a set beyond the default 3
    if (setIdx >= 3) {
      newData[extraKey] = Math.max(0, (newData[extraKey] || 0) - 1);
    }
    
    setCompletedSets(newSets);
    setExerciseData(newData);
  };

  const THEME = { black: '#000000', card: '#111111', border: '#222222', orange: '#FF5C00', textDim: '#888888', white: '#FFFFFF' };

  if (!mounted) return null;

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.white, fontFamily: 'system-ui, sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '140px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', padding: '10px 0' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', color: THEME.orange, margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '12px', background: '#111', padding: '8px', borderRadius: '16px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><Dumbbell size={24} color={view === 'train' ? '#000' : '#666'} /></button>
          <button onClick={() => setView('library')} style={{ background: view === 'library' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '12px' }}><PlusCircle size={24} color={view === 'library' ? '#000' : '#666'} /></button>
          <button onClick={() => setView('metrics')} style={{ background: view === 'metrics' ? THEME.orange : 'transparent', border: 'none', padding: '12px', borderRadius: '1
