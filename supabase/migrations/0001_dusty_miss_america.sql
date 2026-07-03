ALTER TABLE "opportunities" ADD COLUMN "source_url" text;--> statement-breakpoint
CREATE INDEX "interactions_company_id_idx" ON "interactions" USING btree ("company_id");