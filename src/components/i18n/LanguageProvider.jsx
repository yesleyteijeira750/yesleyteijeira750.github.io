import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { language: 'en', t: (key) => key, changeLanguage: () => {} };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // fallback to English
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object') fallback = fallback[fk];
          else return key;
        }
        return fallback || key;
      }
    }
    return value || key;
  };

  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};