"use client";

import { useEffect, useMemo, useState } from "react";
import {
  emptyMockStakingData,
  getMockStakingData,
  type MockWalletStakingData,
} from "@/lib/mockdata/staking";

interface UseMockStakingOptions {
  enabled?: boolean;
}

export function useMockStaking(
  address?: string,
  options?: UseMockStakingOptions
) {
  const isEnabled = options?.enabled !== false;
  const [data, setData] = useState<MockWalletStakingData>(() =>
    isEnabled ? getMockStakingData(address) : emptyMockStakingData
  );
  const [isLoading, setIsLoading] = useState<boolean>(isEnabled);

  useEffect(() => {
    if (!isEnabled) {
      setData(emptyMockStakingData);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      setData(getMockStakingData(address));
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [address, isEnabled]);

  const totalInterestEarned = useMemo(() => {
    return data.earningsHistory.reduce((sum, day) => {
      const dayTotal = day.transactions.reduce(
        (daySum, tx) => daySum + tx.amountUSD,
        0
      );
      return sum + dayTotal;
    }, 0);
  }, [data.earningsHistory]);

  const activeStakes = useMemo(
    () => data.stakes.filter((stake) => stake.amount > 0),
    [data.stakes]
  );

  return {
    data,
    isLoading,
    totalInterestEarned,
    activeStakesCount: activeStakes.length,
    unstakingCount: data.unstaking.length,
  };
}

