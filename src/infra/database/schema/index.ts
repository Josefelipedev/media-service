import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { deletionLog } from './deletion-log';
import { media } from './media';
import { billingPlan } from './payments/billing-plan';
import { billingProduct } from './payments/billing-product';
import { paymentCustomer } from './payments/payment-customer';
import { paymentSubscription } from './payments/payment-subscription';
import { paymentTransaction } from './payments/payment-transaction';
import { paymentWebhookEvent } from './payments/payment-webhook-event';

export {
  deletionLog,
  media,
  billingPlan,
  billingProduct,
  paymentCustomer,
  paymentSubscription,
  paymentTransaction,
  paymentWebhookEvent,
};

export type MediaRow = InferSelectModel<typeof media>;
export type NewMedia = InferInsertModel<typeof media>;
export type DeletionLogRow = InferSelectModel<typeof deletionLog>;
export type NewDeletionLog = InferInsertModel<typeof deletionLog>;
export type BillingProductRow = InferSelectModel<typeof billingProduct>;
export type NewBillingProduct = InferInsertModel<typeof billingProduct>;
export type BillingPlanRow = InferSelectModel<typeof billingPlan>;
export type NewBillingPlan = InferInsertModel<typeof billingPlan>;
export type PaymentCustomerRow = InferSelectModel<typeof paymentCustomer>;
export type NewPaymentCustomer = InferInsertModel<typeof paymentCustomer>;
export type PaymentSubscriptionRow = InferSelectModel<typeof paymentSubscription>;
export type NewPaymentSubscription = InferInsertModel<typeof paymentSubscription>;
export type PaymentTransactionRow = InferSelectModel<typeof paymentTransaction>;
export type NewPaymentTransaction = InferInsertModel<typeof paymentTransaction>;
export type PaymentWebhookEventRow = InferSelectModel<typeof paymentWebhookEvent>;
export type NewPaymentWebhookEvent = InferInsertModel<typeof paymentWebhookEvent>;
