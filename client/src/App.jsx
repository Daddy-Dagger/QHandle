import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  CreditCard, 
  FileText, 
  BookOpen, 
  Building, 
  Laptop, 
  Search, 
  Sparkles, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Tv, 
  UserCheck, 
  LayoutDashboard, 
  Volume2, 
  VolumeX, 
  Zap 
} from 'lucide-react';
import StaffDashboard from './components/StaffDashboard';
import TVDisplay from './components/TVDisplay';
import TokenCard from './components/TokenCard';
import BackgroundCanvas from './components/BackgroundCanvas';
import { soundFX } from './utils/audio';
import './App.css';

const DEPT_CONFIG = {
  'Scholarship Office': {
    icon: GraduationCap,
    accent: 'indigo',
    color: '#818cf8',
    gradient: 'from-indigo-500 to-purple-600',
    description: 'Scholarship applications, fee concessions & financial aid',
  },
  'Accounts Office': {
    icon: CreditCard,
    accent: 'emerald',
    color: '#34d399',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Fee payment, tuition receipts, dues & financial clearances',
  },
  'Examination Cell': {
    icon: FileText,
    accent: 'amber',
    color: '#fbbf24',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Hall tickets, grade sheets, transcripts & re-evaluations',
  },
  'Library': {
    icon: BookOpen,
    accent: 'cyan',
    color: '#38bdf8',
    gradient: 'from-sky-500 to-blue-600',
    description: 'Book issue/returns, membership cards & research access',
  },
  'Hostel Office': {
    icon: Building,
    accent: 'rose',
    color: '#fb7185',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Room allocations, hostel fees & maintenance requests',
  },
  'IT & Tech Support': {
    icon: Laptop,
    accent: 'purple',
    color: '#c084fc',
    gradient: 'from-purple-500 to-indigo-600',
    description: 'Wi-Fi credentials, portal login, LMS access & laptop support',
  },
};

function App() {
  const [activeTab, setActiveTab] = useState('student');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedToken, setSelectedToken] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [soundMuted, setSoundMuted] = useState(false);

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
      soundFX.playClick();
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
        departmentId: dept._id,
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
    soundFX.playClick();
    setSelectedToken(null);
  };

  const handleRefreshPosition = async () => {
    if (!selectedToken) return;
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (e) {
      // Ignore
    }
  };

  const toggleSound = () => {
    const nextState = !soundMuted;
    setSoundMuted(nextState);
    soundFX.enabled = !nextState;
    soundFX.playClick();
  };

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Background Interactive Ambient Canvas */}
      <BackgroundCanvas />

      {/* Navbar */}
      <header className="navbar glass-nav">
        <div className="logo-container" onClick={() => setActiveTab('student')} style={{ cursor: 'pointer' }}>
          <div className="logo-badge glow-pulse">
            <Zap size={20} className="logo-icon" />
          </div>
          <div className="logo-text-group">
            <span className="logo-text">QHandle</span>
            <span className="logo-tagline">SMART QUEUE</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('student');
            }}
          >
            <UserCheck size={16} />
            <span>Student Queue</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('staff');
            }}
          >
            <LayoutDashboard size={16} />
            <span>Staff Portal</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'tv' ? 'active' : ''}`}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('tv');
            }}
          >
            <Tv size={16} />
            <span>Lobby TV View</span>
          </button>

          <button
            type="button"
            className="sound-toggle-btn"
            onClick={toggleSound}
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-emerald" />}
          </button>
        </nav>
      </header>

      {/* Main Section */}
      <main className="hero-section">
        {activeTab === 'student' && (
          <>
            {!selectedToken ? (
              <div className="student-portal-wrapper animate-fade-in">
                {/* Hero Headline */}
                <div className="hero-badge">
                  <Sparkles size={14} className="text-amber" />
                  <span>Next-Gen Campus Queue System</span>
                </div>

                <h1 className="title shimmer-text">
                  Queue Less. <br />
                  <span className="gradient-highlight">Achieve More.</span>
                </h1>

                <p className="subtitle">
                  Instant digital queue tokens for all major campus service departments.
                </p>

                {/* Campus Live Metrics Bar */}
                <div className="hero-stats-strip glass-card">
                  <div className="stat-pill">
                    <Activity size={18} className="text-emerald" />
                    <div>
                      <span className="pill-val">{departments.length || 6} Active</span>
                      <span className="pill-lbl">Departments</span>
                    </div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-pill">
                    <Clock size={18} className="text-sky" />
                    <div>
                      <span className="pill-val">~3 Mins</span>
                      <span className="pill-lbl">Avg Wait Time</span>
                    </div>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-pill">
                    <ShieldCheck size={18} className="text-indigo" />
                    <div>
                      <span className="pill-val">Realtime</span>
                      <span className="pill-lbl">Token Dispatch</span>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="search-filter-wrapper">
                  <div className="search-input-box glass-card">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search department (e.g. Scholarship, Accounts, Exam)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="error-banner animate-fade-in">
                    <p>⚠️ {error}</p>
                  </div>
                )}

                {/* Departments Grid */}
                {loading ? (
                  <div className="loading-state glass-card">
                    <div className="spinner"></div>
                    <p>Loading Department Services...</p>
                  </div>
                ) : (
                  <div className="dept-grid">
                    {filteredDepartments.map((dept) => {
                      const cfg = DEPT_CONFIG[dept.name] || {
                        icon: Building,
                        accent: 'indigo',
                        color: '#818cf8',
                        description: 'Campus services office',
                      };
                      const IconComponent = cfg.icon;
                      const isJoining = joiningId === dept._id;

                      return (
                        <div
                          key={dept._id}
                          className={`dept-card glass-card accent-${cfg.accent} ${isJoining ? 'joining' : ''}`}
                          onClick={() => !isJoining && handleJoinQueue(dept)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleJoinQueue(dept)}
                        >
                          <div className="dept-card-top">
                            <div className={`icon-avatar icon-bg-${cfg.accent}`}>
                              <IconComponent size={24} style={{ color: cfg.color }} />
                            </div>
                            <span className="dept-code-tag">{dept.code}</span>
                          </div>

                          <div className="dept-card-body">
                            <h3 className="dept-name">{dept.name}</h3>
                            <p className="dept-desc">{cfg.description}</p>
                          </div>

                          <div className="dept-card-footer">
                            <button className="btn-join-glow" type="button" disabled={isJoining}>
                              {isJoining ? (
                                <span className="btn-loading">Issuing Token...</span>
                              ) : (
                                <span>Get Queue Token →</span>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Token Display Ticket Pass */
              <TokenCard
                tokenData={selectedToken}
                onReset={handleResetToken}
                onRefresh={handleRefreshPosition}
              />
            )}
          </>
        )}

        {activeTab === 'staff' && (
          <StaffDashboard departments={departments} />
        )}

        {activeTab === 'tv' && (
          <TVDisplay departments={departments} />
        )}
      </main>

      {/* Footer */}
      <footer className="footer glass-footer">
        <p>QHandle Campus Network &copy; {new Date().getFullYear()} — Powered by Smart Queue Engine</p>
      </footer>
    </div>
  );
}

export default App;
