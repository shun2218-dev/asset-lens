ALTER TABLE "transaction" ALTER COLUMN "category_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_template" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_template" ADD CONSTRAINT "transaction_template_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "transaction_template" DROP COLUMN "category";