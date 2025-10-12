'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'SAR' | 'USD' | 'EUR' | 'AED';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  getCurrencyName: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Currency configurations
const currencyConfig = {
  SAR: {
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    locale: 'ar-SA',
    position: 'after' as const
  },
  USD: {
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    position: 'before' as const
  },
  EUR: {
    symbol: '€',
    name: 'Euro',
    locale: 'en-EU',
    position: 'before' as const
  },
  AED: {
    symbol: 'د.إ',
    name: 'UAE Dirham',
    locale: 'ar-AE',
    position: 'after' as const
  }
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [currency, setCurrencyState] = useState<Currency>('SAR');

  // Load currency from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency && currencyConfig[savedCurrency]) {
      setCurrencyState(savedCurrency);
    }
  }, []);

  // Listen for settings changes
  useEffect(() => {
    const handleSettingsChange = (event: CustomEvent) => {
      if (event.detail.type === 'system' && event.detail.settings.currency) {
        setCurrencyState(event.detail.settings.currency);
      }
    };

    window.addEventListener('settingsChanged', handleSettingsChange as EventListener);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
    
    // Broadcast currency change to other components
    window.dispatchEvent(new CustomEvent('currencyChanged', { 
      detail: { currency: newCurrency } 
    }));
  };

  const formatCurrency = (amount: number): string => {
    const config = currencyConfig[currency];
    const formattedAmount = new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);

    if (config.position === 'before') {
      return `${config.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${config.symbol}`;
    }
  };

  const getCurrencySymbol = (): string => {
    return currencyConfig[currency].symbol;
  };

  const getCurrencyName = (): string => {
    return currencyConfig[currency].name;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatCurrency,
    getCurrencySymbol,
    getCurrencyName,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

// Hook for listening to currency changes
export function useCurrencyListener(callback: (currency: Currency) => void) {
  useEffect(() => {
    const handleCurrencyChange = (event: CustomEvent) => {
      callback(event.detail.currency);
    };

    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, [callback]);
}
