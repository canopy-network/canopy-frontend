import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Abbreviates a number (e.g., 60000 to 60k, 1500000 to 1.5M).
 * @param {number} num The number to format.
 * @param {number} [digits=1] The number of decimal places to show for non-integer results.
 * @returns {string} The abbreviated string.
 */
export function formatKilo(num: number, digits = 1) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" }, // 1,000
    { value: 1e6, symbol: "M" }, // 1,000,000
    { value: 1e9, symbol: "B" }, // 1,000,000,000
    // Add more if needed, e.g., 'T' for trillions
  ];

  // Find the largest relevant abbreviation
  const item = lookup
    .slice()
    .reverse()
    .find((item) => num >= item.value);

  if (item) {
    const value = num / item.value;

    // Format the number part using Intl.NumberFormat for locale and decimal control
    // 'en-US' locale is used, but you can adjust
    const formattedNum = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digits,
      // Use minimumFractionDigits: digits to force trailing zeros (e.g., 60.0k)
    }).format(value);

    return formattedNum + item.symbol;
  }

  // If the number is too small (e.g., less than 1000), return the original number formatted
  return new Intl.NumberFormat("en-US").format(num);
}

export const WINDOW_BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536,
};
