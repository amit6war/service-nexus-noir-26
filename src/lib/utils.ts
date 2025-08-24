// In checkout validation logic
const validateCartItems = (items: { service_title: string; scheduled_date: string }[]) => {
  for (const item of items) {
    if (!item.scheduled_date || !isValidDate(item.scheduled_date)) {
      throw new Error(`Invalid date format for item: ${item.service_title}`);
    }
  }
};import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this date validation utility
export const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const formatSafeDate = (dateString: string, formatString: string): string => {
  try {
    if (!isValidDate(dateString)) {
      return 'Invalid date';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};
