import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'es' | 'en' | 'pt';

interface I18nContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
  availableLanguages: { code: Language; name: string; flag: string }[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const availableLanguages = [
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' }
];

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('i18nextLng') || 'es';
    return (saved as Language) || 'es';
  });

  useEffect(() => {
    // Sincronizar con i18n
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        availableLanguages
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

