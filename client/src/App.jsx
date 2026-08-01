import React, { useState, useEffect } from 'react';
import './App.css';

const ICON_MAP = {
  'Scholarship Office': '🎓',
  'Accounts Office': '💳',
  'Examination Cell': '📝',
  'Library': '📚',
  'Hostel Office': '🏢',
};

function App() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedToken, setSelectedToken] = useState(null);
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/departments');
      if (!res.ok) {
        throw new Error(`Failed to fetch departments (${res.status})`);
      }
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQueue = async (dept) => {
    try {
      setJoiningId(dept._id);
      setError(null);
      const res = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departmentId: dept._id }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to join queue');
      }

      setSelectedToken({
        departmentName: dept.name,
        tokenNumber: data.tokenNumber,
        counter: data.counter,
        position: data.position,
      });
    } catch (err) {
      console.error('Error joining queue:', err);
      setError(err.message);
    } finally {
      setJoiningId(null);
    }
  };

  const handleResetToken = () => {
    setSelectedToken(null);
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo-container">
          <div className="logo-badge">Q</div>
          <span className="logo-text">QHandle</span>
        </div>
      </header>

      <main className="hero-section">
        <div className="badge">Campus Queue Management</div>
        <h1 className="title">QHandle</h1>
        <p className="subtitle">Smart Multi-Department Queue Management System</p>
        <p className="description">
          Select a department below to join the queue and get your instant queue token.
        </p>

        {error && (
          <div className="error-banner">
            <p>⚠️ {error}</p>
          </div>
        )}

        {selectedToken ? (
          <div className="token-card">
            <div className="token-header">
              <span className="token-badge">Token Generated</span>
              <h3>{selectedToken.departmentName}</h3>
            </div>
            <div className="token-number-box">
              <span className="token-label">Token Number</span>
              <div className="token-number">{selectedToken.tokenNumber}</div>
            </div>
            <div className="token-details">
              <div className="detail-item">
                <span className="detail-label">Assigned Counter</span>
                <span className="detail-value">{selectedToken.counter}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Queue Position</span>
                <span className="detail-value">#{selectedToken.position}</span>
              </div>
            </div>
            <button className="btn-secondary" onClick={handleResetToken} type="button">
              Join Another Queue
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="loading-state">Loading departments...</div>
            ) : (
              <div className="dept-grid">
                {departments.map((dept) => {
                  const icon = ICON_MAP[dept.name] || '🏢';
                  const isJoining = joiningId === dept._id;
                  return (
                    <div
                      key={dept._id}
                      className={`dept-card ${isJoining ? 'joining' : ''}`}
                      onClick={() => !isJoining && handleJoinQueue(dept)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinQueue(dept)}
                    >
                      <span className="dept-icon">{icon}</span>
                      <span className="dept-name">{dept.name}</span>
                      <span className="dept-code">{dept.code}</span>
                      <button className="btn-join" type="button" disabled={isJoining}>
                        {isJoining ? 'Joining...' : 'Join Queue'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} QHandle. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
