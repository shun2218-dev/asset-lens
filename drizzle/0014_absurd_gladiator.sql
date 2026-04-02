CREATE TABLE "dismissed_duplicate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id_1" uuid NOT NULL,
	"transaction_id_2" uuid NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dismissed_duplicate" ADD CONSTRAINT "dismissed_duplicate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dismissed_duplicate" ADD CONSTRAINT "dismissed_duplicate_transaction_id_1_transaction_id_fk" FOREIGN KEY ("transaction_id_1") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dismissed_duplicate" ADD CONSTRAINT "dismissed_duplicate_transaction_id_2_transaction_id_fk" FOREIGN KEY ("transaction_id_2") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dismissed_dup_userId_idx" ON "dismissed_duplicate" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dismissed_dup_pair_idx" ON "dismissed_duplicate" USING btree ("transaction_id_1","transaction_id_2");