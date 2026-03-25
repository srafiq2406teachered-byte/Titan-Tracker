import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, TrendingUp, History, Clock, PlusCircle, 
  Settings, Palette, Flame, Zap, Target, CheckCircle2, Moon, Sun, Monitor
} from 'lucide-react';

const TitanTracker = () => {
  // --- THEME ENGINE ---
  const THEMES = {
    EMBER: {
      name: "Electric Ember",
      bg: '#0A0A0B',
      surface: '#161618',
      accent: '#FF4D00',
      text: '#FFFFFF',
      textDim: '#8E8E93',
      border: 'rgba(255, 77, 0, 0.15)'
    },
    CYAN: {
      name: "Deep Cyan",
      bg: '#050B0D',
      surface: '#0D1517',
      accent: '#00F0FF',
      text: '#E0F7FA',
      textDim: '#5C7E82',
      border: 'rgba(0, 240, 255, 0.15)'
    },
    CARBON: {
      name: "Stealth Carbon",
      bg: '#000000',
      surface: '#111111',
      accent: '#FFFFFF',
      text: '#FFFFFF',
      textDim: '#444444',
      border: 'rgba(255, 255, 255, 0.1)'
    },
    FOREST: {
      name: "Bio-Growth",
      bg: '#080D08',
      surface: '#0F160F',
      accent: '#32D74B',
      text: '#F2FFF5',
      textDim: '#5C7A60',
      border: 'rgba(50, 215, 75, 0.15)'
    }
  };

  // --- STATE ---
  const [currentThemeKey, setCurrentThemeKey] = useState('EMBER');
  const [view, setView] = useState('train');
  const [mounted, setMounted] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [exerciseData, setExerciseData] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const THEME = THEMES[currentThemeKey];

  // --- PERSISTENCE ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('tt_v39_theme');
    const savedData = localStorage.getItem('tt_v39_data');
    if (savedTheme) setCurrentThemeKey(savedTheme);
    if (savedData) setExerciseData(JSON.parse(savedData));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('tt_v39_theme', currentThemeKey);
    }
  }, [currentThemeKey, mounted]);

  // --- PRESET CORE ---
  const CORE_8 = [
    { id: "A1", name: "Leg Press Machine", group: "LEGS", rest: 60 },
    { id: "A2", name: "Lat Pulldown Machine", group: "PULL", rest: 60 },
    { id: "B1", name: "Chest Press Machine", group: "PUSH", rest: 60 },
    { id: "B2", name: "Seated Leg Curl", group: "LEGS", rest: 60 },
    { id: "C1", name: "Seated Cable Row", group: "PULL", rest: 60 },
    { id: "C2", name: "DB Overhead Press", group: "PUSH", rest: 60 },
    { id: "D1", name: "Plank / Captain's Chair", group: "CORE", rest: 30 },
    { id: "D2", name: "Walking Lunges", group: "LEGS", rest: 30 }
  ];

  if (!mounted) return null;

  return (
    <div style={{ 
      background: THEME.bg, 
      minHeight: '100vh', 
      color: THEME.text, 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px 16px 120px 16px',
      transition: 'all 0.4s ease'
    }}>
      
      {/* NAVBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: THEME.accent, fontWeight: '900', fontStyle: 'italic', fontSize: '22px', margin: 0 }}>TITAN</h1>
        <div style={{ display: 'flex', gap: '6px', background: THEME.surface, padding: '6px', borderRadius: '14px', border: `1px solid ${THEME.border}` }}>
          {[
            { id: 'train', icon: <Dumbbell size={18} /> },
            { id: 'settings', icon: <Settings size={18} /> },
            { id: 'calendar', icon: <History size={18} /> }
          ].map(tab => (
            <button key={tab.id} onClick={() => setView(tab.id)} style={{ border: 'none', background: view === tab.id ? THEME.accent : 'transparent', padding: '10px', borderRadius: '10px', color: view === tab.id ? '#000' : THEME.textDim }}>{tab.icon}</button>
          ))}
        </div>
      </div>

      {/* VIEW: SETTINGS / COLOR SCHEMES */}
      {view === 'settings' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h2 style={{ fontSize: '11px', color: THEME.textDim, fontWeight: '800', letterSpacing: '1px', marginBottom: '20px' }}>VISUAL ENVIRONMENT</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button 
                key={key} 
                onClick={() => setCurrentThemeKey(key)}
                style={{ 
                  background: THEME.surface, 
                  border: currentThemeKey === key ? `2px solid ${t.accent}` : `1px solid ${THEME.border}`,
                  padding: '20px', 
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: t.accent }}></div>
                  <span style={{ color: THEME.text, fontWeight: '700', fontSize: '15px' }}>{t.name}</span>
                </div>
                {currentThemeKey === key && <CheckCircle2 size={20} color={t.accent} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TRAIN */}
      {view === 'train' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {CORE_8.map(ex => (
            <div key={ex.id} style={{ background: THEME.surface, padding: '20px', borderRadius: '24px', border: `1px solid ${THEME.border}`, position: 'relative' }}>
              <div style={{ fontWeight: '800', fontSize: '13px', color: THEME.accent, marginBottom: '15px', letterSpacing: '0.5px' }}>{ex.name.toUpperCase()}</div>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button 
                    onClick={() => { setCompletedSets(p => ({...p, [`${ex.id}-${i}`]: !p[`${ex.id}-${i}`]})); setTimeLeft(ex.rest); }} 
                    style={{ 
                      width: '52px', height: '52px', borderRadius: '15px', border: 'none', 
                      background: completedSets[`${ex.id}-${i}`] ? THEME.accent : THEME.bg, 
                      color: completedSets[`${ex.id}-${i}`] ? '#000' : THEME.textDim, 
                      fontWeight: '900', fontSize: '16px' 
                    }}>
                    {i+1}
                  </button>
                  <input type="number" placeholder="KG" style={{ flex: 1, background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '15px', color: THEME.text, textAlign: 'center', fontWeight: '800' }} />
                  <input type="number" placeholder="R" style={{ flex: 1, background: THEME.bg, border: `1px solid ${THEME.border}`, borderRadius: '15px', color: THEME.accent, textAlign: 'center', fontWeight: '800' }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* TIMER HUD */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', bottom: '30px', left: '20px', right: '20px', background: THEME.text, color: THEME.bg, padding: '20px', borderRadius: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><Clock size={24} /> <span style={{ fontSize: '32px', fontWeight: '900' }}>{timeLeft}s</span></div>
          <button onClick={() => setTimeLeft(0)} style={{ background: THEME.accent, border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '900', color: '#000' }}>SKIP</button>
        </div>
      )}
    </div>
  );
};

export default TitanTracker;
