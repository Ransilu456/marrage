/**
 * Email Service Interface
 * 
 * Defines the contract for sending email notifications.
 * This interface allows for easy swapping between mock and real email services.
 */

import { Proposal } from '../entities/Proposal';

export interface IEmailService {
    /**
     * Send notification when proposal is accepted
     */
    sendProposalAccepted(proposal: Proposal): Promise<void>;

    /**
     * Send notification when proposal is declined (optional)
     */
    sendProposalDeclined?(proposal: Proposal): Promise<void>;
}
