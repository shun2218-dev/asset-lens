CREATE TABLE "inquiry_reply" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"admin_email" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiry_reply" ADD CONSTRAINT "inquiry_reply_inquiry_id_contact_inquiry_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."contact_inquiry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inquiry_reply_inquiry_id_idx" ON "inquiry_reply" USING btree ("inquiry_id");