import { Container } from "@/components/layout/container";
import { OrderBookDashboard } from "@/components/orderbook/orderbook-dashboard";

export default function OrderBookPage() {
  return (
    <Container type="boxed">
      <OrderBookDashboard />
    </Container>
  );
}
