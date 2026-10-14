import { CurrencyCode } from '../types/finance';

const CURRENCY_SYMBOLS: Record<CurrencyCode, { symbol: string; locale: string }> = {
  USD: { symbol: '$', locale: 'en-US' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  INR: { symbol: '₹', locale: 'en-IN' },
  CAD: { symbol: 'CA$', locale: 'en-CA' },
  AUD: { symbol: 'AU$', locale: 'en-AU' },
  JPY: { symbol: '¥', locale: 'ja-JP' },
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const { locale } = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.USD;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const { symbol } = CURRENCY_SYMBOLS[currency] || CURRENCY_SYMBOLS.USD;
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  }
  return formatCurrency(amount, currency);
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(dateString: string): string {
  const today = new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  
  const diffTime = today.setHours(0,0,0,0) - target.setHours(0,0,0,0);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7 && diffDays > 1) {
    return target.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getDaysRemainingInMonth(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const currentDay = date.getDate();
  return Math.max(1, lastDay - currentDay + 1);
}
