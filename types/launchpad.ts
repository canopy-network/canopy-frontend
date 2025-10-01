/**
 * @fileoverview Comprehensive type definitions for the Launchpad module
 *
 * This module contains all TypeScript interfaces, types, and constants used throughout
 * the launchpad system. It provides type safety for project management, trading,
 * analytics, filtering, and user interactions.
 *
 * Key Features:
 * - Complete project data modeling with detailed JSDoc documentation
 * - Type-safe filtering and sorting options
 * - Analytics and metrics interfaces for performance tracking
 * - User investment tracking and portfolio management
 * - Project creation and management interfaces
 * - Utility types and constants for consistent UI behavior
 *
 * @author Canopy Development Team
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * Represents the current lifecycle status of a launchpad project
 * Used to determine project visibility, available actions, and UI styling
 *
 * - `"active"`: Project is currently accepting investments and trading
 * - `"graduated"`: Project has completed its funding goal and graduated to mainnet
 * - `"pending"`: Project is scheduled but not yet active for trading
 */
export type ProjectStatus = "active" | "graduated" | "pending";

/**
 * Represents the industry category classification of a launchpad project
 * Used for filtering, categorization, and applying category-specific styling
 *
 * - `"defi"`: Decentralized Finance protocols and applications
 * - `"gaming"`: Gaming-focused blockchains and GameFi projects
 * - `"nft"`: NFT marketplaces, platforms, and related infrastructure
 * - `"infrastructure"`: Core blockchain infrastructure and developer tools
 * - `"social"`: Social media platforms and community-focused applications
 */
export type ProjectCategory =
  | "defi"
  | "gaming"
  | "nft"
  | "infrastructure"
  | "social";

/**
 * Represents a single data point in a price chart for visualization
 * Used by the lightweight-charts library to render historical price movements
 *
 * @example
 * ```typescript
 * const dataPoint: ChartDataPoint = {
 *   time: "2024-01-15T10:30:00Z", // ISO 8601 timestamp
 *   value: 0.45 // Price in USD
 * };
 * ```
 */
export interface ChartDataPoint {
  /** ISO 8601 date string representing the exact timestamp of the price data */
  time: string;
  /** Price value in USD at the given timestamp for chart rendering */
  value: number;
}

/**
 * Represents a point on the bonding curve used for price discovery mechanism
 * Defines how token price increases as more tokens are purchased
 * Used to calculate current token price based on total supply purchased
 *
 * @example
 * ```typescript
 * const curvePoint: BondingCurvePoint = {
 *   price: 0.25, // Price per token at this point
 *   supply: 100000 // Total supply purchased to reach this price
 * };
 * ```
 */
export interface BondingCurvePoint {
  /** Price per token in USD at this specific point on the bonding curve */
  price: number;
  /** Total supply amount purchased to reach this price point */
  supply: number;
}

/**
 * Main interface representing a launchpad project item
 * Contains all necessary data for displaying and managing a project in the launchpad
 * Used by ProjectCard component, dashboard listings, and project detail pages
 *
 * @example
 * ```typescript
 * const project: LaunchProjectItem = {
 *   id: "1",
 *   name: "DeFi Chain Alpha",
 *   description: "Next-generation DeFi infrastructure",
 *   creator: "0x742d...8D4",
 *   status: "active",
 *   category: "defi",
 *   progress: 75,
 *   price: 0.4,
 *   marketCap: 2520000000,
 *   volume24h: 1800000000,
 *   fdv: 3100000000,
 *   chartData: [
 *     { time: "2024-01-01", value: 0.1 },
 *     { time: "2024-01-02", value: 0.12 }
 *   ],
 *   raised: "450,000",
 *   target: "600,000",
 *   participants: 234,
 *   timeLeft: "2d 14h",
 *   bondingCurve: [
 *     { price: 0.1, supply: 0 },
 *     { price: 0.15, supply: 100000 }
 *   ],
 *   createdAt: "2024-01-15",
 *   isGraduated: false
 * };
 * ```
 */
