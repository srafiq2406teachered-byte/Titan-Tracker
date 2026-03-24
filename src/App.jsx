import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, RotateCcw, Dumbbell, History, Plus, Timer } from 'lucide-react';

const TitanTracker = () => {
  const [view, setView] = useState('train'); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});

  // MASTER PROTOCOL: A1-D2 Structure
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
    card: '#111111',
    border: '#222222',
    orange: '#FF5C00',
    textMain: '#FFFFFF',
    textDim: '#55
