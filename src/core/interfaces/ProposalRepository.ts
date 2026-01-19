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
     * Find proposals received by a user (deprecated in favor of more specific ones if needed, but keeping for compatibility)
     */
    findByRecipientId(recipientId: string): Promise<Proposal[]>;

    /**
     * Find proposals sent by a user
     */
    findByProposerId(proposerId: string): Promise<Proposal[]>;

    /**
     * Find proposals between two specific users
     */
    findByUsers(user1Id: string, user2Id: string): Promise<Proposal | null>;

    /**
     * Find proposals by recipient and answer status
     */
    findByRecipientAndStatus(recipientId: string, status: string): Promise<Proposal[]>;
    delete(id: string): Promise<void>;
}
