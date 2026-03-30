CREATE INDEX "budget_userId_categoryId_idx" ON "budget" USING btree ("user_id","category_id");--> statement-breakpoint
CREATE INDEX "category_userId_idx" ON "category" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "transactions_userId_date_idx" ON "transaction" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "transactions_userId_storeName_idx" ON "transaction" USING btree ("user_id","store_name");