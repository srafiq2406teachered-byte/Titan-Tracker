/* --- 1. CONFIG & STATE --- */
// (Keep your imports and full EXTRA_POOL from the previous version)

const TitanTracker = () => {
  // ... (Keep existing State hooks for history, bio, accent, etc.)

  // --- 2. THE STABLE LAYOUT ENGINE ---
  const T = { 
    bg: '#050810', 
    surface: '#111827', 
    card: '#1F2937', 
    accent: accent, 
    text: '#F9FAFB', 
    subtext: '#9CA3AF', 
    border: 'rgba(255,255,255,0.05)' 
  };

  // --- 3. RENDER LOGIC ---
  return (
    <div style={{ background: T.bg, minHeight: '100vh', color: T.text, padding: '16px', fontSize: `${fontSize}px`, fontFamily: '-apple-system, sans-serif', maxWidth: '480px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* PERSISTENT HEADER */}
      {view !== 'library' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontWeight: '900', letterSpacing: '-1px' }}>TITAN<span style={{color: T.accent}}>+</span></h1>
          <div style={{ display: 'flex', background: T.surface, padding: '4px', borderRadius: '12px', gap: '2px' }}>
            <button onClick={() => setView('menu')} style={{ border: 'none', padding: '10px', background: view === 'menu' ? T.card : 'transparent', color: view === 'menu' ? T.accent : T.subtext, borderRadius: '8px' }}><Play size={18}/></button>
            <button onClick={() => setView('biometrics')} style={{ border: 'none', padding: '10px', background: view === 'biometrics' ? T.card : 'transparent', color: view === 'biometrics' ? T.accent : T.subtext, borderRadius: '8px' }}><Calculator size={18}/></button>
            <button onClick={() => setView('metrics')} style={{ border: 'none', padding: '10px', background: view === 'metrics' ? T.card : 'transparent', color: view === 'metrics' ? T.accent : T.subtext, borderRadius: '8px' }}><BarChart2 size={18}/></button>
            <button onClick={() => setView('settings')} style={{ border: 'none', padding: '10px', background: view === 'settings' ? T.card : 'transparent', color: view === 'settings' ? T.accent : T.subtext, borderRadius: '8px' }}><Settings size={18}/></button>
          </div>
        </div>
      )}

      {/* VIEW: TRAIN (Fixed Reps Off-Page) */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '140px' }}>
          {activeSession.list.map((ex) => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '16px', borderRadius: '16px', marginBottom: '12px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9em' }}>{ex.name}</span>
                <button onClick={() => setActiveSession(p => ({...p, list: p.list.filter(i => i.instanceId !== ex.instanceId)}))} style={{ color: '#EF4444', background: 'none', border: 'none' }}><Trash2 size={14}/></button>
              </div>

              {/* Header for Weight/Reps */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.7em', color: T.subtext, fontWeight: 'bold' }}>
                <div style={{ width: '40px' }}>SET</div>
                <div style={{ flex: 1, textAlign: 'center' }}>KG / LVL</div>
                <div style={{ flex: 1, textAlign: 'center' }}>REPS / MIN</div>
              </div>

              {sessionData[ex.instanceId]?.map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <button onClick={() => { setTimeLeft(activeSession.rest); triggerHaptic(30); }} style={{ width: '40px', height: '40px', background: T.card, border: 'none', borderRadius: '8px', color: T.accent, fontWeight: '900' }}>{i+1}</button>
                  
                  {/* Weight Input */}
                  <div style={{ flex: 1, background: T.bg, borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <input type="number" value={set.w} onChange={e => updateSet(ex.instanceId, i, 'w', parseFloat(e.target.value) - set.w)} style={{ width: '100%', background: 'none', border: 'none', color: '#FFF', textAlign: 'center', padding: '10px', fontWeight: 'bold' }} />
                  </div>

                  {/* Reps Input */}
                  <div style={{ flex: 1, background: T.bg, borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    <input type="number" value={set.r} onChange={e => updateSet(ex.instanceId, i, 'r', parseInt(e.target.value) - set.r)} style={{ width: '100%', background: 'none', border: 'none', color: '#FFF', textAlign: 'center', padding: '10px', fontWeight: 'bold' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: `linear-gradient(transparent, ${T.bg} 20%)`, display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, padding: '16px', borderRadius: '12px', background: T.surface, color: '#FFF', border: 'none', fontWeight: 'bold' }}>+ ADD</button>
            <button onClick={finishSession} style={{ flex: 2, padding: '16px', borderRadius: '12px', background: T.accent, color: '#000', border: 'none', fontWeight: '900' }}>FINISH</button>
          </div>
        </div>
      )}

      {/* VIEW: METRICS (History + Visual Progress) */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: T.surface, padding: '20px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '0.8em', color: T.subtext, marginBottom: '10px' }}>VOLUME PROGRESS</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '60px' }}>
              {history.slice(0, 7).reverse().map((h, i) => (
                <div key={i} style={{ flex: 1, background: T.accent, height: `${Math.min(100, (h.volume / 5000) * 100)}%`, borderRadius: '4px', opacity: 0.5 + (i * 0.1) }} />
              ))}
            </div>
          </div>

          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '16px', borderRadius: '16px', border: `1px solid ${T.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold' }}>{log.name}</span>
                <span style={{ fontSize: '0.75em', color: T.subtext }}>{log.date}</span>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ fontSize: '0.8em' }}><Zap size={12} style={{color: T.accent, marginRight: '4px'}}/>{log.volume}kg</div>
                <div style={{ fontSize: '0.8em' }}><History size={12} style={{color: T.subtext, marginRight: '4px'}}/>{log.details.length} Ex.</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ... (Keep BIOMETRICS, SETTINGS, and LIBRARY from previous) */}
      
    </div>
  );
};

export default TitanTracker;