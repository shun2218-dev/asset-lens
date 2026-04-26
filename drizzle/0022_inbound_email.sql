ALTER TABLE "inquiry_reply" ADD COLUMN "direction" text DEFAULT 'outbound' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiry_reply" RENAME COLUMN "admin_email" TO "sender_email";
