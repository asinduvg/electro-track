-- Add password column with a secure default for existing users
-- Users with this default password should be forced to change it on first login
ALTER TABLE "users" ADD COLUMN "password" text NOT NULL DEFAULT 'changeme123!A';