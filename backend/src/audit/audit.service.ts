import { Injectable } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';

type AuditEvent = {
  actorId: string;
  action: 'CLASS_CREATED' | 'CLASS_JOINED';
  resourceType: 'SchoolClass';
  resourceId: string;
};

@Injectable()
export class AuditService {
  // Business change and audit event must commit together. Extend the explicit
  // action allowlist when adding moderation/admin commands, never accept it from DTOs.
  record(tx: Prisma.TransactionClient, event: AuditEvent) {
    return tx.auditLog.create({ data: { actorId: event.actorId, action: event.action, resourceType: event.resourceType, resourceId: event.resourceId } });
  }
}
