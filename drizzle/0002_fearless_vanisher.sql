ALTER TABLE "passkey" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "passkey" ALTER COLUMN "backed_up" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "passkey" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "passkey_userId_idx" ON "passkey" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentialID_idx" ON "passkey" USING btree ("credential_id");