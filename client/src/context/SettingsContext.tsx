import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'small' | 'medium' | 'large';
type Theme = 'light' | 'dark' | 'system';
type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
  timezone: string;
  setTimezone: (tz: string) => void;
  dateFormat: DateFormat;
  setDateFormat: (format: DateFormat) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
  lowStockThreshold: number;
  setLowStockThreshold: (threshold: number) => void;
  autoBackup: boolean;
  setAutoBackup: (enabled: boolean) => void;
  dataRetention: number;
  setDataRetention: (days: number) => void;
  saveSettings: () => void;
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
  // Initialize state from localStorage or default values
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('fontSize');
    return (saved as FontSize) || 'medium';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'light';
    }
    return 'light';
  });

  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem('companyName') || 'ElectroTrack Solutions';
  });

  const [timezone, setTimezone] = useState(() => {
    return localStorage.getItem('timezone') || 'America/New_York';
  });

  const [dateFormat, setDateFormat] = useState<DateFormat>(() => {
    return (localStorage.getItem('dateFormat') as DateFormat) || 'MM/DD/YYYY';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('currency') as Currency) || 'USD';
  });

  const [emailNotifications, setEmailNotifications] = useState(() => {
    return localStorage.getItem('emailNotifications') === 'true';
  });

  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    return parseInt(localStorage.getItem('lowStockThreshold') || '10');
  });

  const [autoBackup, setAutoBackup] = useState(() => {
    return localStorage.getItem('autoBackup') !== 'false';
  });

  const [dataRetention, setDataRetention] = useState(() => {
    return parseInt(localStorage.getItem('dataRetention') || '365');
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = () => {
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply font size on mount and when fontSize changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    root.classList.add(
      fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
    );
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Save other settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('companyName', companyName);
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('dateFormat', dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('emailNotifications', emailNotifications.toString());
  }, [emailNotifications]);

  useEffect(() => {
    localStorage.setItem('lowStockThreshold', lowStockThreshold.toString());
  }, [lowStockThreshold]);

  useEffect(() => {
    localStorage.setItem('autoBackup', autoBackup.toString());
  }, [autoBackup]);

  useEffect(() => {
    localStorage.setItem('dataRetention', dataRetention.toString());
  }, [dataRetention]);

  const saveSettings = () => {
    // Force save all settings - useful for manual save operations
    const settingsToSave = {
      fontSize,
      theme,
      companyName,
      timezone,
      dateFormat,
      currency,
      emailNotifications: emailNotifications.toString(),
      lowStockThreshold: lowStockThreshold.toString(),
      autoBackup: autoBackup.toString(),
      dataRetention: dataRetention.toString(),
    };

    Object.entries(settingsToSave).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    console.log('Settings saved successfully');
  };

  return (
    <SettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        theme,
        setTheme,
        companyName,
        setCompanyName,
        timezone,
        setTimezone,
        dateFormat,
        setDateFormat,
        currency,
        setCurrency,
        emailNotifications,
        setEmailNotifications,
        lowStockThreshold,
        setLowStockThreshold,
        autoBackup,
        setAutoBackup,
        dataRetention,
        setDataRetention,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
