export type SupportedCurrency = 'INR' | 'USD' | 'EUR' | 'GBP';

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

// Approximate conversion rates relative to USD base (1 USD = 83.2 INR, 0.92 EUR, 0.79 GBP)
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  INR: 83.2,
  EUR: 0.92,
  GBP: 0.79,
};

export const CURRENCY_RATES_FROM_USD = EXCHANGE_RATES;

export function convertCurrency(
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: SupportedCurrency | string = 'INR'
): number {
  let amountInUSD = amount;
  if (fromCurrency === 'INR') {
    amountInUSD = amount / 83.2;
  } else if (fromCurrency === 'EUR') {
    amountInUSD = amount / 0.92;
  } else if (fromCurrency === 'GBP') {
    amountInUSD = amount / 0.79;
  }

  const targetRate = EXCHANGE_RATES[toCurrency] || 1;
  return amountInUSD * targetRate;
}

export function formatCurrency(
  amountInUSD: number,
  currency: SupportedCurrency | string = 'INR',
  options: { includeSymbol?: boolean; compact?: boolean } = {}
): string {
  const { includeSymbol = true, compact = false } = options;
  const rate = EXCHANGE_RATES[currency] || 1;
  const converted = Math.round(amountInUSD * (currency === 'USD' ? 1 : rate));
  const symbol = includeSymbol ? (CURRENCY_SYMBOLS[currency] || '$') : '';

  if (compact && converted >= 1000000) {
    return `${symbol}${(converted / 1000000).toFixed(1)}M`;
  }
  if (compact && converted >= 1000) {
    return `${symbol}${(converted / 1000).toFixed(1)}k`;
  }

  // Format with commas based on currency locale
  let formatted = '';
  if (currency === 'INR') {
    formatted = converted.toLocaleString('en-IN');
  } else {
    formatted = converted.toLocaleString('en-US');
  }

  return includeSymbol ? `${symbol}${formatted}` : formatted;
}

export function convertAndFormat(
  amount: number,
  fromCurrency: string,
  toCurrency: SupportedCurrency | string = 'INR'
): string {
  const converted = convertCurrency(amount, fromCurrency, toCurrency);
  return formatCurrency(converted / (EXCHANGE_RATES[toCurrency] || 1), toCurrency);
}
