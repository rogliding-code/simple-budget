import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';

const DEFAULT: AppSettings = { isDarkMode: false, language: 'es', currencySymbol: 'Q' };

export const SettingsContext = createContext<any>(null);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('sb_settings');
    return saved ? JSON.parse(saved) : DEFAULT;
  });

  useEffect(() => {
    localStorage.setItem('sb_settings', JSON.stringify(settings));
    document.documentElement.classList.toggle('dark', settings.isDarkMode);
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ ...settings, updateSettings: (n:any) => setSettings(p => ({...p, ...n})) }}>
      {children}
    </SettingsContext.Provider>
  );
};