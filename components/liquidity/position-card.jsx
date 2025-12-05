import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import tokens from "@/data/tokens.json";

// CNPY Logo component
function CnpyLogo({ size = 32 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #1dd13a 0%, #0fa32c 100%)",
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        C
      </span>
    </div>
  );
}

// Token Avatar component
function TokenAvatar({ symbol, size = 32 }) {
  if (symbol === "CNPY") {
    return <CnpyLogo size={size} />;
  }

  const token = tokens.find((t) => t.symbol === symbol);
  const color = token?.brandColor || "#6b7280";

  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    >
      <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
        {symbol.slice(0, 2)}
      </span>
    </div>
  );
}

export default function PositionCard({ position }) {
  // Get token data
  const tokenBData = tokens.find((t) => t.symbol === position.tokenB);

  // Build the pool detail URL
  const poolUrl = `/liquidity/${position.tokenB.toLowerCase()}-${position.tokenA.toLowerCase()}`;

  return (
    <Link href={poolUrl}>
      <Card className="p-4 hover:bg-muted/30 transition-colors group cursor-pointer">
        {/* Header: Pool info */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Pool info */}
          <div className="flex items-center gap-3">
            {/* Token pair avatars */}
            <div className="flex -space-x-2">
              <TokenAvatar symbol={position.tokenB} size={32} />
              <TokenAvatar symbol={position.tokenA} size={32} />
            </div>

            {/* Pool name */}
            <div>
              <div className="font-medium text-sm group-hover:text-primary transition-colors">
                {position.tokenB}/{position.tokenA}
              </div>
              <div className="text-xs text-muted-foreground">
                {tokenBData?.name || position.tokenB}
              </div>
            </div>
          </div>

          {/* Right: Arrow indicator */}
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        {/* Stats row */}
        <div className="flex items-end justify-between mt-4 pt-3 border-t border-border">
          {/* Value */}
          <div>
            <div className="text-xs text-muted-foreground">Value</div>
            <span className="text-lg font-semibold">
              $
              {position.valueUSD.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Fees Earned */}
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Earned</div>
            <span className="text-lg font-semibold text-green-500">
              +${position.earnings.toFixed(2)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
