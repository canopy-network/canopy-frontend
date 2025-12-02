"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountPortfolio } from "./account-portfolio";
import { AccountTransactions } from "./account-transactions";
import { AccountPositions } from "./account-positions";
import type { AddressResponse } from "@/types/addresses";

interface AccountDetailsProps {
  address: string;
  apiData?: AddressResponse;
}

export function AccountDetails({ address, apiData }: AccountDetailsProps) {
  return (
    <Tabs defaultValue="portfolio" className="w-full">
      <TabsList
        variant="outline"
        className="flex justify-start gap-2  rounded-lg"
      >
        <TabsTrigger value="portfolio" size="sm" variant="outline">
          Portfolio
        </TabsTrigger>
        <TabsTrigger value="transactions" size="sm" variant="outline">
          Transactions
        </TabsTrigger>
        <TabsTrigger value="positions" size="sm" variant="outline">
          LP Positions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="portfolio" className="mt-4">
        <AccountPortfolio address={address} apiData={apiData} />
      </TabsContent>

      <TabsContent value="transactions" className="mt-4">
        <AccountTransactions address={address} />
      </TabsContent>

      <TabsContent value="positions" className="mt-4">
        <AccountPositions address={address} />
      </TabsContent>
    </Tabs>
  );
}
