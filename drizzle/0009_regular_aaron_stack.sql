ALTER TABLE "account" ALTER COLUMN "access_token_expires_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "refresh_token_expires_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "passkey" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "expires_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "next_payment_date" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DATA TYPE timestamp (0) with time zone;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET DEFAULT now();