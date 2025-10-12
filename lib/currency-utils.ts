// Currency utility functions for system-wide use

export type Currency = 'SAR' | 'USD' | 'EUR' | 'AED';

// Currency configurations
export const currencyConfig = {
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

/**
 * Format a number as currency based on the provided currency type
 */
export function formatCurrency(amount: number, currency: Currency = 'SAR'): string {
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
}

/**
 * Get currency symbol for a given currency type
 */
export function getCurrencySymbol(currency: Currency = 'SAR'): string {
  return currencyConfig[currency].symbol;
}

/**
 * Get currency name for a given currency type
 */
export function getCurrencyName(currency: Currency = 'SAR'): string {
  return currencyConfig[currency].name;
}

/**
 * Parse currency string back to number (removes currency symbols and formatting)
 */
export function parseCurrency(currencyString: string): number {
  // Remove all non-numeric characters except decimal point
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): Array<{ value: Currency; label: string; symbol: string }> {
  return Object.entries(currencyConfig).map(([key, config]) => ({
    value: key as Currency,
    label: `${key} (${config.name})`,
    symbol: config.symbol
  }));
}
