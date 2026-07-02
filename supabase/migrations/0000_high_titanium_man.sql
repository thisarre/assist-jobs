CREATE TABLE "ai_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"company_id" uuid,
	"contact_id" uuid,
	"type" text NOT NULL,
	"input_text" text NOT NULL,
	"prompt_key" text NOT NULL,
	"output" jsonb NOT NULL,
	"model" text NOT NULL,
	"tokens_used" integer,
	"status" text DEFAULT 'generated' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website" text,
	"linkedin_url" text,
	"industry" text,
	"size" text,
	"location" text,
	"technologies" text[] DEFAULT '{}',
	"hiring_signals" text,
	"notes" text,
	"relationship_status" text DEFAULT 'cold' NOT NULL,
	"score" integer,
	"last_interaction_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"role" text,
	"linkedin_url" text,
	"email" text,
	"phone" text,
	"language" text DEFAULT 'fr' NOT NULL,
	"relationship_strength" text DEFAULT 'unknown' NOT NULL,
	"notes" text,
	"last_interaction_at" timestamp with time zone,
	"next_followup_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"opportunity_id" uuid,
	"company_id" uuid,
	"contact_id" uuid,
	"type" text NOT NULL,
	"direction" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_id" uuid,
	"contact_id" uuid,
	"title" text NOT NULL,
	"source" text,
	"status" text DEFAULT 'detected' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"probability" integer,
	"daily_rate" integer,
	"location" text,
	"remote_policy" text,
	"technologies" text[] DEFAULT '{}',
	"description" text,
	"notes" text,
	"language" text DEFAULT 'fr' NOT NULL,
	"next_action" text,
	"next_followup_at" timestamp with time zone,
	"last_interaction_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taggables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" uuid NOT NULL,
	"taggable_id" uuid NOT NULL,
	"taggable_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"avatar_url" text,
	"profile" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taggables" ADD CONSTRAINT "taggables_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_generations_user_id_idx" ON "ai_generations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ai_generations_type_idx" ON "ai_generations" USING btree ("type");--> statement-breakpoint
CREATE INDEX "companies_user_id_idx" ON "companies" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "companies_name_idx" ON "companies" USING btree ("name");--> statement-breakpoint
CREATE INDEX "contacts_user_id_idx" ON "contacts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "contacts_company_id_idx" ON "contacts" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "interactions_user_id_idx" ON "interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "interactions_opportunity_id_idx" ON "interactions" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "interactions_contact_id_idx" ON "interactions" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "opportunities_user_id_idx" ON "opportunities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "opportunities_status_idx" ON "opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "opportunities_company_id_idx" ON "opportunities" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "opportunities_next_followup_idx" ON "opportunities" USING btree ("next_followup_at");--> statement-breakpoint
CREATE UNIQUE INDEX "taggables_unique_idx" ON "taggables" USING btree ("tag_id","taggable_id","taggable_type");--> statement-breakpoint
CREATE INDEX "taggables_taggable_idx" ON "taggables" USING btree ("taggable_id","taggable_type");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_id_name_idx" ON "tags" USING btree ("user_id","name");