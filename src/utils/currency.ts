/**
 * Currency formatting utilities
 */

/**
 * Format amount with currency symbol
 */
export function formatAmountWithCurrency(amount: number | string | null | undefined, currency: string = 'NGN'): string {
  // Handle null, undefined, or invalid values
  if (amount === null || amount === undefined || amount === '') {
    return '₦0.00';
  }
  
  // Convert string to number if needed
  let numAmount: number;
  if (typeof amount === 'string') {
    numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return '₦0.00';
    }
  } else {
    numAmount = amount;
  }
  
  // Check if number is valid
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return '₦0.00';
  }
  
  const formatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(numAmount);
}

/**
 * Parse formatted amount string to number
 */
export function parseFormattedAmount(formatted: string | number): number {
  if (typeof formatted === 'number') {
    return formatted;
  }
  
  // Remove currency symbols, commas, and spaces
  const cleaned = formatted.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-NG').format(num);
}
