/**
 * Governance API endpoints
 *
 * Provides methods to interact with governance backend endpoints
 * Based on: https://github.com/canopy-network/launchpad/tree/main/docs/endpoints
 */

import { apiClient } from "./client";
import {
    GetProposalsRequest,
    GetProposalsResponse,
    VoteProposalRequest,
    VoteProposalResponse,
} from "@/types/governance";

/**
 * Governance API methods
 */
export const governanceApi = {
    /**
     * Get governance proposals
     * GET /api/v1/governance/proposals
     *
     * @param params - Query parameters for filtering proposals
     * @returns List of governance proposals
     */
    getProposals: async (
        params?: GetProposalsRequest
    ): Promise<GetProposalsResponse> => {
        const response = await apiClient.get<GetProposalsResponse>(
            "/api/v1/governance/proposals",
            params
        );
        return response.data;
    },

    /**
     * Get a single proposal by ID
     * GET /api/v1/governance/proposals/:id
     *
     * @param id - Proposal ID
     * @returns Proposal details
     */
    getProposal: async (id: number): Promise<any> => {
        const response = await apiClient.get(`/api/v1/governance/proposals/${id}`);
        return response.data;
    },

    /**
     * Vote on a proposal
     * POST /api/v1/governance/proposals/:id/vote
     *
     * @param proposalId - Proposal ID
     * @param data - Vote request data
     * @returns Vote response
     */
    voteProposal: async (
        proposalId: number,
        data: VoteProposalRequest
    ): Promise<VoteProposalResponse> => {
        const response = await apiClient.post<VoteProposalResponse>(
            `/api/v1/governance/proposals/${proposalId}/vote`,
            data
        );
        return response.data;
    },

    /**
     * Get user's voting power
     * GET /api/v1/governance/voting-power
     *
     * @param address - Wallet address
     * @param chainId - Optional chain ID
     * @returns Voting power information
     */
    getVotingPower: async (
        address: string,
        chainId?: number
    ): Promise<any> => {
        const response = await apiClient.get("/api/v1/governance/voting-power", {
            address,
            chain_id: chainId,
        });
        return response.data;
    },
};

