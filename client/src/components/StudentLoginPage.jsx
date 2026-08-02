import React, { useState } from 'react';
import { UserCheck, Hash, User, ArrowRight, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';
import { soundFX } from '../utils/audio';

function StudentLoginPage({ onLogin, onSwitchToStaff }) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError('Please enter your Student Roll No / Student ID.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your Full Name.');
      return;
    }

    setError('');
    soundFX.playSuccess();
    onLogin({
      studentId: studentId.trim(),
      name: name.trim(),
    });
  };

  const handleQuickDemo = (demoId, demoName) => {
    setStudentId(demoId);
    setName(demoName);
    soundFX.playClick();
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-card">
        {/* Header Badge */}
        <div className="login-header">
          <div className="login-badge-icon student-badge-glow">
            <GraduationCap size={32} className="text-indigo" />
          </div>
          <h2 className="login-title">Student Access Portal</h2>
          <p className="login-subtitle">
            Enter your credentials to access campus service queues and receive live token updates.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="login-error-banner animate-fade-in">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="studentId">
              <Hash size={16} className="input-label-icon" />
              Student Roll No / Student ID <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="studentId"
                type="text"
                placeholder="e.g. STU-2024-042 or 21BCE1042"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="studentName">
              <User size={16} className="input-label-icon" />
              Student Name <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="studentName"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn student-submit">
            <span>Sign In to Student Portal</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Fill Options */}
        <div className="quick-demo-section">
          <p className="quick-demo-title">⚡ Quick Demo Profiles:</p>
          <div className="quick-demo-chips">
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleQuickDemo('STU-2026-101', 'Sophia Martinez')}
            >
              🎓 Sophia (STU-101)
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => handleQuickDemo('STU-2026-204', 'Liam Johnson')}
            >
              🎓 Liam (STU-204)
            </button>
          </div>
        </div>

        {/* Footer switch to Staff Login */}
        <div className="login-switch-footer">
          <span>Are you a faculty or staff member?</span>
          <button type="button" className="switch-link-btn" onClick={onSwitchToStaff}>
            <ShieldCheck size={16} />
            <span>Go to Staff Login Portal →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentLoginPage;
