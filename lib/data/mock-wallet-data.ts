/**
 * Mock Wallet Data
 * Mock data structures for wallet development and testing
 */

export interface Asset {
    id: number;
    chainId: number;
    symbol: string;
    name: string;
    balance: number;
    price: number;
    value: number;
    change24h: number;
    color: string;
    priceHistory: Array<{ price: number }>;
}

export interface Transaction {
    id: number;
    type: "sent" | "received" | "swap" | "staked" | "unstaked" | "claimed";
    symbol: string;
    amount: number;
    timestamp: string | Date;
    status: "completed" | "pending" | "failed";
    hash: string;
    from?: string;
    to?: string;
    blockNumber?: number;
    fee?: number;
    // For swap transactions
    symbolFrom?: string;
    symbolTo?: string;
    amountFrom?: number;
    amountTo?: number;
    // For staking transactions
    apy?: number;
    rewards?: number;
}

export interface Stake {
    id: number;
    chainId: number;
    symbol: string;
    chain: string;
    amount: number;
    apy: number;
    rewards: number;
    color: string;
    price?: number;
}

export interface UnstakingItem {
    id: number;
    chainId: number;
    symbol: string;
    chain: string;
    amount: number;
    availableAt: number; // timestamp
    color: string;
}

export interface EarningRecord {
    id: number;
    date: string; // ISO date string
    chain: string;
    symbol: string;
    amount: number;
    usdValue: number;
    color: string;
}

export interface WalletData {
    totalValue: number;
    assets: Asset[];
    transactions: Transaction[];
    stakes: Stake[];
    unstaking: UnstakingItem[];
    earningsHistory: EarningRecord[];
}

// Mock data for a funded wallet
export const mockFundedWalletData: WalletData = {
    totalValue: 12458.32,
    assets: [
        {
            id: 1,
            chainId: 1,
            symbol: "CNPY",
            name: "Canopy",
            balance: 5000,
            price: 1.0,
            value: 5000,
            change24h: 0,
            color: "#1dd13a",
            priceHistory: [
                { price: 0.98 },
                { price: 0.99 },
                { price: 1.0 },
                { price: 1.01 },
                { price: 1.0 },
                { price: 0.99 },
                { price: 1.0 },
                { price: 1.01 },
            ],
        },
        {
            id: 2,
            chainId: 2,
            symbol: "OENS",
            name: "Onchain ENS",
            balance: 2500,
            price: 2.24256,
            value: 5606.24,
            change24h: 3.2,
            color: "#10b981",
            priceHistory: [
                { price: 2.0 },
                { price: 2.1 },
                { price: 2.15 },
                { price: 2.2 },
                { price: 2.25 },
                { price: 2.24 },
                { price: 2.23 },
                { price: 2.24 },
            ],
        },
        {
            id: 3,
            chainId: 3,
            symbol: "GAME",
            name: "MyGameChain",
            balance: 1000,
            price: 0.85,
            value: 850,
            change24h: -2.3,
            color: "#8b5cf6",
            priceHistory: [
                { price: 0.9 },
                { price: 0.88 },
                { price: 0.87 },
                { price: 0.85 },
                { price: 0.84 },
                { price: 0.86 },
                { price: 0.85 },
                { price: 0.85 },
            ],
        },
    ],
    transactions: [
        {
            id: 1,
            type: "received",
            symbol: "CNPY",
            amount: 5000,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            status: "completed",
            hash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
            from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
            to: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
            blockNumber: 1234567,
            fee: 0.0012,
        },
        {
            id: 2,
            type: "staked",
            symbol: "OENS",
            amount: 500,
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            status: "completed",
            hash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a",
            apy: 12.5,
        },
        {
            id: 3,
            type: "sent",
            symbol: "GAME",
            amount: -50,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            status: "completed",
            hash: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b",
            from: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
            to: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
            blockNumber: 1234500,
            fee: 0.0008,
        },
    ],
    stakes: [
        {
            id: 1,
            chainId: 1,
            symbol: "CNPY",
            chain: "Canopy",
            amount: 1000,
            apy: 15.0,
            rewards: 5.5,
            color: "#1dd13a",
            price: 1.0,
        },
        {
            id: 2,
            chainId: 2,
            symbol: "OENS",
            chain: "Onchain ENS",
            amount: 500,
            apy: 12.5,
            rewards: 2.15,
            color: "#10b981",
            price: 2.24256,
        },
        {
            id: 3,
            chainId: 3,
            symbol: "GAME",
            chain: "MyGameChain",
            amount: 0, // Available to stake but not staked
            apy: 18.0,
            rewards: 0,
            color: "#8b5cf6",
            price: 0.85,
        },
    ],
    unstaking: [
        {
            id: 1,
            chainId: 2,
            symbol: "OENS",
            chain: "Onchain ENS",
            amount: 100,
            availableAt: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
            color: "#10b981",
        },
    ],
    earningsHistory: [
        {
            id: 1,
            date: new Date().toISOString(),
            chain: "Canopy",
            symbol: "CNPY",
            amount: 0.5,
            usdValue: 0.5,
            color: "#1dd13a",
        },
        {
            id: 2,
            date: new Date().toISOString(),
            chain: "Onchain ENS",
            symbol: "OENS",
            amount: 0.25,
            usdValue: 0.56,
            color: "#10b981",
        },
        {
            id: 3,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
            chain: "Canopy",
            symbol: "CNPY",
            amount: 0.48,
            usdValue: 0.48,
            color: "#1dd13a",
        },
        {
            id: 4,
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
            chain: "Onchain ENS",
            symbol: "OENS",
            amount: 0.24,
            usdValue: 0.54,
            color: "#10b981",
        },
    ],
};

// Empty wallet data for new users
export const mockEmptyWalletData: WalletData = {
    totalValue: 0,
    assets: [],
    transactions: [],
    stakes: [],
    unstaking: [],
    earningsHistory: [],
};

// Helper function to create funded wallet data with custom amount
export function createFundedWalletData(cnpyAmount: number): WalletData {
    const currentDate = new Date().toISOString();

    return {
        totalValue: cnpyAmount,
        assets: [
            {
                id: 1,
                chainId: 1,
                symbol: "CNPY",
                name: "Canopy",
                balance: cnpyAmount,
                price: 1,
                value: cnpyAmount,
                change24h: 0,
                color: "#1dd13a",
                priceHistory: [
                    { price: 0.98 },
                    { price: 0.99 },
                    { price: 1.0 },
                    { price: 1.01 },
                    { price: 1.0 },
                    { price: 0.99 },
                    { price: 1.0 },
                    { price: 1.01 },
                ],
            },
        ],
        transactions: [
            {
                id: 1,
                type: "received",
                symbol: "CNPY",
                amount: cnpyAmount,
                timestamp: currentDate,
                status: "completed",
                hash: "0x" + Math.random().toString(16).substr(2, 40),
            },
        ],
        stakes: [
            {
                id: 1,
                chainId: 1,
                symbol: "CNPY",
                chain: "Canopy",
                amount: 0,
                apy: 15.0,
                rewards: 0,
                color: "#1dd13a",
                price: 1.0,
            },
        ],
        unstaking: [],
        earningsHistory: [],
    };
}
