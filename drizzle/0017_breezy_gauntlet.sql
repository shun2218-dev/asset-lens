CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_tag" (
	"transaction_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tag" ADD CONSTRAINT "transaction_tag_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tag" ADD CONSTRAINT "transaction_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tag_userId_idx" ON "tag" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transaction_tag_txn_idx" ON "transaction_tag" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "transaction_tag_tag_idx" ON "transaction_tag" USING btree ("tag_id");