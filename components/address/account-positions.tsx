"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface AccountPositionsProps {
  address: string;
}

// Placeholder function - will be replaced with actual API call
async function fetchPositions(address: string) {
  // TODO: Replace with actual API call
  return [];
}

export function AccountPositions({ address }: AccountPositionsProps) {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPositions() {
      try {
        const data = await fetchPositions(address);
        setPositions(data);
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPositions();
  }, [address]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading positions...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">LP Positions</h3>
      <div className="text-center py-12 text-muted-foreground">
        LP Positions component - Coming soon
      </div>
    </Card>
  );
}
