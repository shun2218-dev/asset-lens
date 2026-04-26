ALTER TABLE "category" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "category" DROP CONSTRAINT "category_userId_user_id_fk";
--> statement-breakpoint
DROP INDEX "budget_userId_categoryId_idx";--> statement-breakpoint
DROP INDEX "transaction_tag_txn_idx";--> statement-breakpoint
DROP INDEX "category_userId_idx";--> statement-breakpoint
ALTER TABLE "transaction_tag" ADD CONSTRAINT "transaction_tag_transaction_id_tag_id_pk" PRIMARY KEY("transaction_id","tag_id");--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "budget_userId_categoryId_unique" ON "budget" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "transactions_categoryId_idx" ON "transaction" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "category_userId_idx" ON "category" USING btree ("user_id");