/**
 * Denomination conversion utilities for Canopy blockchain
 *
 * Canopy uses micro-denomination (uCNPY) where:
 * 1 CNPY = 1,000,000 uCNPY
 *
 * This module provides conversion functions between:
 * - Human-readable denomination (CNPY) - used in UI
 * - Micro-denomination (uCNPY) - used in blockchain/API
 */

const MICRO_DENOM_MULTIPLIER = 1_000_000;

/**
 * Convert from CNPY to uCNPY (human to micro)
 * Used when sending amounts to the backend
 *
 * @param cnpy - Amount in CNPY (can be string or number)
 * @returns Amount in uCNPY as string
 *
 * @example
 * cnpyToMicro("1.5") // Returns "1500000"
 * cnpyToMicro(10) // Returns "10000000"
 */
export function cnpyToMicro(cnpy: string | number): string {
  const cnpyNum = typeof cnpy === 'string' ? parseFloat(cnpy) : cnpy;

  if (isNaN(cnpyNum)) {
    throw new Error(`Invalid CNPY amount: ${cnpy}`);
  }

  // Multiply and convert to integer (micro denomination)
  const microAmount = Math.floor(cnpyNum * MICRO_DENOM_MULTIPLIER);

  return microAmount.toString();
}

/**
 * Convert from uCNPY to CNPY (micro to human)
 * Used when receiving amounts from the backend
 *
 * @param micro - Amount in uCNPY (can be string or number)
 * @param decimals - Number of decimal places to show (default: 6)
 * @returns Amount in CNPY as string
 *
 * @example
 * microToCnpy("1500000") // Returns "1.500000"
 * microToCnpy(10000000) // Returns "10.000000"
 * microToCnpy("1500000", 2) // Returns "1.50"
 */
export function microToCnpy(micro: string | number, decimals: number = 6): string {
  const microNum = typeof micro === 'string' ? parseFloat(micro) : micro;

  if (isNaN(microNum)) {
    throw new Error(`Invalid micro amount: ${micro}`);
  }

  // Divide to get CNPY
  const cnpyAmount = microNum / MICRO_DENOM_MULTIPLIER;

  return cnpyAmount.toFixed(decimals);
}

/**
 * Format CNPY amount for display in UI
 * Removes trailing zeros and ensures readable format
 *
 * @param cnpy - Amount in CNPY
 * @returns Formatted amount string
 *
 * @example
 * formatCnpy("1.500000") // Returns "1.5"
 * formatCnpy("10.000000") // Returns "10"
 * formatCnpy("0.000001") // Returns "0.000001"
 */
export function formatCnpy(cnpy: string | number): string {
  const cnpyStr = typeof cnpy === 'number' ? cnpy.toString() : cnpy;
  const cnpyNum = parseFloat(cnpyStr);

  if (isNaN(cnpyNum)) {
    return "0";
  }

  // Remove trailing zeros but keep at least 2 decimal places for amounts >= 0.01
  if (cnpyNum >= 0.01) {
    return cnpyNum.toFixed(6).replace(/\.?0+$/, '');
  }

  // For very small amounts, show up to 6 decimals
  return cnpyNum.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

/**
 * Validate if an amount is valid (positive and not zero)
 *
 * @param amount - Amount to validate (can be in any denomination)
 * @returns True if valid, false otherwise
 */
export function isValidAmount(amount: string | number): boolean {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0;
}

/**
 * Convert amount object from API response (micro) to UI format (CNPY)
 * Handles both string amounts and nested objects
 *
 * @param data - API response data that may contain amount fields
 * @returns Data with amounts converted to CNPY
 */
export function convertApiAmountsToCnpy<T extends Record<string, any>>(data: T): T {
  const converted = { ...data };

  // Common field names that contain amounts in micro denomination
  const amountFields = [
    'amount',
    'balance',
    'balance_cnpy',
    'total_value_cnpy',
    'staked_amount',
    'estimated_fee',
    'fee',
    'value',
  ];

  for (const key of Object.keys(converted)) {
    const value = converted[key];

    // Convert if it's an amount field
    if (amountFields.includes(key) && (typeof value === 'string' || typeof value === 'number')) {
      converted[key] = microToCnpy(value) as any;
    }

    // Recursively convert nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      converted[key] = convertApiAmountsToCnpy(value);
    }

    // Convert arrays of objects
    if (Array.isArray(value)) {
      converted[key] = value.map(item =>
        item && typeof item === 'object' ? convertApiAmountsToCnpy(item) : item
      ) as any;
    }
  }

  return converted;
}

/**
 * Convert amount object from UI format (CNPY) to API request format (micro)
 *
 * @param data - UI data that may contain amount fields
 * @returns Data with amounts converted to uCNPY
 */
export function convertUiAmountsToMicro<T extends Record<string, any>>(data: T): T {
  const converted = { ...data };

  // Common field names that contain amounts in CNPY
  const amountFields = [
    'amount',
    'staked_amount',
    'fee',
  ];

  for (const key of Object.keys(converted)) {
    const value = converted[key];

    // Convert if it's an amount field
    if (amountFields.includes(key) && (typeof value === 'string' || typeof value === 'number')) {
      converted[key] = cnpyToMicro(value) as any;
    }

    // Don't recursively convert nested objects for API requests
    // as we only want to convert top-level amount fields
  }

  return converted;
}
