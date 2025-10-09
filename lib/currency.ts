// Currency formatting utilities for Saudi Arabia and Middle East

export interface CurrencyConfig {
  code: string
  symbol: string
  name: string
  nameArabic: string
  locale: string
  decimalPlaces: number
}

export const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  SAR: {
    code: 'SAR',
    symbol: 'ر.س',
    name: 'Saudi Riyal',
    nameArabic: 'ريال سعودي',
    locale: 'ar-SA',
    decimalPlaces: 2
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    nameArabic: 'درهم إماراتي',
    locale: 'ar-AE',
    decimalPlaces: 2
  },
  KWD: {
    code: 'KWD',
    symbol: 'د.ك',
    name: 'Kuwaiti Dinar',
    nameArabic: 'دينار كويتي',
    locale: 'ar-KW',
    decimalPlaces: 3
  },
  BHD: {
    code: 'BHD',
    symbol: 'د.ب',
    name: 'Bahraini Dinar',
    nameArabic: 'دينار بحريني',
    locale: 'ar-BH',
    decimalPlaces: 3
  },
  QAR: {
    code: 'QAR',
    symbol: 'ر.ق',
    name: 'Qatari Riyal',
    nameArabic: 'ريال قطري',
    locale: 'ar-QA',
    decimalPlaces: 2
  },
  OMR: {
    code: 'OMR',
    symbol: 'ر.ع',
    name: 'Omani Rial',
    nameArabic: 'ريال عماني',
    locale: 'ar-OM',
    decimalPlaces: 3
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    nameArabic: 'دولار أمريكي',
    locale: 'en-US',
    decimalPlaces: 2
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    nameArabic: 'يورو',
    locale: 'en-EU',
    decimalPlaces: 2
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    nameArabic: 'جنيه إسترليني',
    locale: 'en-GB',
    decimalPlaces: 2
  }
}

/**
 * Format currency amount according to the specified currency code
 * @param amount - The amount to format
 * @param currencyCode - The currency code (e.g., 'SAR', 'USD')
 * @param options - Additional formatting options
 */
export function formatCurrency(
  amount: number, 
  currencyCode: string = 'SAR', 
  options: {
    showSymbol?: boolean
    showCode?: boolean
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {}
): string {
  const {
    showSymbol = true,
    showCode = false,
    locale,
    minimumFractionDigits,
    maximumFractionDigits
  } = options

  const currencyConfig = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.SAR
  
  // Use provided locale or currency-specific locale
  const formatLocale = locale || currencyConfig.locale
  
  // Use provided decimal places or currency-specific decimal places
  const minFractionDigits = minimumFractionDigits ?? currencyConfig.decimalPlaces
  const maxFractionDigits = maximumFractionDigits ?? currencyConfig.decimalPlaces

  try {
    const formatter = new Intl.NumberFormat(formatLocale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits,
      maximumFractionDigits
    })

    let formatted = formatter.format(amount)

    // If we want to show code instead of symbol
    if (showCode && !showSymbol) {
      formatted = formatted.replace(currencyConfig.symbol, currencyCode)
    }

    return formatted
  } catch (error) {
    console.warn(`Failed to format currency ${currencyCode}, falling back to simple format:`, error)
    
    // Fallback formatting
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits
    }).format(amount)

    if (showSymbol) {
      return `${formattedAmount} ${currencyConfig.symbol}`
    } else if (showCode) {
      return `${formattedAmount} ${currencyCode}`
    } else {
      return formattedAmount
    }
  }
}

/**
 * Format currency amount with Saudi Arabia specific formatting
 * @param amount - The amount to format
 * @param currencyCode - The currency code (defaults to SAR)
 */
export function formatCurrencySA(amount: number, currencyCode: string = 'SAR'): string {
  return formatCurrency(amount, currencyCode, {
    showSymbol: true,
    showCode: false,
    locale: 'ar-SA'
  })
}

/**
 * Get currency symbol for a given currency code
 * @param currencyCode - The currency code
 */
export function getCurrencySymbol(currencyCode: string): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.SAR
  return config.symbol
}

/**
 * Get currency name in Arabic for a given currency code
 * @param currencyCode - The currency code
 */
export function getCurrencyNameArabic(currencyCode: string): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.SAR
  return config.nameArabic
}

/**
 * Get currency name in English for a given currency code
 * @param currencyCode - The currency code
 */
export function getCurrencyName(currencyCode: string): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.SAR
  return config.name
}

/**
 * Parse currency string and return numeric value
 * @param currencyString - The currency string to parse
 * @param currencyCode - The expected currency code
 */
export function parseCurrency(currencyString: string, currencyCode: string = 'SAR'): number {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.SAR
  
  // Remove currency symbols and codes
  let cleanString = currencyString
    .replace(config.symbol, '')
    .replace(currencyCode, '')
    .replace(/[^\d.,]/g, '')
  
  // Handle different decimal separators
  if (cleanString.includes(',')) {
    // European format: 1.234,56
    cleanString = cleanString.replace('.', '').replace(',', '.')
  }
  
  const parsed = parseFloat(cleanString)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Convert amount from one currency to another (requires exchange rate)
 * @param amount - The amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @param exchangeRate - Exchange rate from source to target
 */
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string, 
  exchangeRate: number
): number {
  return amount * exchangeRate
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies(): CurrencyConfig[] {
  return Object.values(CURRENCY_CONFIGS)
}

/**
 * Get currencies commonly used in Saudi Arabia and Middle East
 */
export function getMiddleEastCurrencies(): CurrencyConfig[] {
  return [
    CURRENCY_CONFIGS.SAR,
    CURRENCY_CONFIGS.AED,
    CURRENCY_CONFIGS.KWD,
    CURRENCY_CONFIGS.BHD,
    CURRENCY_CONFIGS.QAR,
    CURRENCY_CONFIGS.OMR
  ]
}
