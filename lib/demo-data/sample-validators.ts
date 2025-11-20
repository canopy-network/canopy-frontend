import { ChainDescriptor } from "./sample-transactions";

export type CommitteeStake = {
  committeeId: number;
  stake: number; // in CNPY
  percentage: number; // percentage of total network stake
};

export type SampleValidator = {
  id: string;
  address: string; // validator address/ID
  name: string;
  chain: ChainDescriptor;
  status: "Online" | "Offline" | "Jailed";
  stake: number; // in USD
  blocks: number;
  uptime: number; // percentage
  apr: number; // percentage
  rewards: number; // in CNPY
  // Detail page fields
  url?: string; // validator URL
  committees: number[]; // committee IDs
  rank: number; // validator rank
  autoCompound: boolean; // auto-compound enabled
  maxPausedHeight?: number; // max paused height, null if not paused
  unstakingHeight?: number; // unstaking height, null if not unstaking
  totalDelegated: number; // total delegated stake in CNPY
  committeeStakes: CommitteeStake[]; // stake by committee
  totalNetworkControl: number; // percentage of total network stake
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

const validatorNames = [
  "val-01",
  "val-02",
  "val-03",
  "val-04",
  "val-05",
  "validator-alpha",
  "validator-beta",
  "staking-pro",
  "enterprise-secure",
  "community-node",
];

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

const randomAddress = () => {
  const hex = randomHex(40);
  return hex;
};

const generateValidators = (count = 200): SampleValidator[] => {
  const validators: SampleValidator[] = [];

  for (let index = 0; index < count; index++) {
    const chain = chainCatalog[index % chainCatalog.length];
    const nameIndex = index % validatorNames.length;
    const validatorNumber = (index % validatorNames.length) + 1;
    const name =
      validatorNames[nameIndex] ===
      `val-${String(validatorNumber).padStart(2, "0")}`
        ? validatorNames[nameIndex]
        : `${validatorNames[nameIndex]}-${validatorNumber}`;

    // Most validators are online, some offline, few jailed
    const statusRoll = rand();
    let status: SampleValidator["status"];
    if (statusRoll < 0.85) {
      status = "Online";
    } else if (statusRoll < 0.95) {
      status = "Offline";
    } else {
      status = "Jailed";
    }

    const address = randomAddress();
    const totalStakeCnpy = Number((rand() * 5000000 + 1000000).toFixed(2)); // 1M - 6M CNPY
    const stakeUsd = Number((totalStakeCnpy * 0.1).toFixed(1)); // Approximate USD conversion
    const numCommittees = Math.floor(rand() * 3) + 1; // 1-3 committees
    const committees = Array.from({ length: numCommittees }, (_, i) => i + 1);
    const totalNetworkControl = Number((rand() * 5 + 5).toFixed(2)); // 5% - 10%

    // Generate committee stakes
    const committeeStakes: CommitteeStake[] = committees.map((committeeId) => ({
      committeeId,
      stake: totalStakeCnpy, // Same stake across all committees for simplicity
      percentage: totalNetworkControl,
    }));

    validators.push({
      id: `validator-${index}`,
      address,
      name,
      chain,
      status,
      stake: stakeUsd,
      blocks: Math.floor(rand() * 50000 + 10000), // 10K - 60K blocks
      uptime: Number((rand() * 5 + 95).toFixed(1)), // 95% - 100%
      apr: Number((rand() * 5 + 6).toFixed(1)), // 6% - 11%
      rewards: Number((rand() * 50000 + 10000).toFixed(2)), // 10K - 60K CNPY
      url: `tcp://validator-${name.toLowerCase().replace(/\s+/g, "")}.com`,
      committees,
      rank: index + 1,
      autoCompound: rand() > 0.3, // 70% have auto-compound enabled
      maxPausedHeight: rand() > 0.9 ? Math.floor(rand() * 100000) : undefined,
      unstakingHeight: rand() > 0.95 ? Math.floor(rand() * 100000) : undefined,
      totalDelegated: totalStakeCnpy,
      committeeStakes,
      totalNetworkControl,
    });
  }

  return validators;
};

const SAMPLE_VALIDATORS = generateValidators();

export const getSampleValidators = () => SAMPLE_VALIDATORS;

export const getSampleValidator = (id: string) =>
  SAMPLE_VALIDATORS.find((validator) => validator.id === id);

export const getSampleValidatorByAddress = (address: string) =>
  SAMPLE_VALIDATORS.find((validator) => validator.address === address);
