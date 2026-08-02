import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  Megaphone, 
  Building2, 
  Clock, 
  Search, 
  RefreshCw, 
  Sparkles,
  Activity,
  AlertCircle,
  LogOut,
  User,
  ShieldCheck
} from 'lucide-react';
import { soundFX } from '../utils/audio';

function StaffDashboard({ departments, staffSession, onLogoutStaff }) {
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [counters, setCounters] = useState([]);
  const [queueGrouped, setQueueGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Set initial selected department based on staffSession or first department
  useEffect(() => {
    if (departments && departments.length > 0) {
      if (staffSession?.department) {
        const matchedDept = departments.find(
          (d) => d.name.toLowerCase() === staffSession.department.toLowerCase()
        );
        if (matchedDept) {
          setSelectedDeptId(matchedDept._id);
          return;
        }
      }
      if (!selectedDeptId) {
        setSelectedDeptId(departments[0]._id);
      }
    }
  }, [departments, staffSession, selectedDeptId]);

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
      soundFX.playCall();
      setActionLoading(`call-${counterId}`);
      setError(null);
      const res = await fetch(`/api/staff/${counterId}/call-next`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to call next token');
      }
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
      soundFX.playSuccess();
      setActionLoading(`complete-${counterId}`);
      setError(null);
      const res = await fetch(`/api/staff/${counterId}/complete`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to complete token');
      }
      await fetchStaffData(selectedDeptId);
    } catch (err) {
      console.error('Error marking token completed:', err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate statistics
  const totalWaiting = Object.values(queueGrouped).reduce(
    (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
    0
  );
  const activeCounters = counters.filter((c) => c.isOpen).length;
  const servingCount = counters.filter((c) => c.currentServingToken).length;

  return (
    <div className="staff-dashboard-container animate-fade-in">
      {/* Dashboard Top Navigation / Header */}
      <div className="dashboard-header-card">
        <div className="dashboard-title-area">
          <div className="dept-badge-icon">
            <Building2 size={24} />
          </div>
          <div>
            <h2>Staff Control Center</h2>
            <p className="dashboard-subtitle">Manage counters & invoke caller system</p>
          </div>
        </div>

        {staffSession && (
          <div className="staff-user-badge-bar">
            <div className="staff-profile-chip">
              <ShieldCheck size={16} className="text-emerald" />
              <span>
                <strong>{staffSession.name}</strong> (ID: {staffSession.staffId})
              </span>
              <span className="staff-dept-pill">{staffSession.department}</span>
            </div>
            {onLogoutStaff && (
              <button
                type="button"
                className="staff-logout-btn"
                onClick={() => {
                  soundFX.playClick();
                  onLogoutStaff();
                }}
                title="Log Out of Staff Portal"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}

        <div className="dept-select-wrapper">
          <label htmlFor="department-select">Department:</label>
          <select
            id="department-select"
            className="dept-select"
            value={selectedDeptId}
            onChange={(e) => {
              soundFX.playClick();
              setSelectedDeptId(e.target.value);
            }}
          >
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-icon-refresh"
            onClick={() => {
              soundFX.playClick();
              fetchStaffData(selectedDeptId);
            }}
            title="Refresh Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="staff-stats-grid">
        <div className="staff-stat-card border-indigo">
          <div className="stat-icon-wrapper indigo">
            <Activity size={20} />
          </div>
          <div>
            <span className="stat-label">Active Counters</span>
            <span className="stat-value">{activeCounters} / {counters.length}</span>
          </div>
        </div>

        <div className="staff-stat-card border-sky">
          <div className="stat-icon-wrapper sky">
            <Megaphone size={20} />
          </div>
          <div>
            <span className="stat-label">Currently Serving</span>
            <span className="stat-value">{servingCount} Tokens</span>
          </div>
        </div>

        <div className="staff-stat-card border-amber">
          <div className="stat-icon-wrapper amber">
            <Users size={20} />
          </div>
          <div>
            <span className="stat-label">Total Waiting</span>
            <span className="stat-value">{totalWaiting} Tokens</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-banner flex-center">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading && !counters.length ? (
        <div className="loading-state flex-center">
          <RefreshCw className="spin" size={24} />
          <span>Loading Counter Controls...</span>
        </div>
      ) : (
        <>
          {/* Counters Grid */}
          <div className="section-label">
            <Sparkles size={18} className="text-indigo" />
            <span>Counter Control Terminals</span>
          </div>

          <div className="counter-cards-grid">
            {counters.map((counter) => {
              const isCallLoading = actionLoading === `call-${counter._id}`;
              const isCompleteLoading = actionLoading === `complete-${counter._id}`;
              const servingToken = counter.currentServingToken;

              return (
                <div key={counter._id} className={`counter-card ${servingToken ? 'has-serving' : ''}`}>
                  <div className="counter-card-header">
                    <h3 className="counter-name">{counter.name}</h3>
                    <span className={`status-pill ${counter.isOpen ? 'open' : 'closed'}`}>
                      <span className={`pill-dot ${counter.isOpen ? 'green' : 'red'}`} />
                      {counter.isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  <div className="serving-display-box">
                    <span className="serving-label">CURRENTLY SERVING</span>
                    <div className="serving-token-number">
                      {servingToken ? (
                        <span className="token-text pulse-glow">{servingToken.tokenNumber}</span>
                      ) : (
                        <span className="none-text">VACANT</span>
                      )}
                    </div>
                  </div>

                  <div className="counter-metrics">
                    <div className="metric-box">
                      <span className="metric-label">Waiting in Queue</span>
                      <span className="metric-value">{counter.currentQueueCount}</span>
                    </div>
                    <div className="metric-box">
                      <span className="metric-label">Status</span>
                      <span className="metric-value highlight">
                        {servingToken ? 'In Service' : counter.isOpen ? 'Ready' : 'Offline'}
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
                      <Megaphone size={16} />
                      <span>{isCallLoading ? 'Calling...' : 'Call Next'}</span>
                    </button>

                    <button
                      type="button"
                      className="btn-action btn-complete"
                      onClick={() => handleComplete(counter._id)}
                      disabled={isCallLoading || isCompleteLoading || !servingToken}
                    >
                      <CheckCircle size={16} />
                      <span>{isCompleteLoading ? 'Completing...' : 'Complete'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Waiting Queue List */}
          <div className="waiting-queue-section">
            <div className="waiting-queue-header">
              <div className="queue-header-title">
                <Clock size={20} className="text-indigo" />
                <h3>Waiting Queue Ledger</h3>
              </div>

              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search token number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {Object.keys(queueGrouped).length === 0 ? (
              <p className="no-tokens-msg">No active queues found.</p>
            ) : (
              Object.entries(queueGrouped).map(([counterName, tokens]) => {
                const filteredTokens = (tokens || []).filter((t) =>
                  t.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase())
                );

                return (
                  <div key={counterName} className="counter-queue-group">
                    <div className="counter-group-banner">
                      <span className="group-title">{counterName}</span>
                      <span className="group-count">{tokens.length} waiting</span>
                    </div>

                    {filteredTokens.length === 0 ? (
                      <p className="no-tokens-msg">No matching tokens waiting for {counterName}</p>
                    ) : (
                      <div className="table-responsive">
                        <table className="queue-table">
                          <thead>
                            <tr>
                              <th>Queue Position</th>
                              <th>Token Number</th>
                              <th>Status</th>
                              <th>Issued Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTokens.map((token, index) => (
                              <tr key={token._id} className="table-row-hover">
                                <td className="position-cell">#{index + 1}</td>
                                <td className="token-cell">{token.tokenNumber}</td>
                                <td>
                                  <span className="status-tag waiting">
                                    <Clock size={12} /> {token.status}
                                  </span>
                                </td>
                                <td>{new Date(token.createdAt).toLocaleTimeString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StaffDashboard;
