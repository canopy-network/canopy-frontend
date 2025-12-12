// Force SSR for this page
export const dynamic = "force-dynamic";

import { Container } from "@/components/layout/container";
import { OrderBookDashboard } from "@/components/orderbook/orderbook-dashboard";

export default function OrderBookPage() {
  return (
    <Container>
      <OrderBookDashboard />
    </Container>
  );
}
