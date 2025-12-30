import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Droplets, ArrowLeft } from "lucide-react";

export default function PoolNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="p-4 bg-muted rounded-full">
          <Droplets className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Pool Not Found</h1>
          <p className="text-muted-foreground">
            The liquidity pool you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Link href="/liquidity">
          <Button className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Liquidity Pools
          </Button>
        </Link>
      </div>
    </div>
  );
}
