import React, { useState } from 'react';
import { UserCheck, Hash, User, ArrowRight, ShieldCheck, Sparkles, GraduationCap } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

function StudentLoginPage({ onLogin, onSwitchToStaff }) {
  const { t } = useLanguage();
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId.trim()) {
      setError(t('errorEnterRoll'));
      return;
    }
    if (!name.trim()) {
      setError(t('errorEnterName'));
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
          <h2 className="login-title">{t('studentAccessPortal')}</h2>
          <p className="login-subtitle">
            {t('studentLoginSub')}
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
              {t('studentRollInputLabel')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="studentId"
                type="text"
                placeholder={t('studentRollInputPlaceholder')}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="studentName">
              <User size={16} className="input-label-icon" />
              {t('studentNameInputLabel')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="studentName"
                type="text"
                placeholder={t('studentNameInputPlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn student-submit">
            <span>{t('signInStudentPortal')}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Fill Options */}
        <div className="quick-demo-section">
          <p className="quick-demo-title">{t('quickDemoProfiles')}</p>
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
          <span>{t('areYouFacultyStaff')}</span>
          <button type="button" className="switch-link-btn" onClick={onSwitchToStaff}>
            <ShieldCheck size={16} />
            <span>{t('goToStaffLogin')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentLoginPage;
