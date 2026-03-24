import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, Flame, Scale, RotateCcw, Dumbbell, History, PlusCircle, Trash2 } from 'lucide-react';

const TitanTracker = () => {
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [view, setView] = useState('train'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [sessionWeights, setSessionWeights] = useState({});
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('titan-v3-history') || '[]'));

  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // FULL 7-DAY SCIENTIFIC SPLIT
  const DEFAULT_PLANS = {
    1: { name: "Push (Chest/Shoulders/Triceps)", exercises: [
        { id: "p1", name: "Chest Press Machine", sets: 3, reps: "10-12", weight: 45 },
        { id: "p2", name: "Shoulder Press Machine", sets: 3, reps: "12", weight: 20 },
        { id: "p3", name: "Pec Deck Fly", sets: 3, reps: "15", weight: 35 },
        { id: "p4", name: "Tricep Cable Pushdown", sets: 3, reps: "15", weight: 15 }
    ]},
    2: { name: "Pull (Back/Biceps)", exercises: [
        { id: "l1", name: "Lat Pulldown", sets: 3, reps: "10-12", weight: 40 },
        { id: "l2", name: "Seated Cable Row", sets: 3, reps: "12", weight: 35 },
        { id: "l3", name: "Face Pulls", sets: 3, reps: "15", weight: 12 },
        { id: "l4", name: "Machine Preacher Curl", sets: 3, reps: "12", weight: 15 }
    ]},
    3: { name: "Legs (Quads/Hams)", exercises: [
        { id: "lg1", name: "Leg Press", sets: 4, reps: "10-12", weight: 80 },
        { id: "lg2", name: "Leg Extension", sets: 3, reps: "15", weight: 30 },
        { id: "lg3", name: "Seated Leg Curl", sets: 3, reps: "15", weight: 25 },
        { id: "lg4", name: "Calf Press", sets: 4, reps: "20", weight: 50 }
    ]},
    4: { name: "Full Body Burn (Circuit)", exercises: [
        { id: "fb1", name: "Goblet Squat", sets: 3, reps: "15", weight: 12 },
        { id: "fb2", name: "Incline DB Press", sets: 3, reps: "12", weight: 14 },
        { id: "fb3", name: "Lat Pulldown (Wide)", sets: 3, reps: "12", weight: 35 },
        { id: "fb4", name: "Kettlebell Swings", sets: 3, reps: "20", weight: 16 }
    ]},
    5: { name: "Upper Focus (Detail)", exercises: [
        { id: "up1", name: "Incline Machine Press", sets: 3, reps: "12", weight: 30 },
        { id: "up2", name: "Lat Pulldown (Close Grip)", sets: 3, reps: "12", weight: 40 },
        { id: "up3", name: "Lateral Raise Machine", sets: 3, reps: "15", weight: 10 },
        { id: "up4", name: "Rope Hammer Curls", sets: 3, reps: "12", weight: 15 }
    ]},
    6: { name: "Metabolic / Cardio", exercises: [
        { id: "c1", name: "Incline Walk", sets: 1, reps: "20 min", weight: 5 },
        { id: "c2", name: "Stairmaster", sets: 1, reps: "10 min", weight: 7 },
        { id: "c3", name: "Captain's Chair Leg Raise", sets: 3, reps: "15", weight: 0 },
        { id: "c4", name: "Plank", sets: 3, reps: "60s", weight: 0 }
    ]},
    0: { name: "Active Recovery", exercises: [
        { id: "r1", name: "Light Walking", sets: 1, reps: "30 min", weight: 0 },
        { id: "r2", name: "Static Stretching", sets: 1, reps: "10 min", weight: 0 }
    ]}
  };

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const toggleSet = (exId, setIdx) => {
    const key = `${exId}-${setIdx}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
    if (!completedSets[key]) setTimeLeft(60); 
  };

  const handleWeightChange = (exId, val) => {
    setSessionWeights(prev => ({ ...prev, [exId]: val }));
  };

  const saveSession = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      day: DAYS[activeDay],
      workoutName: DEFAULT_PLANS[activeDay].name,
    };
    const newHistory = [entry, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('titan-v3-history', JSON.stringify(newHistory));
    setCompletedSets({});
    alert("Session Logged to History!");
  };

  const activeWorkout = DEFAULT_PLANS[activeDay];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-black text-white p-4 font-sans pb-32">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 pt-4">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-orange-600 leading-none">TITAN</h1>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Status: Active Training</p>
        </div>
        <div className="flex bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800">
          <button onClick={() => setView('train')} className={`p-3 rounded-xl transition-all ${view === 'train' ? 'bg-orange-600 text-black' : 'text-zinc-500'}`}><Dumbbell size={20}/></button>
          <button onClick={() => setView('history')} className={`p-3 rounded-xl transition-all ${view === 'history' ? 'bg-orange-600 text-black' : 'text-zinc-500'}`}><History size={20}/></button>
        </div>
      </div>

      {/* DAY PICKER */}
      <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
        {DAYS.map((day, i) => (
          <button 
            key={day} 
            onClick={() => {setActiveDay(i); setCompletedSets({});}}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all border-2 ${activeDay === i ? 'bg-orange-600 border-orange-600 text-black' : 'border-zinc-900 text-zinc-600'}`}
          >
            {day.substring(0, 3)}
          </button>
        ))}
      </div>

      {view === 'train' ? (
        <div className="space-y-6">
          <div className="border-l-4 border-orange-600 pl-4 mb-8">
            <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Target Today</h2>
            <p className="text-xl font-black italic uppercase tracking-tight">{activeWorkout.name}</p>
          </div>

          {activeWorkout.exercises.map((ex) => (
            <div key={ex.id} className="bg-zinc-950 border border-zinc-900 rounded-[32px] p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-sm uppercase italic tracking-wide w-2/3">{ex.name}</h3>
                <div className="flex items-center gap-2 bg-black border border-zinc-800 px-3 py-2 rounded-xl">
                    <input 
                      type="number" 
                      defaultValue={ex.weight}
                      onChange={(e) => handleWeightChange(ex.id, e.target.value)}
                      className="bg-transparent w-8 text-center text-orange-500 font-bold outline-none"
                    />
                    <span className="text-[9px] font-black text-zinc-600 uppercase">KG</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[...Array(ex.sets)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => toggleSet(ex.id, i)}
                    className={`h-14 rounded-2xl border-2 font-black italic transition-all flex items-center justify-center ${completedSets[`${ex.id}-${i}`] ? 'bg-orange-600 border-orange-600 text-black' : 'border-zinc-900 text-zinc-800'}`}
                  >
                    {completedSets[`${ex.id}-${i}`] ? <CheckCircle size={20} /> : i + 1}
                  </button>
                ))}
                <button className="h-14 rounded-2xl border-2 border-dashed border-zinc-900 text-zinc-800 flex items-center justify-center hover:text-orange-600 transition-colors">
                    <Plus size={20} />
                </button>
              </div>
            </div>
          ))}

          <button onClick={saveSession} className="w-full bg-white text-black font-black py-6 rounded-[32px] uppercase italic tracking-tighter hover:bg-orange-600 transition-all mt-8">
            End Protocol & Save
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-20 text-zinc-800 font-black uppercase italic">No Data Found</div>
          ) : (
            history.map(log => (
              <div key={log.id} className="bg-zinc-950 border border-zinc-900 p-5 rounded-[24px] flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase">{log.date}</p>
                  <p className="font-black italic text-white uppercase">{log.workoutName}</p>
                </div>
                <Flame size={20} className="text-orange-600" />
              </div>
            ))
          )}
        </div>
      )}

      {/* FLOATING TIMER */}
      {timeLeft > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-10 py-5 rounded-[24px] shadow-2xl flex items-center gap-6 z-50 border-4 border-orange-600 animate-pulse">
          <Clock size={28} />
          <span className="font-mono text-5xl font-black italic tracking-tighter">{timeLeft}</span>
          <button onClick={() => setTimeLeft(0)} className="bg-zinc-200 p-2 rounded-full"><RotateCcw size={18}/></button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
