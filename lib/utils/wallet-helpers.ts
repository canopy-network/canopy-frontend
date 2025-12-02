/**
 * Wallet Helper Utilities
 * Functions for formatting and calculating wallet-related data
 */

/**
 * Format wallet address to short form
 * @param address - Full wallet address
 * @returns Formatted address (e.g., "0x1234...5678")
 */
export function formatAddress(address: string): string {
    if (!address) return "";
    const fullAddress = address.startsWith("0x") ? address : `0x${address}`;
    return `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`;
}

/**
 * Format balance with thousand separators
 * @param amount - Amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted balance string
 */
export function formatBalance(amount: number | string, decimals: number = 2): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "0.00";

    return num.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Calculate total balance from assets
 * @param assets - Array of assets with value property
 * @returns Total balance
 */
export function calculateTotalBalance(assets: Array<{ value: number }>): number {
    return assets.reduce((total, asset) => total + asset.value, 0);
}

/**
 * Calculate PnL (Profit and Loss)
 * @param current - Current value
 * @param previous - Previous value
 * @returns Object with absolute change and percentage change
 */
export function calculatePnL(current: number, previous: number): {
    absolute: number;
    percentage: number;
} {
    const absolute = current - previous;
    const percentage = previous !== 0 ? (absolute / previous) * 100 : 0;

    return {
        absolute,
        percentage,
    };
}

/**
 * Generate mock price history data
 * @param basePrice - Base price to generate around
 * @param points - Number of data points
 * @param variation - Percentage variation (default: 0.1 = 10%)
 * @returns Array of price data points
 */
export function generateMockPriceHistory(
    basePrice: number,
    points: number,
    variation: number = 0.1
): Array<{ price: number }> {
    const history: Array<{ price: number }> = [];

    for (let i = 0; i < points; i++) {
        const randomVariation = (Math.random() - 0.5) * 2 * variation;
        const price = basePrice * (1 + randomVariation);
        history.push({ price });
    }

    return history;
}

/**
 * Format time remaining from timestamp
 * @param targetTimestamp - Target timestamp (future)
 * @returns Formatted time remaining (e.g., "5 days, 3 hours")
 */
export function formatTimeRemaining(targetTimestamp: number): string {
    const now = Date.now();
    const diff = targetTimestamp - now;

    if (diff <= 0) return "Available now";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}`;
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""}, ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else {
        return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
}

/**
 * Generate random transaction hash
 * @returns Random 40-character hex hash with 0x prefix
 */
export function generateTransactionHash(): string {
    return "0x" + Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join("");
}

/**
 * Format USD value
 * @param value - Value to format
 * @param includeSign - Whether to include +/- sign (default: false)
 * @returns Formatted USD string
 */
export function formatUSD(value: number, includeSign: boolean = false): string {
    const sign = includeSign ? (value >= 0 ? "+" : "") : "";
    return `${sign}$${formatBalance(Math.abs(value), 2)}`;
}

/**
 * Calculate APY earnings
 * @param principal - Principal amount
 * @param apy - Annual Percentage Yield (as percentage, e.g., 15 for 15%)
 * @param days - Number of days
 * @returns Calculated earnings
 */
export function calculateAPYEarnings(
    principal: number,
    apy: number,
    days: number
): number {
    const dailyRate = apy / 100 / 365;
    return principal * dailyRate * days;
}
