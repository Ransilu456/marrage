/**
 * Repository Interface: ProposalRepository
 * 
 * Defines the contract for proposal data persistence.
 * This interface is framework-agnostic and can be implemented
 * using any data storage mechanism (Prisma, MongoDB, in-memory, etc.)
 */

import { Proposal } from '../entities/Proposal';

export interface IProposalRepository {
    /**
     * Save a proposal (create or update)
     */
    save(proposal: Proposal): Promise<Proposal>;

    /**
     * Find a proposal by ID
     */
    findById(id: string): Promise<Proposal | null>;

    /**
     * Find the latest proposal
     * Useful for single-proposal scenarios
     */
    findLatest(): Promise<Proposal | null>;

    /**
     * Find all proposals (optional, for future expansion)
     */
    findAll?(): Promise<Proposal[]>;

    /**
     * Find all proposals received by a user
     */
    findByRecipientId(recipientId: string): Promise<Proposal[]>;

    /**
     * Find proposals by recipient and answer status
     */
    findByRecipientAndStatus(recipientId: string, status: string): Promise<Proposal[]>;
}
