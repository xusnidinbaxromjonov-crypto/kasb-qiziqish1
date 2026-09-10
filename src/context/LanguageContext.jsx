import React, { createContext, useState, useContext } from 'react';
import uz from '../translations/uz';
import ru from '../translations/ru';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [langCode, setLangCode] = useState('uz'); // 'uz' or 'ru'

  const t = langCode === 'uz' ? uz : ru;

  return (
    <LanguageContext.Provider value={{ langCode, setLangCode, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
