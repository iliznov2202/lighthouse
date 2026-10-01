CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL,
  "actorId" UUID NOT NULL,
  "action" VARCHAR(100) NOT NULL,
  "resourceType" VARCHAR(50) NOT NULL,
  "resourceId" UUID NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_resourceType_resourceId_createdAt_idx" ON "AuditLog"("resourceType", "resourceId", "createdAt");

-- Application cannot overwrite or remove historical audit events.
CREATE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only';
END;
$$;
CREATE TRIGGER audit_log_append_only
BEFORE UPDATE OR DELETE OR TRUNCATE ON "AuditLog"
FOR EACH STATEMENT EXECUTE FUNCTION reject_audit_mutation();
