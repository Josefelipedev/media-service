import { Injectable } from '@nestjs/common';
import { and, eq, type SQL } from 'drizzle-orm';
import { DatabaseService } from '../../infra/database/database.service';
import {
  billingPlan,
  billingProduct,
  paymentCustomer,
  paymentSubscription,
  paymentTransaction,
  paymentWebhookEvent,
  type BillingPlanRow,
  type BillingProductRow,
  type NewBillingPlan,
  type NewBillingProduct,
  type NewPaymentCustomer,
  type NewPaymentSubscription,
  type NewPaymentTransaction,
  type NewPaymentWebhookEvent,
  type PaymentCustomerRow,
  type PaymentSubscriptionRow,
  type PaymentTransactionRow,
} from '../../infra/database/schema';

@Injectable()
export class PaymentsRepository {
  constructor(private readonly database: DatabaseService) {}

  async createProduct(data: NewBillingProduct): Promise<BillingProductRow> {
    const [row] = await this.database.db
      .insert(billingProduct)
      .values(data)
      .returning();
    return row;
  }

  async createPlan(data: NewBillingPlan): Promise<BillingPlanRow> {
    const [row] = await this.database.db
      .insert(billingPlan)
      .values(data)
      .returning();
    return row;
  }

  async findPlanById(planId: string): Promise<BillingPlanRow | null> {
    const [row] = await this.database.db
      .select()
      .from(billingPlan)
      .where(eq(billingPlan.id, planId));
    return row ?? null;
  }

  async listPlans(params: {
    app?: string;
    provider?: string;
    active?: boolean;
  }): Promise<BillingPlanRow[]> {
    const conditions: SQL[] = [];
    if (params.app) {
      conditions.push(eq(billingPlan.app, params.app));
    }
    if (params.provider) {
      conditions.push(eq(billingPlan.provider, params.provider));
    }
    if (typeof params.active === 'boolean') {
      conditions.push(eq(billingPlan.active, params.active));
    }

    const query = this.database.db.select().from(billingPlan);
    if (conditions.length) {
      return query.where(and(...conditions));
    }
    return query;
  }

  async findCustomer(params: {
    app: string;
    ownerId: string;
    ownerType: string;
    provider: string;
  }): Promise<PaymentCustomerRow | null> {
    const [row] = await this.database.db
      .select()
      .from(paymentCustomer)
      .where(
        and(
          eq(paymentCustomer.app, params.app),
          eq(paymentCustomer.ownerId, params.ownerId),
          eq(paymentCustomer.ownerType, params.ownerType),
          eq(paymentCustomer.provider, params.provider),
        ),
      );
    return row ?? null;
  }

  async createCustomer(data: NewPaymentCustomer): Promise<PaymentCustomerRow> {
    const [row] = await this.database.db
      .insert(paymentCustomer)
      .values(data)
      .returning();
    return row;
  }

  async updateCustomer(
    id: string,
    data: Partial<NewPaymentCustomer>,
  ): Promise<PaymentCustomerRow> {
    const [row] = await this.database.db
      .update(paymentCustomer)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentCustomer.id, id))
      .returning();
    return row;
  }

  async createTransaction(
    data: NewPaymentTransaction,
  ): Promise<PaymentTransactionRow> {
    const [row] = await this.database.db
      .insert(paymentTransaction)
      .values(data)
      .returning();
    return row;
  }

  async updateTransactionByProviderId(params: {
    provider: string;
    providerPaymentId: string;
    status: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentTransactionRow | null> {
    const [row] = await this.database.db
      .update(paymentTransaction)
      .set({
        status: params.status,
        metadata: params.metadata,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(paymentTransaction.provider, params.provider),
          eq(paymentTransaction.providerPaymentId, params.providerPaymentId),
        ),
      )
      .returning();
    return row ?? null;
  }

  async createSubscription(
    data: NewPaymentSubscription,
  ): Promise<PaymentSubscriptionRow> {
    const [row] = await this.database.db
      .insert(paymentSubscription)
      .values(data)
      .returning();
    return row;
  }

  async updateSubscriptionByProviderId(params: {
    provider: string;
    providerSubscriptionId: string;
    status?: string;
    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
  }): Promise<PaymentSubscriptionRow | null> {
    const [row] = await this.database.db
      .update(paymentSubscription)
      .set({
        status: params.status,
        currentPeriodEnd: params.currentPeriodEnd ?? undefined,
        cancelAtPeriodEnd: params.cancelAtPeriodEnd ?? undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(paymentSubscription.provider, params.provider),
          eq(
            paymentSubscription.providerSubscriptionId,
            params.providerSubscriptionId,
          ),
        ),
      )
      .returning();
    return row ?? null;
  }

  async findWebhookEvent(params: {
    provider: string;
    eventId: string;
  }): Promise<boolean> {
    const [row] = await this.database.db
      .select({ id: paymentWebhookEvent.id })
      .from(paymentWebhookEvent)
      .where(
        and(
          eq(paymentWebhookEvent.provider, params.provider),
          eq(paymentWebhookEvent.eventId, params.eventId),
        ),
      );
    return Boolean(row);
  }

  async createWebhookEvent(data: NewPaymentWebhookEvent): Promise<void> {
    await this.database.db.insert(paymentWebhookEvent).values(data);
  }
}