export interface LaunchProjectItem {
  /** Unique identifier for the project used for routing and data fetching */
  id: string;
  /** Display name of the project shown in cards, headers, and navigation */
  name: string;
  /** Detailed description of the project explaining its purpose and value proposition */
  description: string;
  /** Creator's wallet address or identifier for attribution and verification */
  creator: string;
  /** Current lifecycle status determining project visibility and available actions */
  status: ProjectStatus;
  /** Industry category for filtering, sorting, and applying category-specific styling */
  category: ProjectCategory;
  /** Progress percentage (0-100) indicating how close the project is to its funding goal */
  progress: number;
  /** Current price per token in USD for trading and investment calculations */
  price: number;
  /** Market capitalization in USD (price × circulating supply) for market analysis */
  marketCap: number;
  /** 24-hour trading volume in USD indicating project liquidity and activity */
  volume24h: number;
  /** Fully diluted valuation in USD (price × total supply) for long-term analysis */
  fdv: number;
  /** Historical price data points for rendering price charts and trend analysis */
  chartData: ChartDataPoint[];

  // Legacy properties for backward compatibility
  /** Amount raised in a human-readable formatted string (e.g., "450,000") */
  raised: string;
  /** Target funding amount in a human-readable formatted string (e.g., "600,000") */
  target: string;
  /** Number of unique participants who have invested in the project */
  participants: number;
  /** Human-readable time remaining until project completion (e.g., "2d 14h") */
  timeLeft: string;
  /** Bonding curve data points defining price discovery mechanism */
  bondingCurve: BondingCurvePoint[];
  /** ISO 8601 date string when the project was created for sorting and filtering */
  createdAt: string;
  /** Optional flag indicating if the project has graduated to mainnet */
  isGraduated?: boolean;
}

/**
 * Props interface for the SmallProjectCard component
 * Defines the required data for rendering a compact project card that functions as a link
 * Used by the SmallProjectCard component to display project information in a condensed format
 * Needs project prop, Uses LaunchProjectItem type
 * Optional href prop for link destination
 */
export interface SmallProjectCardProps {
  /** Complete project data object containing all information needed for display */
  project: LaunchProjectItem;
  /** Optional href for the link destination */
  href?: string;
}

/**
 * Mapping of project categories to their human-readable display labels
 * Used throughout the UI to show category names in badges, filters, and project cards
 * Ensures consistent category labeling across all components
 */
export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  defi: "DeFi",
  gaming: "Gaming",
  nft: "NFT",
  infrastructure: "Infrastructure",
  social: "Social",
} as const;

/**
 * Color scheme mapping for different project categories
 * Provides Tailwind CSS classes for consistent category-based styling
 * Used for category badges, indicators, and visual categorization throughout the UI
 *
 * @example
 * ```typescript
 * const categoryClass = PROJECT_CATEGORY_COLORS[project.category];
 * // Returns: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
 * ```
 */
export const PROJECT_CATEGORY_COLORS: Record<ProjectCategory, string> = {
  defi: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  gaming:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  nft: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  infrastructure:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  social: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
} as const;

/**
 * Utility type for filtering projects by their lifecycle status
 * Includes all project statuses plus "all" option for showing all projects
 * Used in filter dropdowns and project list filtering logic
 */
export type ProjectStatusFilter = ProjectStatus | "all";

/**
 * Utility type for filtering projects by their industry category
 * Includes all project categories plus "all" option for showing all categories
 * Used in category filter dropdowns and project categorization
 */
export type ProjectCategoryFilter = ProjectCategory | "all";

/**
 * Available sorting options for project lists and dashboards
 * Defines how projects can be ordered in various views
 * Used in sort dropdowns and project list sorting logic
 *
 * - `"newest"`: Sort by creation date, newest first
 * - `"oldest"`: Sort by creation date, oldest first
 * - `"progress-high"`: Sort by progress percentage, highest first
 * - `"progress-low"`: Sort by progress percentage, lowest first
 * - `"participants-high"`: Sort by participant count, highest first
 * - `"participants-low"`: Sort by participant count, lowest first
 * - `"raised-high"`: Sort by amount raised, highest first
 * - `"raised-low"`: Sort by amount raised, lowest first
 */
