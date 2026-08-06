-- Add ID document fields to Users table for farmer verification
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "IdDocumentType" varchar(30);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "IdDocumentFrontUrl" varchar(500);
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "IdDocumentBackUrl" varchar(500);
