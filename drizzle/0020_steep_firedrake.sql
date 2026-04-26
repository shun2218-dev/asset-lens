CREATE TABLE "savings_goal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"target_amount" integer NOT NULL,
	"current_amount" integer DEFAULT 0 NOT NULL,
	"deadline" date,
	"icon" text DEFAULT 'piggy-bank' NOT NULL,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "savings_goal" ADD CONSTRAINT "savings_goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "savings_goal_userId_idx" ON "savings_goal" USING btree ("user_id");