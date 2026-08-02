import React, { useState } from 'react';
import { Shield, Building2, User, IdCard, ArrowRight, UserCheck, Sparkles, LayoutDashboard } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

function StaffLoginPage({ departments, onLogin, onSwitchToStudent }) {
  const { t, getTranslatedDept } = useLanguage();
  const [staffId, setStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffId.trim()) {
      setError(t('errorEnterStaffId'));
      return;
    }
    if (!department) {
      setError(t('errorSelectDepartment'));
      return;
    }
    if (!name.trim()) {
      setError(t('errorEnterName'));
      return;
    }

    setError('');
    soundFX.playSuccess();
    onLogin({
      staffId: staffId.trim(),
      department: department,
      name: name.trim(),
    });
  };

  const handleQuickDemo = (idNo, deptName, staffName) => {
    setStaffId(idNo);
    setDepartment(deptName);
    setName(staffName);
    soundFX.playClick();
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card glass-card staff-card-border">
        {/* Header Badge */}
        <div className="login-header">
          <div className="login-badge-icon staff-badge-glow">
            <LayoutDashboard size={32} className="text-emerald" />
          </div>
          <h2 className="login-title">{t('staffFacultyPortal')}</h2>
          <p className="login-subtitle">
            {t('staffLoginSub')}
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="login-error-banner animate-fade-in">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Staff ID No */}
          <div className="input-group">
            <label htmlFor="staffId">
              <IdCard size={16} className="input-label-icon" />
              {t('staffIdInputLabel')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="staffId"
                type="text"
                placeholder={t('staffIdInputPlaceholder')}
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Department Selection */}
          <div className="input-group">
            <label htmlFor="staffDepartment">
              <Building2 size={16} className="input-label-icon" />
              {t('departmentLabel')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <select
                id="staffDepartment"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="login-select"
              >
                <option value="">{t('selectDepartmentPlaceholder')}</option>
                {departments && departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {getTranslatedDept(dept.name).name} ({dept.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Scholarship Office">{getTranslatedDept('Scholarship Office').name}</option>
                    <option value="Accounts Office">{getTranslatedDept('Accounts Office').name}</option>
                    <option value="Examination Cell">{getTranslatedDept('Examination Cell').name}</option>
                    <option value="Library">{getTranslatedDept('Library').name}</option>
                    <option value="Hostel Office">{getTranslatedDept('Hostel Office').name}</option>
                    <option value="IT & Tech Support">{getTranslatedDept('IT & Tech Support').name}</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Staff Name */}
          <div className="input-group">
            <label htmlFor="staffName">
              <User size={16} className="input-label-icon" />
              {t('staffNameInputLabel')} <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="staffName"
                type="text"
                placeholder={t('staffNameInputPlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn staff-submit">
            <span>{t('signInStaffPortal')}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Fill Options */}
        <div className="quick-demo-section">
          <p className="quick-demo-title">{t('quickDemoProfiles')}</p>
          <div className="quick-demo-chips">
            <button
              type="button"
              className="demo-chip staff-chip"
              onClick={() => handleQuickDemo('STF-501', 'Accounts Office', 'Prof. David Miller')}
            >
              🛡️ Prof. David (Accounts)
            </button>
            <button
              type="button"
              className="demo-chip staff-chip"
              onClick={() => handleQuickDemo('STF-809', 'Scholarship Office', 'Dr. Elena Vance')}
            >
              🛡️ Dr. Elena (Scholarship)
            </button>
          </div>
        </div>

        {/* Footer switch to Student Login */}
        <div className="login-switch-footer">
          <span>{t('areYouStudentLookingToken')}</span>
          <button type="button" className="switch-link-btn" onClick={onSwitchToStudent}>
            <UserCheck size={16} />
            <span>{t('goToStudentLogin')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffLoginPage;
