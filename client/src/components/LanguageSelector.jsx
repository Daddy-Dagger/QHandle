import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { soundFX } from '../utils/audio';

function LanguageSelector({ compact = false }) {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode) => {
    soundFX.playClick();
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="lang-selector-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`lang-selector-btn ${isOpen ? 'active' : ''} ${compact ? 'compact' : ''}`}
        onClick={() => {
          soundFX.playClick();
          setIsOpen(!isOpen);
        }}
        title="Change Language / भाषा बदलें / ਭਾਸ਼ਾ ਬਦਲੋ"
      >
        <Globe size={18} className="lang-globe-icon" />
        <span className="lang-flag">{currentLangObj.flag}</span>
        {!compact && <span className="lang-name">{currentLangObj.nativeName}</span>}
        <ChevronDown size={14} className={`lang-chevron ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu animate-pop-in">
          <div className="lang-dropdown-header">
            <span>Select Language / भाषा चुनें</span>
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                className={`lang-option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                <span className="option-flag">{lang.flag}</span>
                <div className="option-label-group">
                  <span className="option-native">{lang.nativeName}</span>
                  <span className="option-sub">{lang.name}</span>
                </div>
                {isSelected && <Check size={16} className="text-emerald text-selected" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
