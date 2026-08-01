import React from 'react';
import './App.css';

function App() {
  const departments = [
    { name: 'Scholarship', icon: '🎓' },
    { name: 'Accounts', icon: '💳' },
    { name: 'Examination Cell', icon: '📝' },
    { name: 'Library', icon: '📚' },
    { name: 'Hostel Office', icon: '🏢' },
  ];

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
          QHandle helps colleges manage queues across departments such as Scholarship, Accounts, Examination Cell, Library, and Hostel Office.
        </p>

        <div className="cta-container">
          <button className="btn-primary" type="button">
            Get Started
          </button>
        </div>

        <div className="dept-grid">
          {departments.map((dept) => (
            <div key={dept.name} className="dept-card">
              <span className="dept-icon">{dept.icon}</span>
              <span className="dept-name">{dept.name}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} QHandle. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
