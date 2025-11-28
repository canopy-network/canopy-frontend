/**
 * Denomination conversion utilities for Canopy blockchain chains
 *
 * Canopy chains use micro-denomination where:
 * 1 TOKEN = 1,000,000 uTOKEN (micro-token)
 *
 * This module provides generic conversion functions between:
 * - Human-readable denomination (standard units) - used in UI
 * - Micro-denomination (micro units) - used in blockchain/API
 *
 * These functions work for any token on Canopy chains (CNPY, custom chain tokens, etc.)
 */

const MICRO_MULTIPLIER = 1_000_000;

/**
 * Convert from standard units to micro units (human to micro)
 * Used when sending amounts to the backend
 *
 * @param amount - Amount in standard units (can be string or number)
 * @returns Amount in micro units as string
 *
 * @example
 * toMicroUnits("1.5") // Returns "1500000"
 * toMicroUnits(10) // Returns "10000000"
 */
export function toMicroUnits(amount?: string | number): string {
  if (!amount) return "0";

  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(amountNum)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  // Multiply and convert to integer (micro denomination)
  const microAmount = Math.floor(amountNum * MICRO_MULTIPLIER);

  return microAmount.toString();
}

/**
 * Convert from micro units to standard units (micro to human)
 * Used when receiving amounts from the backend
 *
 * @param microAmount - Amount in micro units (can be string or number)
 * @param decimals - Number of decimal places to show (default: 6)
 * @returns Amount in standard units as string
 *
 * @example
 * fromMicroUnits("1500000") // Returns "1.500000"
 * fromMicroUnits(10000000) // Returns "10.000000"
 * fromMicroUnits("1500000", 2) // Returns "1.50"
 */
export function fromMicroUnits(microAmount: string | number, decimals: number = 6): string {
  const microNum = typeof microAmount === 'string' ? parseFloat(microAmount) : microAmount;

  if (isNaN(microNum)) {
    throw new Error(`Invalid micro amount: ${microAmount}`);
  }

  // Divide to get standard units
  const standardAmount = microNum / MICRO_MULTIPLIER;

  return standardAmount.toFixed(decimals);
}

/**
 * Format token amount for display in UI
 * Removes trailing zeros and ensures readable format
 *
 * @param amount - Amount in standard units
 * @returns Formatted amount string
 *
 * @example
 * formatTokenAmount("1.500000") // Returns "1.5"
 * formatTokenAmount("10.000000") // Returns "10"
 * formatTokenAmount("0.000001") // Returns "0.000001"
 */
export function formatTokenAmount(amount: string | number): string {
  const amountStr = typeof amount === 'number' ? amount.toString() : amount;
  const amountNum = parseFloat(amountStr);

  if (isNaN(amountNum)) {
    return "0";
  }

  // Remove trailing zeros but keep at least 2 decimal places for amounts >= 0.01
  if (amountNum >= 0.01) {
    return amountNum.toFixed(6).replace(/\.?0+$/, '');
  }

  // For very small amounts, show up to 6 decimals
  return amountNum.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
}

// Legacy exports for backward compatibility
/**
 * @deprecated Use toMicroUnits instead
 */
export const cnpyToMicro = toMicroUnits;

/**
 * @deprecated Use fromMicroUnits instead
 */
export const microToCnpy = fromMicroUnits;

/**
 * @deprecated Use formatTokenAmount instead
 */
export const formatCnpy = formatTokenAmount;

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
 * Convert amount object from API response (micro) to UI format (standard units)
 * Handles both string amounts and nested objects
 *
 * @param data - API response data that may contain amount fields
 * @returns Data with amounts converted to standard units
 */
export function convertApiAmountsToStandard<T extends Record<string, any>>(data: T): T {
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
      converted[key] = fromMicroUnits(value) as any;
    }

    // Recursively convert nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      converted[key] = convertApiAmountsToStandard(value);
    }

    // Convert arrays of objects
    if (Array.isArray(value)) {
      converted[key] = value.map(item =>
        item && typeof item === 'object' ? convertApiAmountsToStandard(item) : item
      ) as any;
    }
  }

  return converted;
}

/**
 * Convert amount object from UI format (standard units) to API request format (micro)
 *
 * @param data - UI data that may contain amount fields
 * @returns Data with amounts converted to micro units
 */
export function convertStandardAmountsToMicro<T extends Record<string, any>>(data: T): T {
  const converted = { ...data };

  // Common field names that contain amounts in standard units
  const amountFields = [
    'amount',
    'staked_amount',
    'fee',
  ];

  for (const key of Object.keys(converted)) {
    const value = converted[key];

    // Convert if it's an amount field
    if (amountFields.includes(key) && (typeof value === 'string' || typeof value === 'number')) {
      converted[key] = toMicroUnits(value) as any;
    }

    // Don't recursively convert nested objects for API requests
    // as we only want to convert top-level amount fields
  }

  return converted;
}


/**
 * Format a number with thousand separators (commas)
 * Use this for numbers that are already in standard units (not micro)
 *
 * @param value - Number to format (already in standard units)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string with thousand separators
 *
 * @example
 * withCommas(1000) // Returns "1,000.00"
 * withCommas("1234567.89") // Returns "1,234,567.89"
 * withCommas(42, 0) // Returns "42"
 * withCommas(0.123456, 6) // Returns "0.123456"
 */
export function withCommas(value: string | number, decimals: number = 2): string {
  if (value === null || value === undefined || value === "") return "0.00";

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0.00";

  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a balance from micro units to human-readable format with thousand separators
 *
 * Converts micro denomination to standard units and applies locale-specific formatting
 * with commas (or locale-appropriate separators) for better readability.
 *
 * @param amount - Balance in micro units (from backend/blockchain) or standard units if isStandard=true
 * @param decimals - Number of decimal places (default: 2)
 * @param isStandard - If true, amount is already in standard units (default: false)
 * @returns Formatted balance with thousand separators (e.g., "1,000,000.50")
 *
 * @example
 * formatBalanceWithCommas(1500000) // Returns "1.50" (from micro)
 * formatBalanceWithCommas("10000000") // Returns "10.00" (from micro)
 * formatBalanceWithCommas(1234567890) // Returns "1,234.57" (from micro)
 * formatBalanceWithCommas("1234.56", 2, true) // Returns "1,234.56" (already standard)
 */
export function formatBalanceWithCommas(
  amount?: string | number,
  decimals: number = 2,
  isStandard: boolean = false
): string {
  if (!amount) return "0.00";

  if (isNaN(Number(amount))) return "0.00";

  // If already in standard units, just format with commas
  if (isStandard) {
    return withCommas(amount, decimals);
  }

  // Convert from micro units first, then format
  const standardAmount = fromMicroUnits(amount, decimals);
  return withCommas(standardAmount, decimals);
}
// Legacy exports for backward compatibility
/**
 * @deprecated Use convertApiAmountsToStandard instead
 */
export const convertApiAmountsToCnpy = convertApiAmountsToStandard;

/**
 * @deprecated Use convertStandardAmountsToMicro instead
 */
export const convertUiAmountsToMicro = convertStandardAmountsToMicro;
