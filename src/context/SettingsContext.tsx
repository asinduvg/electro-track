import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'small' | 'medium' | 'large';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved as FontSize) || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg');
    switch (fontSize) {
      case 'small':
        document.documentElement.classList.add('text-sm');
        break;
      case 'medium':
        document.documentElement.classList.add('text-base');
        break;
      case 'large':
        document.documentElement.classList.add('text-lg');
        break;
    }
  }, [fontSize]);

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </SettingsContext.Provider>
  );
};