/* ... (keeping your existing imports and state logic above) ... */

      {/* VIEW: TRAIN (CONTINUED) */}
      {view === 'train' && activeSession && (
        <div style={{ paddingBottom: '160px' }}>
          {activeSession.list.map((ex) => (
            <div key={ex.instanceId} style={{ background: T.surface, padding: '15px', borderRadius: '20px', border: `1px solid ${T.border}`, marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900' }}>{ex.name}</span>
                <button onClick={() => setActiveSession(p => ({...p, list: p.list.filter(i => i.instanceId !== ex.instanceId)}))} style={{ background: 'none', border: 'none', color: '#EF4444' }}>
                  <Trash2 size={16}/>
                </button>
              </div>
              <div style={{ fontSize: '0.7em', color: T.accent, fontWeight: '800', marginBottom: '12px' }}>LAST: {getLastLog(ex.name)}</div>
              
              {sessionData[ex.instanceId]?.map((set, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                   <div style={{ flex: 1, display: 'flex', background: T.bg, borderRadius: '8px' }}>
                    <input 
                      type="number" 
                      value={set.w} 
                      onChange={e => updateSet(ex.instanceId, i, 'w', parseFloat(e.target.value) - set.w)} 
                      className="w-full bg-transparent border-none text-white text-center font-bold p-2"
                    />
                  </div>
                  <div style={{ flex: 1, display: 'flex', background: T.bg, borderRadius: '8px' }}>
                    <input 
                      type="number" 
                      value={set.r} 
                      onChange={e => updateSet(ex.instanceId, i, 'r', parseInt(e.target.value) - set.r)} 
                      className="w-full bg-transparent border-none text-white text-center font-bold p-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* TRAIN FOOTER CONTROLS */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.bg, padding: '20px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: '10px' }}>
            <button onClick={() => setView('library')} style={{ flex: 1, background: T.surface, padding: '15px', borderRadius: '15px', border: 'none', color: '#FFF', fontWeight: 'bold' }}>+ ADD</button>
            <button onClick={finishSession} style={{ flex: 2, background: T.accent, padding: '15px', borderRadius: '15px', border: 'none', color: '#000', fontWeight: '900' }}>FINISH WORKOUT</button>
          </div>
        </div>
      )}

      {/* VIEW: LIBRARY */}
      {view === 'library' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setView('train')} style={{ background: 'none', border: 'none', color: T.text }}><ChevronLeft/></button>
            <input 
              autoFocus
              placeholder="Search exercise..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: T.surface, border: 'none', padding: '12px', borderRadius: '10px', color: '#FFF' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredLib.map(ex => (
              <button key={ex.id} onClick={() => addExtra(ex)} style={{ background: T.surface, padding: '15px', borderRadius: '12px', border: 'none', color: '#FFF', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                <span>{ex.name}</span>
                <span style={{ color: T.accent, fontSize: '0.8em' }}>{ex.muscle}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: METRICS */}
      {view === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontWeight: '900' }}>HISTORY</h2>
          {history.length === 0 && <div style={{ color: T.subtext }}>No sessions recorded yet.</div>}
          {history.map((log, i) => (
            <div key={i} style={{ background: T.surface, padding: '15px', borderRadius: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>{log.name}</span>
                <span style={{ color: T.subtext, fontSize: '0.8em' }}>{log.date}</span>
              </div>
              <div style={{ fontSize: '0.9em' }}>Volume: <span style={{ color: T.accent }}>{log.volume}kg</span></div>
            </div>
          ))}
          <button onClick={() => { if(confirm('Clear all?')) setHistory([]); }} style={{ marginTop: '20px', color: '#EF4444', background: 'none', border: 'none' }}>Clear History</button>
        </div>
      )}

      {/* TIMER OVERLAY */}
      {timeLeft > 0 && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', background: T.accent, color: '#000', padding: '10px 25px', borderRadius: '50px', fontWeight: '900', zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          REST: {timeLeft}s
        </div>
      )}
    </div>
  );
};

export default TitanTracker;