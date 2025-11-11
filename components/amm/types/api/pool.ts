export interface DailyGraduationProgress {
  date: string; // Date in YYYY-MM-DD format
  cnpy_reserve: number; // CNPY reserve at end of day
  graduation_threshold: number; // Target threshold for graduation
  progress_percentage: number; // Percentage towards graduation
  cnpy_increase: number; // Daily CNPY reserve increase
  percentage_increase: number; // Daily percentage point increase
}

export interface GraduatedPool {
  id: string;
  chain_id: number;
  cnpy_reserve: number;
  token_reserve: number;
  current_price_cnpy: number;
  market_cap_usd: number;
  total_volume_cnpy: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VirtualPool {
  id: string;
  chain_id: number;
  cnpy_reserve: number;
  token_reserve: number;
  current_price_cnpy: number;
  market_cap_usd: number;
  total_volume_cnpy: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  graduation_progress?: DailyGraduationProgress[];

  // Computed 24h metrics
  price_24h_change_percent?: number | null;
  volume_24h_cnpy?: number | null;
  high_24h_cnpy?: number | null;
  low_24h_cnpy?: number | null;
}
