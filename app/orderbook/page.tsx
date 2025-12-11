// Force SSR for this page
export const dynamic = "force-dynamic";

import TradingModule from "@/components/trading/trading-module";
import { Container } from "@/components/layout/container";

export default function OrderBookPage() {
  return (
    <Container>
      <TradingModule variant="trade" />
    </Container>
  );
}
