CREATE TABLE "BillingPlan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app" text NOT NULL,
	"productId" uuid NOT NULL,
	"name" text NOT NULL,
	"interval" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"provider" text NOT NULL,
	"providerPriceId" text,
	"active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "BillingProduct" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"provider" text NOT NULL,
	"providerProductId" text,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentCustomer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app" text NOT NULL,
	"ownerId" text NOT NULL,
	"ownerType" text NOT NULL,
	"email" text,
	"provider" text NOT NULL,
	"providerCustomerId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentSubscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app" text NOT NULL,
	"ownerId" text NOT NULL,
	"ownerType" text NOT NULL,
	"provider" text NOT NULL,
	"providerSubscriptionId" text,
	"planId" uuid NOT NULL,
	"status" text NOT NULL,
	"currentPeriodEnd" timestamp,
	"cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentTransaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app" text NOT NULL,
	"ownerId" text NOT NULL,
	"ownerType" text NOT NULL,
	"provider" text NOT NULL,
	"providerPaymentId" text,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "PaymentWebhookEvent" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"eventId" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"payload" jsonb NOT NULL,
	"receivedAt" timestamp DEFAULT now() NOT NULL,
	"processedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "BillingPlan" ADD CONSTRAINT "BillingPlan_productId_BillingProduct_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."BillingProduct"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "PaymentSubscription" ADD CONSTRAINT "PaymentSubscription_planId_BillingPlan_id_fk" FOREIGN KEY ("planId") REFERENCES "public"."BillingPlan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "BillingPlan_app_idx" ON "BillingPlan" USING btree ("app");--> statement-breakpoint
CREATE INDEX "BillingPlan_productId_idx" ON "BillingPlan" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "PaymentCustomer_owner_idx" ON "PaymentCustomer" USING btree ("ownerId","ownerType","app");--> statement-breakpoint
CREATE INDEX "PaymentSubscription_owner_idx" ON "PaymentSubscription" USING btree ("ownerId","ownerType","app");--> statement-breakpoint
CREATE INDEX "PaymentTransaction_owner_idx" ON "PaymentTransaction" USING btree ("ownerId","ownerType","app");--> statement-breakpoint
CREATE INDEX "PaymentWebhookEvent_provider_idx" ON "PaymentWebhookEvent" USING btree ("provider","eventId");