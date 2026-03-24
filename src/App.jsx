import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, History, Plus, PlusCircle, Timer } from 'lucide-react';

const TitanTracker = () => {
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [view, setView] = useState('train'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // THE CORE 8-STEP PROTOCOL (Mapped to your A1-D2 structure)
  const MASTER_PLAN = [
    { id: "A1", name: "Leg Press Machine", sets: 3, goal: "8-10 Reps", focus: "Power & Base", type: "set" },
    { id: "A2", name: "Lat Pulldown Machine", sets: 3, goal: "10-12 Reps", focus: "Vertical Pull", type: "set" },
    { id: "B1", name: "Chest Press Machine", sets: 3, goal: "8-10 Reps", focus: "Horizontal Push", type: "set" },
    { id: "B2", name: "Seated Leg Curl", sets: 3, goal: "12-15 Reps", focus: "Hamstrings", type: "set" },
    { id: "C1", name: "Seated Cable Row", sets: 3, goal: "10-12 Reps", focus: "Mid-Back Squeeze", type: "set" },
    { id: "C2", name: "DB Overhead Press", sets: 3, goal: "10-12 Reps", focus: "Vertical Push", type: "set" },
    { id: "D1", name: "Plank / Captain's Chair", sets: 3, goal: "45s Hold", focus: "Core Stability", type: "time" },
    { id: "D2", name: "Walking Lunges", sets: 3, goal: "12 Total", focus: "Metabolic Burn", type: "set" }
  ];

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const addSet = (exId) => {
    setExerciseData(prev => ({
      ...prev,
      [exId]: { ...prev[exId], extraSets: (prev[exId]?.extraSets || 0) + 1 }
    }));
  };

  const THEME = {
    black: '#000000',
    zinc: '#0A0A0A',
    card: '#111111',
    border: '#222222',
    orange: '#FF5C00',
    textMain: '#FFFFFF',
    textDim: '#555555'
  };

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.textMain, fontFamily: 'system-ui, -apple-system, sans-serif', padding: '15px', maxWidth: '500px', margin: '0 auto', paddingBottom: '120px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', margin: 0, color: THEME.orange }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '8px', background: THEME.card, padding: '5px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
          <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><Dumbbell size={20} color={view === 'train' ? '#000' : '#444'} /></button>
          <button onClick={() => setView('history')} style={{ background: view === 'history' ? THEME.orange : 'transparent', border: 'none', padding: '10px', borderRadius: '8px' }}><History size={20} color={view === 'history' ? '#000' : '#444'} /></button>
        </div>
      </header>

      {/* PROTOCOL FEED */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {MASTER_PLAN.map((ex) => {
          const totalSets = ex.sets + (exerciseData[ex.id]?.extraSets || 0);
          
          return (
            <div key={ex.id} style={{ background: THEME.card, borderRadius: '24px', padding: '20px', border: `1px solid ${THEME.border}` }}>
              {/* Exercise Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: THEME.orange, letterSpacing: '1px' }}>{ex.id} // {ex.focus}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '2px 0', textTransform: 'uppercase' }}>{ex.name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span style={{ fontSize: '12px', fontWeight: '800', display: 'block' }}>{ex.goal}</span>
                </div>
              </div>

              {/* Set Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '10px' }}>
                {[...Array(totalSets)].map((_, i) => {
                  const isDone = completedSets[`${ex.id}-${i}`];
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <button 
                          onClick={() => {
                            const key = `${ex.id}-${i}`;
                            setCompletedSets({...completedSets, [key]: !isDone});
                            if(!isDone) setTime
