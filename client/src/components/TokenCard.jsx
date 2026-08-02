import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  Printer, 
  RefreshCw, 
  ArrowLeft, 
  ShieldCheck, 
  TrendingUp 
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { useLanguage } from '../context/LanguageContext';

const TokenCard = ({ tokenData, onReset, onRefresh }) => {
  const { t, getTranslatedDept } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Sound FX & Confetti on issue
    soundFX.playSuccess();
    
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#8b5cf6', '#38bdf8', '#34d399']
    });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenData.tokenNumber);
    setCopied(true);
    soundFX.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    soundFX.playClick();
    window.print();
  };

  const handleManualRefresh = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    soundFX.playClick();
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const estWait = (tokenData.position - 1) * 3; // Approx 3 mins per person
  const translatedDeptName = getTranslatedDept(tokenData.departmentName).name;

  return (
    <div className="token-card-wrapper animate-fade-in">
      <div className="token-card-glow-bg" />
      <div className="token-card">
        {/* Card Header */}
        <div className="token-card-top">
          <div className="token-status-pill">
            <span className="pulse-dot active"></span>
            <span>{t('tokenActive')}</span>
          </div>
          <div className="verified-stamp">
            <ShieldCheck size={14} />
            <span>{t('qhandleVerified')}</span>
          </div>
        </div>

        <div className="token-dept-title">
          <h3>{translatedDeptName}</h3>
          {tokenData.studentName && (
            <div className="token-student-info-chip" style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#a7f3d0' }}>
              <span>🎓 {t('issuedTo')} <strong>{tokenData.studentName}</strong> ({tokenData.studentId})</span>
            </div>
          )}
          <p className="token-timestamp">
            {t('issuedAt')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Main Display Ticket Box */}
        <div className="token-display-box">
          <span className="display-label">{t('yourTokenNumber')}</span>
          <div className="token-big-number">{tokenData.tokenNumber}</div>

          {/* Simulated barcode graphic */}
          <div className="barcode-strip">
            <div className="barcode-lines"></div>
            <span className="barcode-text">{t('passTag')}{tokenData.tokenNumber}</span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="token-metrics-grid">
          <div className="metric-tile">
            <div className="metric-icon sky">
              <MapPin size={18} />
            </div>
            <div className="metric-info">
              <span className="metric-title">{t('counter')}</span>
              <span className="metric-val">{tokenData.counter || t('assigning')}</span>
            </div>
          </div>

          <div className="metric-tile">
            <div className="metric-icon indigo">
              <TrendingUp size={18} />
            </div>
            <div className="metric-info">
              <span className="metric-title">{t('position')}</span>
              <span className="metric-val">#{tokenData.position}</span>
            </div>
          </div>

          <div className="metric-tile">
            <div className="metric-icon emerald">
              <Clock size={18} />
            </div>
            <div className="metric-info">
              <span className="metric-title">{t('estWait')}</span>
              <span className="metric-val">{estWait > 0 ? t('approxMins', { mins: estWait }) : t('nowNext')}</span>
            </div>
          </div>
        </div>

        {/* Queue Progress Bar */}
        <div className="progress-container">
          <div className="progress-header">
            <span>{t('peopleAhead')}</span>
            <span className="highlight-text">{t('studentsCountAhead', { count: Math.max(0, tokenData.position - 1) })}</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.max(10, Math.min(100, (1 / tokenData.position) * 100))}%` }}
            />
          </div>
        </div>

        {/* Quick Action Toolbar */}
        <div className="token-actions">
          <button 
            type="button" 
            className="action-btn secondary" 
            onClick={handleCopy}
            title={t('copyToken')}
          >
            {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            <span>{copied ? t('copied') : t('copyToken')}</span>
          </button>

          <button 
            type="button" 
            className="action-btn secondary" 
            onClick={handlePrint}
            title={t('printPass')}
          >
            <Printer size={16} />
            <span>{t('printPass')}</span>
          </button>

          <button 
            type="button" 
            className={`action-btn secondary ${isRefreshing ? 'spin' : ''}`} 
            onClick={handleManualRefresh}
            title={t('refreshPosition')}
          >
            <RefreshCw size={16} />
            <span>{t('refreshPosition')}</span>
          </button>
        </div>

        <button type="button" className="btn-primary-glow" onClick={() => { soundFX.playClick(); onReset(); }}>
          <ArrowLeft size={18} />
          <span>{t('joinAnotherQueue')}</span>
        </button>
      </div>
    </div>
  );
};

export default TokenCard;
