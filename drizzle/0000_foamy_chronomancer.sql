CREATE TABLE "DeletionLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"userType" text NOT NULL,
	"mediaCount" integer NOT NULL,
	"deletedBy" text NOT NULL,
	"reason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"size" integer NOT NULL,
	"ownerId" text NOT NULL,
	"ownerType" text NOT NULL,
	"app" text NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	CONSTRAINT "Media_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE INDEX "Media_ownerId_ownerType_idx" ON "Media" USING btree ("ownerId","ownerType");--> statement-breakpoint
CREATE INDEX "Media_app_idx" ON "Media" USING btree ("app");--> statement-breakpoint
CREATE INDEX "Media_createdAt_idx" ON "Media" USING btree ("createdAt");