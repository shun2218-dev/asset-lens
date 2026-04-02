CREATE TABLE "contact_inquiry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"note" text,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_inquiry_status_idx" ON "contact_inquiry" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_inquiry_created_at_idx" ON "contact_inquiry" USING btree ("created_at");