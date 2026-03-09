import { useState, useCallback, useMemo } from 'react';

export type CurrencyCode = 'USD' | 'KES' | 'EUR' | 'GBP';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // rate from KES to this currency
}

// Base prices are in KES. These rates convert KES → target currency.
// Update these rates periodically or refactor to use a live API.
const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  KES: { code: 'KES', symbol: 'KSh', label: 'KES (Kenyan Shilling)', rate: 1 },
  USD: { code: 'USD', symbol: '$', label: 'USD (US Dollar)', rate: 0.0077 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (Euro)', rate: 0.0071 },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (British Pound)', rate: 0.0061 },
};

export const CURRENCY_OPTIONS: CurrencyCode[] = ['USD', 'KES', 'EUR', 'GBP'];

export const useCurrency = (defaultCurrency: CurrencyCode = 'KES') => {
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);

  const info = useMemo(() => CURRENCIES[currency], [currency]);

  const convert = useCallback(
    (kesAmount: number): number => {
      const converted = kesAmount * info.rate;
      return Math.round(converted * 100) / 100;
    },
    [info]
  );

  const format = useCallback(
    (kesAmount: number): string => {
      const converted = convert(kesAmount);
      return `${info.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    [convert, info]
  );

  return { currency, setCurrency, convert, format, info };
};
