import React, { useState } from 'react';
import { UserCheck, Hash, User, ArrowRight, ShieldCheck, Sparkles, GraduationCap, Mail, Building, UserPlus, LogIn } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

function StudentLoginPage({ onLogin, onSwitchToStaff }) {
  const { t } = useLanguage();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!studentId.trim()) {
      setError(t('errorEnterRoll'));
      return;
    }
    if (!name.trim()) {
      setError(t('errorEnterName'));
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'signup') {
        const res = await fetch('/api/students/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentId.trim(),
            name: name.trim(),
            email: email.trim(),
            department: department.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Registration failed');
        }

        soundFX.playSuccess();
        setSuccessMsg(data.message || 'Registration successful!');
        setTimeout(() => {
          onLogin(data.student);
        }, 600);
      } else {
        const res = await fetch('/api/students/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: studentId.trim(),
            name: name.trim(),
          }),
        });

        const data = await res.json();
        soundFX.playSuccess();
        onLogin(data.student || {
          studentId: studentId.trim(),
          name: name.trim(),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = (demoId, demoName) => {
    setMode('signin');
    setStudentId(demoId);
    setName(demoName);
    soundFX.playClick();
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-card">
        {/* Mode Toggle Switch Header */}
        <div className="auth-tab-group" style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); soundFX.playClick(); }}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'signin' ? 'var(--primary-accent, #6366f1)' : 'transparent',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <LogIn size={16} />
            <span>{t('signInTab')}</span>
          </button>

          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); soundFX.playClick(); }}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'signup' ? 'var(--primary-accent, #6366f1)' : 'transparent',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
            }}
          >
            <UserPlus size={16} />
            <span>{t('signUpTab')}</span>
          </button>
        </div>

        {/* Header Badge */}
        <div className="login-header">
          <div className="login-badge-icon student-badge-glow">
            <GraduationCap size={32} className="text-indigo" />
          </div>
          <h2 className="login-title">
            {mode === 'signup' ? t('studentSignUpTitle') : t('studentAccessPortal')}
          </h2>
          <p className="login-subtitle">
            {mode === 'signup' ? t('studentSignUpSub') : t('studentLoginSub')}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="login-error-banner animate-fade-in">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Success Notification */}
        {successMsg && (
          <div className="login-success-banner animate-fade-in" style={{ padding: '0.75rem 1rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.4)', borderRadius: '10px', color: '#34d399', marginBottom: '1rem' }}>
            <span>✅ {successMsg}</span>
          </div>
        )}

        {/* Login / Sign Up Form */}
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
                required
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
                required
              />
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div className="input-group animate-fade-in">
                <label htmlFor="studentEmail">
                  <Mail size={16} className="input-label-icon" />
                  {t('emailInputLabel')}
                </label>
                <div className="input-wrapper">
                  <input
                    id="studentEmail"
                    type="email"
                    placeholder={t('emailInputPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group animate-fade-in">
                <label htmlFor="studentDept">
                  <Building size={16} className="input-label-icon" />
                  {t('deptInputLabel')}
                </label>
                <div className="input-wrapper">
                  <input
                    id="studentDept"
                    type="text"
                    placeholder={t('deptInputPlaceholder')}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="login-submit-btn student-submit" disabled={isSubmitting}>
            <span>{mode === 'signup' ? t('registerBtn') : t('signInStudentPortal')}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Fill Options */}
        {mode === 'signin' && (
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
        )}

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
