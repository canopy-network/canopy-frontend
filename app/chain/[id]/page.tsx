import { ChainDetails } from "@/components/chain/chain-details"

interface ChainPageProps {
  params: {
    id: string
  }
}

export default function ChainPage({ params }: ChainPageProps) {
  return <ChainDetails chainId={params.id} />
}
