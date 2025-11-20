type TransactionMethod = "Transfer" | "Swap" | "Stake" | "Contract";

export type ChainDescriptor = {
  id: string;
  name: string;
  ticker: string;
  branding: string;
};

export type InternalTransaction = {
  id: string;
  from: string;
  to: string;
  value: number;
  type: "call" | "transfer";
};

export type SampleTransaction = {
  id: string;
  hash: string;
  chain: ChainDescriptor;
  blockHeight: number;
  method: TransactionMethod;
  from: string;
  to: string;
  timestamp: string;
  amountCnpy: number;
  tokenAmount: number;
  value: number;
  gasUsed: number;
  gasPriceGwei: number;
  transactionFeeCnpy: number;
  internalTransactions: InternalTransaction[];
  logs: string[];
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

const methods: TransactionMethod[] = ["Transfer", "Swap", "Stake", "Contract"];

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

const randomAddress = () => `0x${randomHex(40)}`;

const randomHash = () => `0x${randomHex(64)}`;

const buildInternalTransactions = (hash: string, index: number) => {
  const count = index % 3;
  if (count === 0) {
    return [];
  }

  return Array.from({ length: count }, (_, internalIndex) => {
    const offset = internalIndex + 1;
    return {
      id: `${hash}-internal-${offset}`,
      from: randomAddress(),
      to: randomAddress(),
      value: Number((rand() * 2).toFixed(3)),
      type: internalIndex % 2 === 0 ? "transfer" : "call",
    };
  });
};

const buildLogs = (hash: string, index: number) => {
  return [
    `Event ${index % 5}: Transfer(${hash.slice(
      0,
      10
    )}..., ${randomAddress()}, ${randomAddress()[2]})`,
    `Processed by validator-${(index % 12) + 1}, gasUsed=${52000 + index * 17}`,
  ];
};

const generateTransactions = (count = 200): SampleTransaction[] => {
  return Array.from({ length: count }, (_, index) => {
    const chain = chainCatalog[index % chainCatalog.length];
    const method = methods[index % methods.length];
    const minutesAgo = (index + 1) * 3;
    const hash = randomHash();
    const gasUsed = 45000 + (index % 50) * 327;
    const gasPriceGwei = Number((rand() * 2 + 1).toFixed(3));
    const transactionFeeCnpy = Number(
      ((gasUsed * gasPriceGwei) / 10 ** 8).toFixed(3)
    );
    const timestamp = new Date(
      Date.now() - minutesAgo * 60 * 1000
    ).toISOString();

    return {
      id: `tx-${index}`,
      chain,
      hash,
      blockHeight: 34000 + index * 7,
      method,
      from: randomAddress(),
      to: randomAddress(),
      timestamp,
      amountCnpy: Number((rand() * 20000 + 2000).toFixed(2)),
      tokenAmount: Number((rand() * 2).toFixed(3)),
      value: index % 4 === 0 ? 0 : Number((rand() * 3).toFixed(4)),
      gasUsed,
      gasPriceGwei,
      transactionFeeCnpy,
      internalTransactions: buildInternalTransactions(hash, index),
      logs: buildLogs(hash, index),
    };
  });
};

const SAMPLE_TRANSACTIONS = generateTransactions();

export const getSampleTransactions = () => SAMPLE_TRANSACTIONS;

export const getSampleTransaction = (hash: string) =>
  SAMPLE_TRANSACTIONS.find((transaction) => transaction.hash === hash);

export type { TransactionMethod };
