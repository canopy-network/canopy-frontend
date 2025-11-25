/**
 * Governance types for Canopy frontend
 *
 * Based on governance system requirements and wireframe design
 */

/**
 * Proposal status
 */
export type ProposalStatus = "active" | "passed" | "failed";

/**
 * Proposal urgency level
 */
export type ProposalUrgency = "urgent" | "normal";

/**
 * Vote type
 */
export type VoteType = "for" | "against";

/**
 * Governance proposal
 */
export interface GovernanceProposal {
    id: number;
    title: string;
    chainId: number;
    description: string;
    status: ProposalStatus;
    urgency: ProposalUrgency;
    endsIn?: string; // e.g., "2 days"
    votesFor: number; // Percentage
    votesAgainst: number; // Percentage
    totalVotes: number; // Total token amount
    userVote: VoteType | null;
    proposedBy: string; // Address
    createdAt: string; // ISO timestamp or relative time
    endDate: string; // ISO timestamp or formatted date
    quorumReached: boolean;
    quorumNeeded: number; // Percentage
    summary?: string; // Detailed proposal summary
    impact?: string; // Impact description
    votingPower?: number; // User's voting power for this proposal
}

/**
 * Request to get proposals
 */
export interface GetProposalsRequest {
    chain_ids?: number[]; // Filter by chain IDs
    status?: ProposalStatus; // Filter by status
    address?: string; // Wallet address to get user votes
    page?: number;
    limit?: number;
}

/**
 * Response from getting proposals
 */
export interface GetProposalsResponse {
    proposals: GovernanceProposal[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

/**
 * Request to vote on a proposal
 */
export interface VoteProposalRequest {
    proposal_id: number;
    vote: VoteType;
    address: string; // Voter address
    password?: string; // Wallet password for signing
}

/**
 * Response from voting
 */
export interface VoteProposalResponse {
    success: boolean;
    transaction_hash?: string;
    message?: string;
}

/**
 * Voting power by chain
 */
export interface VotingPowerByChain {
    chainId: number;
    chainName: string;
    chainColor: string;
    balance: number; // Voting power amount
    symbol: string;
}

