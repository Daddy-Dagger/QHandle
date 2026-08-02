import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, departmentTranslations } from '../utils/translations';

const LanguageContext = createContext();

export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('qhandle_language');
      return saved && translations[saved] ? saved : 'en';
    } catch (e) {
      return 'en';
    }
  });

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem('qhandle_language', langCode);
      } catch (e) {
        // Ignore localStorage error
      }
    }
  };

  const t = (key, params = {}) => {
    const langDict = translations[language] || translations.en;
    let template = langDict[key] || translations.en[key] || key;

    Object.keys(params).forEach((paramKey) => {
      const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g');
      template = template.replace(regex, params[paramKey]);
    });

    return template;
  };

  const getTranslatedDept = (deptName, fallbackDesc = '') => {
    const lang = language;
    if (lang === 'en' || !departmentTranslations[deptName] || !departmentTranslations[deptName][lang]) {
      return { name: deptName, desc: fallbackDesc };
    }
    const translated = departmentTranslations[deptName][lang];
    return {
      name: translated.name || deptName,
      desc: translated.desc || fallbackDesc,
    };
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: AVAILABLE_LANGUAGES,
        getTranslatedDept,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
