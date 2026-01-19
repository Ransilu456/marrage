import { prisma } from './prismaClient';
import { Proposal, ProposalAnswer } from '../../core/entities/Proposal';
import { IProposalRepository } from '../../core/interfaces/ProposalRepository';
import type { Proposal as PrismaProposal } from '@prisma/client';

export class ProposalRepositoryPrisma implements IProposalRepository {
  // Save (create or update) a proposal
  async save(proposal: Proposal): Promise<Proposal> {
    const data = {
      proposerId: proposal.proposerId,
      recipientId: proposal.recipientId,
      answer: proposal.answer,
      message: proposal.message,
      updatedAt: proposal.updatedAt || new Date(),
    };

    const saved: PrismaProposal = await prisma.proposal.upsert({
      where: { id: proposal.id },
      update: data,
      create: {
        id: proposal.id,
        ...data,
        createdAt: proposal.createdAt,
      },
    });

    return this.toDomain(saved);
  }

  // Find a proposal by ID
  async findById(id: string): Promise<Proposal | null> {
    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        proposer: { select: { id: true, email: true, name: true } },
        recipient: { select: { id: true, email: true, name: true } },
      },
    });
    return proposal ? this.toDomain(proposal) : null;
  }

  // Find latest proposal
  async findLatest(): Promise<Proposal | null> {
    const proposal = await prisma.proposal.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return proposal ? this.toDomain(proposal) : null;
  }

  // Find proposal between two users
  async findByUsers(user1Id: string, user2Id: string): Promise<Proposal | null> {
    const proposal = await prisma.proposal.findFirst({
      where: {
        OR: [
          { proposerId: user1Id, recipientId: user2Id },
          { proposerId: user2Id, recipientId: user1Id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return proposal ? this.toDomain(proposal) : null;
  }

  // Find proposals by recipient
  async findByRecipientId(recipientId: string): Promise<Proposal[]> {
    const proposals = await prisma.proposal.findMany({
      where: { recipientId },
      include: {
        proposer: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return proposals.map(p => this.toDomain(p));
  }

  // Find proposals by proposer
  async findByProposerId(proposerId: string): Promise<Proposal[]> {
    const proposals = await prisma.proposal.findMany({
      where: { proposerId },
      include: {
        recipient: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return proposals.map(p => this.toDomain(p));
  }

  // Find by recipient and answer status
  async findByRecipientAndStatus(recipientId: string, status: ProposalAnswer): Promise<Proposal[]> {
    const proposals = await prisma.proposal.findMany({
      where: { recipientId, answer: status },
      orderBy: { createdAt: 'desc' },
    });
    return proposals.map(p => this.toDomain(p));
  }

  // Delete proposal
  async delete(id: string): Promise<void> {
    await prisma.proposal.delete({ where: { id } });
  }

  // Convert Prisma model to domain entity
  private toDomain(prismaProposal: PrismaProposal & { proposer?: any; recipient?: any }): Proposal {
    const p = Proposal.fromPersistence({
      id: prismaProposal.id,
      proposerId: prismaProposal.proposerId,
      recipientId: prismaProposal.recipientId,
      answer: prismaProposal.answer as ProposalAnswer,
      message: prismaProposal.message || undefined,
      createdAt: prismaProposal.createdAt,
      updatedAt: prismaProposal.updatedAt,
    });

    if (prismaProposal.proposer) (p as any).props.proposer = prismaProposal.proposer;
    if (prismaProposal.recipient) (p as any).props.recipient = prismaProposal.recipient;

    return p;
  }
}
