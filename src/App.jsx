import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, History, Plus } from 'lucide-react';

const TitanTracker = () => {
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [view, setView] = useState('train'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const WORKOUTS = {
    1: { name: "Push Protocol", color: "#f97316", ex: ["Chest Press", "Shoulder Press", "Triceps"] },
    2: { name: "Pull Protocol", color: "#f97316", ex: ["Lat Pulldown", "Cable Row", "Bicep Curls"] },
    3: { name: "Leg Protocol", color: "#f97316", ex: ["Leg Press", "Leg Curl", "Calf Raises"] },
    4: { name: "Full Body Burn", color: "#f97316", ex: ["Squats", "Pushups", "Rows"] },
    5: { name: "Upper Detail", color: "#f97316", ex: ["Lateral Raises", "Flyes", "Hammer Curls"] },
    6: { name: "Metabolic/Cardio", color: "#f97316", ex: ["Stairmaster", "Incline Walk", "Plank"] },
    0: { name: "Recovery", color: "#71717a", ex: ["Light Walk", "Stretch"] }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const activeWorkout = WORKOUTS[activeDay] || WORKOUTS[0];

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', padding: '20px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', margin: 0, letterSpacing: '-2px', color: '#f97316' }}>TITAN</h1>
          <p style={{ fontSize: '10px', fontWeight: 'bold', color: '#52525b', textTransform: 'uppercase', letterSpacing: '2px' }}>V3.0 // Active Performance</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', background: '#18181b', padding: '8px', borderRadius: '16px' }}>
          <Dumbbell color={view === 'train' ? '#f97316' : '#52525b'} onClick={() => setView('train')} />
          <History color={view === 'history' ? '#f97316' : '#52525b'} onClick={() => setView('history')} />
        </div>
      </header>

      {/* DAY PICKER */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '30px', paddingBottom: '10px' }}>
        {DAYS.map((day, i) => (
          <button 
            key={day}
            onClick={() => setActiveDay(i)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '900',
              textTransform: 'uppercase',
              backgroundColor: activeDay === i ? '#f97316' : '#18181b',
              color: activeDay === i ? '#000' : '#71717a',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* WORKOUT CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ borderLeft: '4px solid #f97316', paddingLeft: '15px' }}>
            <h2 style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', margin: 0 }}>Current Target</h2>
            <p style={{ fontSize: '20px', fontWeight: '900', fontStyle: 'italic', margin: 0 }}>{activeWorkout.name}</p>
        </div>

        {activeWorkout.ex.map((name, idx) => (
          <div key={idx} style={{ background: '#09090b', border: '1px solid #18181b', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', margin: 0 }}>{name}</h3>
              <div style={{ color: '#f97316', fontSize: '12px', fontWeight: 'bold' }}>3 SETS</div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3].map(set => (
                <button 
                  key={set}
                  onClick={() => {
                    const key = `${name}-${set}`;
                    setCompletedSets({...completedSets, [key]: !completedSets[key]});
                    if(!completedSets[key]) setTimeLeft(60);
                  }}
                  style={{
                    flex: 1,
                    height: '50px',
                    borderRadius: '12px',
                    border: '2px solid #18181b',
                    background: completedSets[`${name}-${set}`] ? '#f97316' : 'transparent',
                    color: completedSets[`${name}-${set}`] ? '#000' : '#27272a',
                    fontWeight: '900',
                    cursor: 'pointer'
                  }}
                >
                  {completedSets[`${name}-${set}`] ? <CheckCircle size={18} /> : set}
                </button>
              ))}
              <button style={{ flex: 1, borderRadius: '12px', border: '2px dashed #18181b', background: 'transparent', color: '#18181b' }}>
                <Plus size={18}/>
              </button>
            </div>
          </div>
        ))}

        <button style={{ marginTop: '20px', width: '100%', padding: '20px', borderRadius: '20px', border: 'none', backgroundColor: '#fff', color: '#000', fontWeight: '900', fontSize: '16px', textTransform: 'uppercase', fontStyle: 'italic' }}>
          End Session & Log
        </button>
      </div>

      {/* FLOATING TIMER */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fff', color: '#000', padding: '15px 40px', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '4px solid #f97316' }}>
          <Clock size={24} />
          <span style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', fontFamily: 'monospace' }}>{timeLeft}</span>
          <RotateCcw size={18} onClick={() => setTimeLeft(0)} />
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
