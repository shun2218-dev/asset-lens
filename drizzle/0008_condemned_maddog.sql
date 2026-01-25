ALTER TABLE "transaction" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "date" SET DEFAULT now();