export type ProjectSortOption =
  | "newest"
  | "oldest"
  | "progress-high"
  | "progress-low"
  | "participants-high"
  | "participants-low"
  | "raised-high"
  | "raised-low";

/**
 * Progress level categories for filtering projects by funding progress
 * Used to group projects by their completion status for easier discovery
 *
 * - `"all"`: Show all projects regardless of progress
 * - `"low"`: Projects with 0-32% progress (early stage)
 * - `"medium"`: Projects with 33-65% progress (mid stage)
 * - `"high"`: Projects with 66-99% progress (near completion)
 * - `"completed"`: Projects with 100% progress (fully funded)
 */
export type ProgressFilter = "all" | "low" | "medium" | "high" | "completed";

/**
 * Interface for managing project filtering and sorting state
 * Contains all filter and sort options used in project dashboards and listings
 * Used by components that need to filter and sort project lists
 *
 * @example
 * ```typescript
 * const filters: ProjectFilters = {
 *   searchQuery: "DeFi",
 *   selectedCategory: "defi",
 *   sortBy: "newest",
 *   progressFilter: "all"
 * };
 * ```
 */
export interface ProjectFilters {
  /** Text search query for filtering projects by name, description, or creator */
  searchQuery: string;
  /** Selected category filter for showing only projects in specific categories */
  selectedCategory: ProjectCategoryFilter;
  /** Selected sorting option for ordering the project list */
  sortBy: ProjectSortOption;
  /** Selected progress filter for showing projects at specific funding stages */
  progressFilter: ProgressFilter;
}

/**
 * Interface for project creation form data
 * Contains all required fields for creating a new launchpad project
 * Used by create project forms and project submission APIs
 */
export interface CreateProjectData {
  /** Project name for display and identification */
  name: string;
  /** Detailed project description explaining the concept and value proposition */
  description: string;
  /** Project category for classification and filtering */
  category: ProjectCategory;
  /** Target funding amount in USD for the project */
  targetAmount: number;
  /** Initial token price in USD */
  initialPrice: number;
  /** Total token supply for the project */
  totalSupply: number;
  /** Project website URL for additional information */
  websiteUrl?: string;
  /** Social media links for project promotion */
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
}

/**
 * Interface for project analytics and metrics
 * Contains calculated metrics and statistics for project performance
 * Used for displaying analytics dashboards and performance tracking
 */
export interface ProjectAnalytics {
  /** Total number of unique investors in the project */
  totalInvestors: number;
  /** Total amount invested in USD */
  totalInvested: number;
  /** Average investment amount per investor in USD */
  averageInvestment: number;
  /** Project's current ranking based on various metrics */
  ranking: number;
  /** Price change percentage over different time periods */
  priceChange: {
    hour: number;
    day: number;
    week: number;
    month: number;
  };
  /** Trading volume over different time periods in USD */
  volume: {
    hour: number;
    day: number;
    week: number;
    month: number;
  };
}

/**
 * Interface for user investment data
 * Contains information about a user's investment in a specific project
 * Used for portfolio tracking and investment management
 */
export interface UserInvestment {
  /** Project ID that the user has invested in */
  projectId: string;
  /** Amount invested by the user in USD */
  amountInvested: number;
  /** Number of tokens purchased by the user */
  tokensPurchased: number;
  /** Average price paid per token in USD */
  averagePrice: number;
  /** Current value of the investment in USD */
  currentValue: number;
  /** Profit/loss percentage for this investment */
  profitLossPercentage: number;
  /** Date when the investment was made */
  investmentDate: string;
  /** Whether the investment is still active (not sold) */
  isActive: boolean;
}
