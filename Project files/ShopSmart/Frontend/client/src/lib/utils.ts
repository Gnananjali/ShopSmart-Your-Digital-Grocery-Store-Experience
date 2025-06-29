import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `₹${numPrice.toFixed(0)}`;
}

export function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';
  
  let sessionId = localStorage.getItem('grocery-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('grocery-session-id', sessionId);
  }
  return sessionId;
}
