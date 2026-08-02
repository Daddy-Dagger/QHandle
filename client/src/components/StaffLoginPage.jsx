import React, { useState } from 'react';
import { Shield, Building2, User, IdCard, ArrowRight, UserCheck, Sparkles, LayoutDashboard } from 'lucide-react';
import { soundFX } from '../utils/audio';

function StaffLoginPage({ departments, onLogin, onSwitchToStudent }) {
  const [staffId, setStaffId] = useState('');
  const [department, setDepartment] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staffId.trim()) {
      setError('Please enter your Staff ID No.');
      return;
    }
    if (!department) {
      setError('Please select your Department.');
      return;
    }
    if (!name.trim()) {
      setError('Please enter your Full Name.');
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
          <h2 className="login-title">Staff & Faculty Portal</h2>
          <p className="login-subtitle">
            Sign in with your Staff ID, Department, and Name to manage counter queues.
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
              Staff ID No <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="staffId"
                type="text"
                placeholder="e.g. STF-5042 or EMP-880"
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
              Department <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <select
                id="staffDepartment"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="login-select"
              >
                <option value="">-- Select Your Department --</option>
                {departments && departments.length > 0 ? (
                  departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name} ({dept.code})
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Scholarship Office">Scholarship Office</option>
                    <option value="Accounts Office">Accounts Office</option>
                    <option value="Examination Cell">Examination Cell</option>
                    <option value="Library">Library</option>
                    <option value="Hostel Office">Hostel Office</option>
                    <option value="IT & Tech Support">IT & Tech Support</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Staff Name */}
          <div className="input-group">
            <label htmlFor="staffName">
              <User size={16} className="input-label-icon" />
              Staff Name <span className="required-star">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="staffName"
                type="text"
                placeholder="e.g. Dr. Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

          <button type="submit" className="login-submit-btn staff-submit">
            <span>Sign In to Staff Portal</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Fill Options */}
        <div className="quick-demo-section">
          <p className="quick-demo-title">⚡ Quick Demo Profiles:</p>
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
          <span>Are you a student looking for queue tokens?</span>
          <button type="button" className="switch-link-btn" onClick={onSwitchToStudent}>
            <UserCheck size={16} />
            <span>Go to Student Login Portal →</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffLoginPage;
