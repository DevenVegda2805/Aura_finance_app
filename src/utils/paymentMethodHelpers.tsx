import React from 'react';
import { PaymentMethod } from '../types/finance';
import { CreditCard, Landmark, Banknote, Smartphone, Zap } from 'lucide-react';

export interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  shortName: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  icon: React.ReactNode;
}

export function getPaymentMethodInfo(method: PaymentMethod): PaymentMethodInfo {
  switch (method) {
    case 'phonepe':
      return {
        id: 'phonepe',
        name: 'PhonePe UPI',
        shortName: 'PhonePe',
        badgeBg: 'bg-purple-100',
        textColor: 'text-purple-800',
        borderColor: 'border-purple-300',
        icon: <span className="font-bold text-[10px] text-purple-700">पे</span>,
      };
    case 'gpay':
      return {
        id: 'gpay',
        name: 'Google Pay',
        shortName: 'GPay',
        badgeBg: 'bg-blue-100',
        textColor: 'text-blue-800',
        borderColor: 'border-blue-300',
        icon: <span className="font-bold text-[10px] text-blue-600">G</span>,
      };
    case 'apple_pay':
      return {
        id: 'apple_pay',
        name: 'Apple Pay',
        shortName: 'Apple Pay',
        badgeBg: 'bg-slate-900',
        textColor: 'text-white',
        borderColor: 'border-slate-800',
        icon: <span className="text-[10px] font-semibold">Pay</span>,
      };
    case 'paytm':
      return {
        id: 'paytm',
        name: 'Paytm UPI',
        shortName: 'Paytm',
        badgeBg: 'bg-sky-100',
        textColor: 'text-sky-900',
        borderColor: 'border-sky-300',
        icon: <span className="font-extrabold text-[10px] text-sky-800">paytm</span>,
      };
    case 'bhim_upi':
      return {
        id: 'bhim_upi',
        name: 'BHIM UPI',
        shortName: 'BHIM',
        badgeBg: 'bg-teal-100',
        textColor: 'text-teal-900',
        borderColor: 'border-teal-300',
        icon: <Zap className="w-3 h-3 text-teal-700" />,
      };
    case 'amazon_pay':
      return {
        id: 'amazon_pay',
        name: 'Amazon Pay',
        shortName: 'Amazon Pay',
        badgeBg: 'bg-amber-100',
        textColor: 'text-amber-900',
        borderColor: 'border-amber-300',
        icon: <span className="font-bold text-[10px] text-amber-800">a</span>,
      };
    case 'cred':
      return {
        id: 'cred',
        name: 'CRED UPI',
        shortName: 'CRED',
        badgeBg: 'bg-neutral-900',
        textColor: 'text-white',
        borderColor: 'border-neutral-800',
        icon: <span className="font-mono text-[9px] tracking-wider text-white">CRED</span>,
      };
    case 'card':
      return {
        id: 'card',
        name: 'Credit / Debit Card',
        shortName: 'Card',
        badgeBg: 'bg-slate-100',
        textColor: 'text-slate-700',
        borderColor: 'border-slate-200',
        icon: <CreditCard className="w-3 h-3 text-slate-600" />,
      };
    case 'bank_transfer':
      return {
        id: 'bank_transfer',
        name: 'Bank Transfer (IMPS/NEFT)',
        shortName: 'Bank',
        badgeBg: 'bg-emerald-100',
        textColor: 'text-emerald-800',
        borderColor: 'border-emerald-300',
        icon: <Landmark className="w-3 h-3 text-emerald-700" />,
      };
    case 'cash':
    default:
      return {
        id: 'cash',
        name: 'Cash Payment',
        shortName: 'Cash',
        badgeBg: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300',
        icon: <Banknote className="w-3 h-3 text-green-700" />,
      };
  }
}
