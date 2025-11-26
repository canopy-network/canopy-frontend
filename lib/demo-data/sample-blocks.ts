import { ChainDescriptor } from "./sample-transactions";

export type SampleBlock = {
  id: string;
  number: number;
  hash: string;
  chain: ChainDescriptor;
  timestamp: string;
  transactions: number;
  block_producer: string;
  gas_used: number;
  block_time?: number; // Time in seconds since previous block
};

const chainCatalog: ChainDescriptor[] = [
  {
    id: "chris-testing",
    name: "Chris is Testing",
    ticker: "$CNPY",
    branding: "/placeholder-logo.svg",
  },
  {
    id: "aperture",
    name: "Aperture Network",
    ticker: "$CNPY",
    branding: "/images/logo.svg",
  },
  {
    id: "solaris",
    name: "Solaris Chain",
    ticker: "$CNPY",
    branding: "/placeholder-logo.svg",
  },
  {
    id: "atlas",
    name: "Atlas Labs",
    ticker: "$CNPY",
    branding: "/placeholder-logo.svg",
  },
];

const createDeterministicRandom = (seed = 1337) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
};

const rand = createDeterministicRandom(913846);

const randomHex = (length: number) => {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    const digit = Math.floor(rand() * 16)
      .toString(16)
      .padStart(1, "0");
    value += digit;
  }
  return value;
};

const randomHash = () => `0x${randomHex(64)}`;

const randomProducer = () => {
  const producers = [
    "blockchain",
    "validator-01",
    "validator-02",
    "validator-03",
    "validator-04",
  ];
  return producers[Math.floor(rand() * producers.length)];
};

const generateBlocks = (count = 200): SampleBlock[] => {
  const now = Date.now();
  const blocks: SampleBlock[] = [];

  for (let index = 0; index < count; index++) {
    const chain = chainCatalog[index % chainCatalog.length];
    const minutesAgo = index * 0.5; // Blocks every 30 seconds
    const timestamp = new Date(now - minutesAgo * 60 * 1000).toISOString();
    const blockNumber = 34562 - index;

    // Calculate block time (time since previous block)
    const blockTime = index === 0 ? 2.5 : 1.5 + rand() * 2; // 1.5-3.5 seconds

    blocks.push({
      id: `block-${index}`,
      number: blockNumber,
      chain,
      hash: randomHash(),
      timestamp,
      transactions: Math.floor(rand() * 500) + 1,
      block_producer: randomProducer(),
      gas_used: Number((rand() * 50000 + 10000).toFixed(2)),
      block_time: blockTime,
    });
  }

  return blocks;
};

const SAMPLE_BLOCKS = generateBlocks();

export const getSampleBlocks = () => SAMPLE_BLOCKS;

export const getSampleBlock = (number: number) =>
  SAMPLE_BLOCKS.find((block) => block.number === number);
