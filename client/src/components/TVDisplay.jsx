import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Tv, Users, Clock } from 'lucide-react';
import { soundFX } from '../utils/audio';

const TVDisplay = ({ departments }) => {
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?._id || '');
  const [counters, setCounters] = useState([]);
  const [queueGrouped, setQueueGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll department data every 4 seconds for TV display
  useEffect(() => {
    if (!selectedDeptId && departments.length > 0) {
      setSelectedDeptId(departments[0]._id);
    }

    if (selectedDeptId) {
      fetchDisplayData(selectedDeptId);
      const interval = setInterval(() => {
        fetchDisplayData(selectedDeptId);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selectedDeptId, departments]);

  const fetchDisplayData = async (deptId) => {
    try {
      const [countersRes, queueRes] = await Promise.all([
        fetch(`/api/staff/${deptId}/counters`),
        fetch(`/api/staff/${deptId}/queue`),
      ]);

      if (countersRes.ok && queueRes.ok) {
        const countersData = await countersRes.json();
        const queueData = await queueRes.json();

        setCounters(countersData);
        setQueueGrouped(queueData);
      }
    } catch (err) {
      console.error('TV Display fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDeptObj = departments.find(d => d._id === selectedDeptId);

  return (
    <div className="tv-display-container animate-fade-in">
      {/* Top Banner Header for Lobby Screen */}
      <div className="tv-header">
        <div className="tv-brand">
          <div className="tv-icon-glow">
            <Tv size={24} />
          </div>
          <div>
            <h2 className="tv-brand-title">CAMPUS QUEUE MONITOR</h2>
            <p className="tv-brand-subtitle">QHandle Live Display System</p>
          </div>
        </div>

        <div className="tv-controls">
          <div className="dept-pill-selector">
            {departments.map((d) => (
              <button
                key={d._id}
                type="button"
                className={`dept-pill ${selectedDeptId === d._id ? 'active' : ''}`}
                onClick={() => {
                  soundFX.playClick();
                  setSelectedDeptId(d._id);
                }}
              >
                {d.code}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="audio-toggle-btn"
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              soundFX.enabled = !audioEnabled;
              soundFX.playClick();
            }}
          >
            {audioEnabled ? <Volume2 size={20} className="text-emerald" /> : <VolumeX size={20} />}
          </button>
        </div>

        <div className="tv-clock-box">
          <Clock size={18} className="text-indigo" />
          <span className="tv-clock-time">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Main TV Display Grid */}
      <div className="tv-main-grid">
        {/* Left Side: Serving Counters */}
        <div className="tv-serving-column">
          <div className="tv-section-title">
            <Radio size={20} className="pulse-red" />
            <span>NOW SERVING — {selectedDeptObj ? selectedDeptObj.name : ''}</span>
          </div>

          {loading ? (
            <div className="tv-loading">Updating Live Feed...</div>
          ) : (
            <div className="tv-counter-cards">
              {counters.map((c) => {
                const servingToken = c.currentServingToken?.tokenNumber;
                return (
                  <div key={c._id} className={`tv-counter-card ${servingToken ? 'active-serving' : 'idle'}`}>
                    <div className="tv-counter-name">{c.name}</div>
                    <div className="tv-serving-display">
                      <span className="tv-serving-label">TOKEN</span>
                      <div className="tv-token-hero">
                        {servingToken ? (
                          <span className="tv-token-num glow-text">{servingToken}</span>
                        ) : (
                          <span className="tv-token-empty">VACANT</span>
                        )}
                      </div>
                    </div>
                    <div className="tv-counter-footer">
                      <span className={`status-badge ${c.isOpen ? 'open' : 'closed'}`}>
                        {c.isOpen ? '● COUNTER OPEN' : '○ CLOSED'}
                      </span>
                      <span className="queue-count-badge">
                        <Users size={12} /> {c.currentQueueCount} waiting
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Waiting Ticker */}
        <div className="tv-waiting-column">
          <div className="tv-section-title">
            <Users size={20} className="text-indigo" />
            <span>UPCOMING TOKENS</span>
          </div>

          <div className="tv-queue-lists">
            {Object.entries(queueGrouped).map(([cName, tokens]) => (
              <div key={cName} className="tv-queue-group">
                <div className="tv-group-header">
                  <span>{cName}</span>
                  <span className="count-tag">{tokens.length} In Line</span>
                </div>

                {tokens.length === 0 ? (
                  <div className="tv-empty-queue">Queue is empty</div>
                ) : (
                  <div className="tv-token-chips">
                    {tokens.slice(0, 8).map((t, index) => (
                      <div key={t._id} className={`tv-token-chip ${index === 0 ? 'next-inline' : ''}`}>
                        <span className="chip-pos">#{index + 1}</span>
                        <span className="chip-num">{t.tokenNumber}</span>
                      </div>
                    ))}
                    {tokens.length > 8 && (
                      <div className="tv-token-chip more">+{tokens.length - 8} more</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Announcer Ticker */}
      <div className="tv-footer-ticker">
        <div className="ticker-label">ANNOUNCEMENT</div>
        <marquee className="ticker-text">
          📢 Welcome to QHandle Campus Queue Network • Please keep your digital token receipt ready • Audio chimes will alert when your token is called at the designated counter!
        </marquee>
      </div>
    </div>
  );
};

export default TVDisplay;
