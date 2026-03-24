import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, History, Plus, ChevronRight } from 'lucide-react';

const TitanTracker = () => {
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [view, setView] = useState('train'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const WORKOUTS = {
    1: { name: "Push: Chest & Shoulders", ex: ["Chest Press Machine", "Shoulder Press Machine", "Lateral Raise Machine"] },
    2: { name: "Pull: Back & Biceps", ex: ["Lat Pulldown", "Seated Row", "Bicep Curl Machine"] },
    3: { name: "Legs: Quads & Hams", ex: ["Leg Press", "Leg Extension", "Leg Curl"] },
    4: { name: "Full Body Burn", ex: ["Goblet Squat", "Incline Press", "Kettlebell Swing"] },
    5: { name: "Upper Detail", ex: ["Pec Deck", "Face Pulls", "Tricep Pushdown"] },
    6: { name: "Metabolic / Cardio", ex: ["Stairmaster", "Incline Walk", "Plank"] },
    0: { name: "Active Recovery", ex: ["Light Walk", "Full Body Stretch"] }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const activeWorkout = WORKOUTS[activeDay] || WORKOUTS[0];

  // UI THEME CONSTANTS
  const THEME = {
    black: '#000000',
    zinc: '#121212',
    border: '#27272a',
    orange: '#FF6B00',
    textMain: '#FFFFFF',
    textDim: '#71717a'
  };

  return (
    <div style={{ backgroundColor: THEME.black, minHeight: '100vh', color: THEME.textMain, fontFamily: '"Inter", sans-serif', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <header style={{ marginBottom: '30px', paddingTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '38px', fontWeight: '900', fontStyle: 'italic', margin: 0, letterSpacing: '-2px', color: THEME.orange }}>TITAN</h1>
          <div style={{ display: 'flex', gap: '8px', background: THEME.zinc, padding: '6px', borderRadius: '12px', border: `1px solid ${THEME.border}` }}>
            <button onClick={() => setView('train')} style={{ background: view === 'train' ? THEME.orange : 'transparent', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
              <Dumbbell size={20} color={view === 'train' ? THEME.black : THEME.textDim} />
            </button>
            <button onClick={() => setView('history')} style={{ background: view === 'history' ? THEME.orange : 'transparent', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
              <History size={20} color={view === 'history' ? THEME.black : THEME.textDim} />
            </button>
          </div>
        </div>
        <p style={{ fontSize: '10px', fontWeight: '800', color: THEME.textDim, textTransform: 'uppercase', letterSpacing: '3px', marginTop: '4px' }}>Level 43 // Fat Burn Protocol</p>
      </header>

      {/* HORIZONTAL DAY SELECTOR */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '30px', paddingBottom: '10px', scrollbarWidth: 'none' }}>
        {DAYS.map((day, i) => (
          <button 
            key={day}
            onClick={() => {setActiveDay(i); setCompletedSets({});}}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              border: activeDay === i ? `2px solid ${THEME.orange}` : `1px solid ${THEME.border}`,
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              backgroundColor: activeDay === i ? THEME.orange : 'transparent',
              color: activeDay === i ? THEME.black : THEME.textDim,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderLeft: `4px solid ${THEME.orange}`, paddingLeft: '15px', marginBottom: '10px' }}>
            <h2 style={{ fontSize: '11px', color: THEME.textDim, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Current Target</h2>
            <p style={{ fontSize: '24px', fontWeight: '900', fontStyle: 'italic', margin: 0, textTransform: 'uppercase' }}>{activeWorkout.name}</p>
        </div>

        {activeWorkout.ex.map((name, idx) => (
          <div key={idx} style={{ background: THEME.zinc, borderRadius: '28px', padding: '24px', border: `1px solid ${THEME.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', margin: 0, color: THEME.textMain }}>{name}</h3>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: THEME.orange, background: 'rgba(255, 107, 0, 0.1)', padding: '4px 10px', borderRadius: '8px' }}>12 REPS</div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {[1, 2, 3].map(set => {
                const isDone = completedSets[`${name}-${set}`];
                return (
                  <button 
                    key={set}
                    onClick={() => {
                      const key = `${name}-${set}`;
                      setCompletedSets({...completedSets, [key]: !isDone});
                      if(!isDone) setTimeLeft(60);
                    }}
                    style={{
                      flex: 1,
                      height: '60px',
                      borderRadius: '16px',
                      border: isDone ? `2px solid ${THEME.orange}` : `2px solid ${THEME.border}`,
                      background: isDone ? THEME.orange : 'transparent',
                      color: isDone ? THEME.black : THEME.border,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {isDone ? <CheckCircle size={24} weight="bold" /> : <span style={{fontSize: '18px', fontWeight: '900'}}>{set}</span>}
                  </button>
                );
              })}
              <button style={{ flex: 1, borderRadius: '16px', border: `2px dashed ${THEME.border}`, background: 'transparent', color: THEME.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={20}/>
              </button>
            </div>
          </div>
        ))}

        <button style={{ 
          marginTop: '20px', 
          width: '100%', 
          padding: '24px', 
          borderRadius: '24px', 
          border: 'none', 
          backgroundColor: THEME.textMain, 
          color: THEME.black, 
          fontWeight: '900', 
          fontSize: '18px', 
          textTransform: 'uppercase', 
          fontStyle: 'italic',
          letterSpacing: '-1px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
        }}>
          End Protocol & Save
        </button>
      </div>

      {/* FLOATING TIMER OVERLAY */}
      {timeLeft > 0 && (
        <div style={{ 
          position: 'fixed', 
          bottom: '40px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          backgroundColor: THEME.textMain, 
          color: THEME.black, 
          padding: '12px 30px', 
          borderRadius: '50px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          boxShadow: '0 15px 40px rgba(255,107,0,0.3)', 
          border: `4px solid ${THEME.orange}`,
          zIndex: 1000
        }}>
          <Clock size={28} />
          <span style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'monospace' }}>{timeLeft}</span>
          <button onClick={() => setTimeLeft(0)} style={{ border: 'none', background: '#eee', borderRadius: '50%', padding: '5px', cursor: 'pointer' }}>
            <RotateCcw size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
