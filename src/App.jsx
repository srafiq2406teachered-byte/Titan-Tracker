import React, { useState, useEffect } from 'react';
import { Timer, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';

const TitanUnifiedSession = () => {
  // --- SESSION STATE ---
  const [sessionActive, setSessionActive] = useState(true);
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Bench Press', sets: 3, completed: 0, rest: 90 },
    { id: 2, name: 'Incline DB Fly', sets: 3, completed: 0, rest: 60 },
    { id: 3, name: 'Tricep Extensions', sets: 4, completed: 0, rest: 45 },
  ]);

  // --- TIMER ENGINE STATE ---
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);

  // Global Workout Clock
  useEffect(() => {
    let interval = null;
    if (sessionActive) {
      interval = setInterval(() => {
        setTotalWorkoutTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Rest Timer Logic
  useEffect(() => {
    let timer = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  // --- HANDLERS ---
  const startRest = (seconds) => {
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const completeSet = (id, restTime) => {
    setExercises(prev => prev.map(ex => 
      ex.id === id ? { ...ex, completed: ex.completed + 1 } : ex
    ));
    startRest(restTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-900 text-white min-h-screen font-sans">
      {/* HEADER: TOTAL TIME */}
      <header className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-blue-400">TITAN+ UNIFIED</h1>
        <div className="text-right">
          <p className="text-xs text-slate-400 uppercase tracking-widest">Session Time</p>
          <p className="text-lg font-mono">{formatTime(totalWorkoutTime)}</p>
        </div>
      </header>

      {/* THE ENGINE SYNC (REST TIMER) overlay */}
      <div className={`mb-8 p-6 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-800'}`}>
        <div className="flex items-center gap-3 mb-2">
          <Timer className={isActive ? 'animate-pulse' : ''} size={20} />
          <span className="text-sm font-semibold uppercase tracking-wider">Rest Engine</span>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="text-5xl font-mono font-bold">
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsActive(!isActive)}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30"
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              onClick={() => {setIsActive(false); setTimeLeft(0);}}
              className="p-2 bg-white/10 rounded-full"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
        
        {/* Metabolic Progress Bar */}
        <div className="mt-4 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-1000 ease-linear"
            style={{ width: timeLeft > 0 ? '100%' : '0%' }}
          ></div>
        </div>
      </div>

      {/* EXERCISE LIST */}
      <div className="space-y-4">
        {exercises.map((ex) => (
          <div key={ex.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{ex.name}</h3>
                <p className="text-xs text-slate-400">{ex.sets} Sets • {ex.rest}s Rest</p>
              </div>
              <div className="text-blue-400 font-mono">
                {ex.completed}/{ex.sets}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1 bg-slate-900 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Weight</p>
                <input type="number" className="bg-transparent w-full text-center font-bold focus:outline-none" placeholder="0" />
              </div>
              <div className="flex-1 bg-slate-900 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500 uppercase">Reps</p>
                <input type="number" className="bg-transparent w-full text-center font-bold focus:outline-none" placeholder="0" />
              </div>
              
              <button 
                onClick={() => completeSet(ex.id, ex.rest)}
                disabled={ex.completed >= ex.sets}
                className={`flex-none px-4 rounded-lg flex items-center justify-center transition-colors ${
                  ex.completed >= ex.sets ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                {ex.completed >= ex.sets ? <CheckCircle2 /> : <CheckCircle2 />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TitanUnifiedSession;