/**
 * Email Service Implementations
 * 
 * Provides both mock (development) and real (production) email services.
 */

import { Proposal } from '../../core/entities/Proposal';
import { IEmailService } from '../../core/interfaces/EmailService';

/**
 * Mock Email Service for Development
 * Logs email notifications to console instead of sending real emails
 */
export class MockEmailService implements IEmailService {
    async sendProposalAccepted(proposal: Proposal): Promise<void> {
        console.log('📧 [MOCK EMAIL] Proposal Accepted!');
        console.log('━'.repeat(50));
        console.log(`To: ${process.env.EMAIL_TO || 'you@example.com'}`);
        console.log(`From: ${process.env.EMAIL_FROM || 'noreply@proposal.com'}`);
        console.log(`Subject: 🎉 SHE SAID YES! 💍`);
        console.log('');
        console.log(`Dear Future Spouse,`);
        console.log('');
        console.log(`User ${proposal.recipientId} has accepted your proposal! 💕`);
        console.log('');
        if (proposal.message) {
            console.log(`Her message: "${proposal.message}"`);
            console.log('');
        }
        console.log(`Proposal ID: ${proposal.id}`);
        console.log(`Accepted at: ${proposal.updatedAt?.toLocaleString()}`);
        console.log('');
        console.log('Congratulations! 🥳🎊');
        console.log('━'.repeat(50));
    }

    async sendProposalDeclined(proposal: Proposal): Promise<void> {
        console.log('📧 [MOCK EMAIL] Proposal Response Received');
        console.log('━'.repeat(50));
        console.log(`To: ${process.env.EMAIL_TO || 'you@example.com'}`);
        console.log(`From: ${process.env.EMAIL_FROM || 'noreply@proposal.com'}`);
        console.log(`Subject: Proposal Response`);
        console.log('');
        console.log(`User ${proposal.recipientId} has responded to your proposal.`);
        console.log('');
        if (proposal.message) {
            console.log(`Message: "${proposal.message}"`);
        }
        console.log('━'.repeat(50));
    }
}

/**
 * Real Email Service for Production
 * 
 * This is a template for integrating with a real email service.
 * Uncomment and configure based on your chosen email provider:
 * - SendGrid
 * - Resend
 * - Nodemailer with SMTP
 * - AWS SES
 */
export class RealEmailService implements IEmailService {
    async sendProposalAccepted(proposal: Proposal): Promise<void> {
        // Example using Resend (install: npm install resend)
        /*
        import { Resend } from 'resend';
        const resend = new Resend(process.env.RESEND_API_KEY);
    
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: process.env.EMAIL_TO!,
          subject: '🎉 SHE SAID YES! 💍',
          html: `
            <h1>Congratulations! 🥳</h1>
            <p>${proposal.recipientName} has accepted your proposal! 💕</p>
            ${proposal.message ? `<p><strong>Her message:</strong> "${proposal.message}"</p>` : ''}
            <p><small>Proposal ID: ${proposal.id}</small></p>
            <p><small>Accepted at: ${proposal.updatedAt?.toLocaleString()}</small></p>
          `,
        });
        */

        // For now, fall back to mock
        console.warn('Real email service not configured. Using mock service.');
        const mockService = new MockEmailService();
        await mockService.sendProposalAccepted(proposal);
    }

    async sendProposalDeclined(proposal: Proposal): Promise<void> {
        // Implement similar to sendProposalAccepted
        const mockService = new MockEmailService();
        await mockService.sendProposalDeclined(proposal);
    }
}

/**
 * Factory function to get the appropriate email service
 */
export function getEmailService(): IEmailService {
    const useMock = process.env.USE_MOCK_EMAIL !== 'false';
    return useMock ? new MockEmailService() : new RealEmailService();
}
