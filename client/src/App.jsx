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
  Zap,
  LogOut,
  User,
  LogIn
} from 'lucide-react';
import StudentLoginPage from './components/StudentLoginPage';
import StaffLoginPage from './components/StaffLoginPage';
import StaffDashboard from './components/StaffDashboard';
import TVDisplay from './components/TVDisplay';
import TokenCard from './components/TokenCard';
import BackgroundCanvas from './components/BackgroundCanvas';
import LanguageSelector from './components/LanguageSelector';
import { soundFX } from './utils/audio';
import { useLanguage } from './context/LanguageContext';
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
  const { t, getTranslatedDept } = useLanguage();

  const [studentSession, setStudentSession] = useState(() => {
    try {
      const saved = localStorage.getItem('qhandle_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [staffSession, setStaffSession] = useState(() => {
    try {
      const saved = localStorage.getItem('qhandle_staff_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

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

  const handleStudentLogin = (sessionData) => {
    setStudentSession(sessionData);
    localStorage.setItem('qhandle_student_session', JSON.stringify(sessionData));
    setActiveTab('student');
  };

  const handleStaffLogin = (sessionData) => {
    setStaffSession(sessionData);
    localStorage.setItem('qhandle_staff_session', JSON.stringify(sessionData));
    setActiveTab('staff');
  };

  const handleStudentLogout = () => {
    soundFX.playClick();
    setStudentSession(null);
    localStorage.removeItem('qhandle_student_session');
    setSelectedToken(null);
  };

  const handleStaffLogout = () => {
    soundFX.playClick();
    setStaffSession(null);
    localStorage.removeItem('qhandle_staff_session');
  };

  const handleJoinQueue = async (dept) => {
    try {
      soundFX.playClick();
      setJoiningId(dept._id);
      setError(null);
      const res = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: dept._id,
          studentName: studentSession?.name || 'Guest Student',
          studentId: studentSession?.studentId || 'N/A',
        }),
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
        studentName: data.studentName,
        studentId: data.studentId,
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

  const filteredDepartments = departments.filter((d) => {
    const translated = getTranslatedDept(d.name, '');
    const searchLower = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(searchLower) ||
      translated.name.toLowerCase().includes(searchLower) ||
      d.code.toLowerCase().includes(searchLower)
    );
  });

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
            <span className="logo-tagline">{t('smartQueue')}</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            type="button"
            className={`nav-btn ${activeTab === 'student' || activeTab === 'student-login' ? 'active' : ''}`}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('student');
            }}
          >
            <UserCheck size={16} />
            <span>{t('studentPortal')}</span>
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === 'staff' || activeTab === 'staff-login' ? 'active' : ''}`}
            onClick={() => {
              soundFX.playClick();
              setActiveTab('staff');
            }}
          >
            <LayoutDashboard size={16} />
            <span>{t('staffPortal')}</span>
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
            <span>{t('tvView')}</span>
          </button>

          {/* Multi-Language Selector Dropdown */}
          <LanguageSelector />

          {/* Audio Toggle */}
          <button
            type="button"
            className="sound-toggle-btn"
            onClick={toggleSound}
            title={soundMuted ? t('soundUnmute') : t('soundMute')}
          >
            {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-emerald" />}
          </button>
        </nav>
      </header>

      {/* Main Section */}
      <main className="hero-section">
        {/* STUDENT PORTAL TAB */}
        {activeTab === 'student' && (
          !studentSession ? (
            <StudentLoginPage
              onLogin={handleStudentLogin}
              onSwitchToStaff={() => {
                soundFX.playClick();
                setActiveTab('staff');
              }}
            />
          ) : (
            <>
              {!selectedToken ? (
                <div className="student-portal-wrapper animate-fade-in">
                  {/* Logged in Student Profile Bar */}
                  <div className="student-user-bar glass-card">
                    <div className="user-info-group">
                      <div className="user-avatar-circle">
                        <GraduationCap size={20} />
                      </div>
                      <div className="user-details">
                        <span className="user-name-text">{t('welcomeUser', { name: studentSession.name })}</span>
                        <span className="user-id-text">{t('studentRollId')} <strong>{studentSession.studentId}</strong></span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="logout-icon-btn"
                      onClick={handleStudentLogout}
                      title={t('logOut')}
                    >
                      <LogOut size={14} />
                      <span>{t('logOut')}</span>
                    </button>
                  </div>

                  {/* Hero Headline */}
                  <div className="hero-badge">
                    <Sparkles size={14} className="text-amber" />
                    <span>{t('nextGenSystem')}</span>
                  </div>

                  <h1 className="title shimmer-text">
                    {t('heroTitleLine1')} <br />
                    <span className="gradient-highlight">{t('heroTitleLine2')}</span>
                  </h1>

                  <p className="subtitle">
                    {t('heroSubtitle')}
                  </p>

                  {/* Campus Live Metrics Bar */}
                  <div className="hero-stats-strip glass-card">
                    <div className="stat-pill">
                      <Activity size={18} className="text-emerald" />
                      <div>
                        <span className="pill-val">{departments.length || 6} {t('openStatus')}</span>
                        <span className="pill-lbl">{t('activeDepartments')}</span>
                      </div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-pill">
                      <Clock size={18} className="text-sky" />
                      <div>
                        <span className="pill-val">~3 Mins</span>
                        <span className="pill-lbl">{t('avgWaitTime')}</span>
                      </div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-pill">
                      <ShieldCheck size={18} className="text-indigo" />
                      <div>
                        <span className="pill-val">{t('openStatus')}</span>
                        <span className="pill-lbl">{t('verifiedTicket')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="search-filter-wrapper">
                    <div className="search-input-box glass-card">
                      <Search size={18} className="search-icon" />
                      <input
                        type="text"
                        placeholder={t('searchDeptPlaceholder')}
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
                      <p>{t('loadingDepartments')}</p>
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
                        const translatedDept = getTranslatedDept(dept.name, cfg.description);
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
                              <h3 className="dept-name">{translatedDept.name}</h3>
                              <p className="dept-desc">{translatedDept.desc}</p>
                            </div>

                            <div className="dept-card-footer">
                              <button className="btn-join-glow" type="button" disabled={isJoining}>
                                {isJoining ? (
                                  <span className="btn-loading">{t('issuingToken')}</span>
                                ) : (
                                  <span>{t('getQueueToken')}</span>
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
          )
        )}

        {/* STAFF PORTAL TAB */}
        {activeTab === 'staff' && (
          !staffSession ? (
            <StaffLoginPage
              departments={departments}
              onLogin={handleStaffLogin}
              onSwitchToStudent={() => {
                soundFX.playClick();
                setActiveTab('student');
              }}
            />
          ) : (
            <StaffDashboard
              departments={departments}
              staffSession={staffSession}
              onLogoutStaff={handleStaffLogout}
            />
          )
        )}

        {/* TV DISPLAY TAB */}
        {activeTab === 'tv' && (
          <TVDisplay departments={departments} />
        )}
      </main>

      {/* Footer */}
      <footer className="footer glass-footer">
        <p>{t('footerCopy', { year: new Date().getFullYear() })}</p>
      </footer>
    </div>
  );
}

export default App;
