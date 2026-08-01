import React, { useState, useEffect } from 'react';

function StaffDashboard({ departments }) {
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [counters, setCounters] = useState([]);
  const [queueGrouped, setQueueGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Set initial selected department when departments load
  useEffect(() => {
    if (departments && departments.length > 0 && !selectedDeptId) {
      setSelectedDeptId(departments[0]._id);
    }
  }, [departments, selectedDeptId]);

  // Fetch staff data when selected department changes
  useEffect(() => {
    if (selectedDeptId) {
      fetchStaffData(selectedDeptId);
    }
  }, [selectedDeptId]);

  const fetchStaffData = async (deptId) => {
    try {
      setLoading(true);
      setError(null);

      const [countersRes, queueRes] = await Promise.all([
        fetch(`/api/staff/${deptId}/counters`),
        fetch(`/api/staff/${deptId}/queue`),
      ]);

      if (!countersRes.ok) {
        throw new Error(`Failed to fetch counters (${countersRes.status})`);
      }
      if (!queueRes.ok) {
        throw new Error(`Failed to fetch queue (${queueRes.status})`);
      }

      const countersData = await countersRes.json();
      const queueData = await queueRes.json();

      setCounters(countersData);
      setQueueGrouped(queueData);
    } catch (err) {
      console.error('Error loading staff dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCallNext = async (counterId) => {
    try {
      setActionLoading(`call-${counterId}`);
      setError(null);
      const res = await fetch(`/api/staff/${counterId}/call-next`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to call next token');
      }
      // Refresh dashboard
      await fetchStaffData(selectedDeptId);
    } catch (err) {
      console.error('Error calling next token:', err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (counterId) => {
    try {
      setActionLoading(`complete-${counterId}`);
      setError(null);
      const res = await fetch(`/api/staff/${counterId}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete token');
      }
      // Refresh dashboard
      await fetchStaffData(selectedDeptId);
    } catch (err) {
      console.error('Error marking token completed:', err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="staff-dashboard-container">
      <div className="dashboard-header">
        <h2>Staff Dashboard</h2>
        <div className="dept-select-wrapper">
          <label htmlFor="department-select">Select Department:</label>
          <select
            id="department-select"
            className="dept-select"
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading dashboard data...</div>
      ) : (
        <>
          <div className="counter-cards-grid">
            {counters.map((counter) => {
              const isCallLoading = actionLoading === `call-${counter._id}`;
              const isCompleteLoading = actionLoading === `complete-${counter._id}`;
              const servingTokenNumber = counter.currentServingToken?.tokenNumber || 'None';

              return (
                <div key={counter._id} className="counter-card">
                  <div className="counter-card-header">
                    <h3 className="counter-name">{counter.name}</h3>
                    <span className={`status-pill ${counter.isOpen ? 'open' : 'closed'}`}>
                      {counter.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div className="counter-metrics">
                    <div className="metric-box">
                      <span className="metric-label">Queue Count</span>
                      <span className="metric-value">{counter.currentQueueCount}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Currently Serving</span>
                      <span className={`metric-value serving-highlight ${servingTokenNumber !== 'None' ? 'active' : ''}`}>
                        {servingTokenNumber}
                      </span>
                    </div>
                  </div>

                  <div className="counter-card-actions">
                    <button
                      type="button"
                      className="btn-action btn-call-next"
                      onClick={() => handleCallNext(counter._id)}
                      disabled={isCallLoading || isCompleteLoading || !counter.isOpen}
                    >
                      {isCallLoading ? 'Calling...' : 'Call Next'}
                    </button>
                    <button
                      type="button"
                      className="btn-action btn-complete"
                      onClick={() => handleComplete(counter._id)}
                      disabled={isCallLoading || isCompleteLoading || servingTokenNumber === 'None'}
                    >
                      {isCompleteLoading ? 'Completing...' : 'Mark Completed'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="waiting-queue-section">
            <h3>Waiting Tokens</h3>
            {Object.keys(queueGrouped).length === 0 ? (
              <p className="no-tokens-msg">No queues found.</p>
            ) : (
              Object.entries(queueGrouped).map(([counterName, tokens]) => (
                <div key={counterName} className="counter-queue-group">
                  <h4 className="counter-group-title">{counterName} ({tokens.length} waiting)</h4>
                  {tokens.length === 0 ? (
                    <p className="no-tokens-msg">No waiting tokens for {counterName}</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="queue-table">
                        <thead>
                          <tr>
                            <th>Token Number</th>
                            <th>Status</th>
                            <th>Created At</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tokens.map((token) => (
                            <tr key={token._id}>
                              <td className="token-cell">{token.tokenNumber}</td>
                              <td>
                                <span className="status-tag waiting">{token.status}</span>
                              </td>
                              <td>{new Date(token.createdAt).toLocaleTimeString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StaffDashboard;
