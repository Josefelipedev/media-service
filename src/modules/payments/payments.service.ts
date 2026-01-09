import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { StripeService } from './providers/stripe.service';
import { PaypalService } from './providers/paypal.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { ListPlansDto } from './dto/list-plans.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly repository: PaymentsRepository,
    private readonly stripeService: StripeService,
    private readonly paypalService: PaypalService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    return this.repository.createProduct({
      app: dto.app,
      name: dto.name,
      description: dto.description,
      provider: dto.provider,
      providerProductId: dto.providerProductId,
      active: dto.active ?? true,
      updatedAt: new Date(),
    });
  }

  async createPlan(dto: CreatePlanDto) {
    return this.repository.createPlan({
      app: dto.app,
      productId: dto.productId,
      name: dto.name,
      interval: dto.interval,
      amount: dto.amount,
      currency: dto.currency,
      provider: dto.provider,
      providerPriceId: dto.providerPriceId,
      active: dto.active ?? true,
      metadata: dto.metadata,
      updatedAt: new Date(),
    });
  }

  async listPlans(dto: ListPlansDto) {
    return this.repository.listPlans(dto);
  }

  async createCheckoutSession(dto: CreateCheckoutDto, user?: JwtPayload) {
    const plan = await this.repository.findPlanById(dto.planId);
    if (!plan || !plan.active) {
      throw new NotFoundException('Plan not found.');
    }

    if (plan.provider !== 'stripe') {
      throw new BadRequestException('Only Stripe is supported for now.');
    }

    if (!plan.providerPriceId) {
      throw new BadRequestException('Stripe price id is missing.');
    }

    const stripe = this.stripeService.getClient();
    const quantity = dto.quantity ?? 1;
    const customerId = await this.resolveStripeCustomer(plan.app, user);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      customer: customerId ?? undefined,
      line_items: [
        {
          price: plan.providerPriceId,
          quantity,
        },
      ],
      metadata: {
        app: plan.app,
        ownerId: user?.userId ?? 'anonymous',
        ownerType: user?.ownerType ?? 'user',
        planId: plan.id,
        type: 'one_time',
      },
    });

    await this.repository.createTransaction({
      app: plan.app,
      ownerId: user?.userId ?? 'anonymous',
      ownerType: user?.ownerType ?? 'user',
      provider: 'stripe',
      providerPaymentId: session.id,
      type: 'one_time',
      status: 'pending',
      amount: plan.amount * quantity,
      currency: plan.currency,
      metadata: { checkoutUrl: session.url },
      updatedAt: new Date(),
    });

    return { sessionId: session.id, url: session.url ?? '' };
  }

  async createSubscriptionSession(
    dto: CreateSubscriptionDto,
    user?: JwtPayload,
  ) {
    const plan = await this.repository.findPlanById(dto.planId);
    if (!plan || !plan.active) {
      throw new NotFoundException('Plan not found.');
    }

    if (plan.provider !== 'stripe') {
      throw new BadRequestException('Only Stripe is supported for now.');
    }

    if (!plan.providerPriceId) {
      throw new BadRequestException('Stripe price id is missing.');
    }

    const stripe = this.stripeService.getClient();
    const customerId = await this.resolveStripeCustomer(plan.app, user, dto.customerEmail);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      customer: customerId ?? undefined,
      customer_email: customerId ? undefined : dto.customerEmail ?? user?.email,
      line_items: [
        {
          price: plan.providerPriceId,
          quantity: 1,
        },
      ],
      metadata: {
        app: plan.app,
        ownerId: user?.userId ?? 'anonymous',
        ownerType: user?.ownerType ?? 'user',
        planId: plan.id,
        type: 'subscription',
      },
    });

    await this.repository.createSubscription({
      app: plan.app,
      ownerId: user?.userId ?? 'anonymous',
      ownerType: user?.ownerType ?? 'user',
      provider: 'stripe',
      providerSubscriptionId: null,
      planId: plan.id,
      status: 'pending',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    });

    await this.repository.createTransaction({
      app: plan.app,
      ownerId: user?.userId ?? 'anonymous',
      ownerType: user?.ownerType ?? 'user',
      provider: 'stripe',
      providerPaymentId: session.id,
      type: 'subscription',
      status: 'pending',
      amount: plan.amount,
      currency: plan.currency,
      metadata: { checkoutUrl: session.url },
      updatedAt: new Date(),
    });

    return { sessionId: session.id, url: session.url ?? '' };
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const event = this.stripeService.constructEvent(payload, signature);

    if (
      await this.repository.findWebhookEvent({
        provider: 'stripe',
        eventId: event.id,
      })
    ) {
      return { received: true };
    }

    await this.repository.createWebhookEvent({
      provider: 'stripe',
      eventId: event.id,
      type: event.type,
      status: 'processed',
      payload: event as unknown as Record<string, unknown>,
    });

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleStripeCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'invoice.payment_failed':
        await this.handleStripeInvoiceFailed(event.data.object as Stripe.Invoice);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await this.handleStripeSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return { received: true };
  }

  async handlePaypalWebhook() {
    this.paypalService.assertConfigured();
    return { received: true };
  }

  private async resolveStripeCustomer(
    app: string,
    user?: JwtPayload,
    fallbackEmail?: string,
  ): Promise<string | null> {
    if (!user) {
      return null;
    }

    const existing = await this.repository.findCustomer({
      app,
      ownerId: user.userId,
      ownerType: user.ownerType,
      provider: 'stripe',
    });

    if (existing?.providerCustomerId) {
      return existing.providerCustomerId;
    }

    const stripe = this.stripeService.getClient();
    const customer = await stripe.customers.create({
      email: user.email || fallbackEmail,
      metadata: {
        app,
        ownerId: user.userId,
        ownerType: user.ownerType,
      },
    });

    if (existing) {
      await this.repository.updateCustomer(existing.id, {
        providerCustomerId: customer.id,
        email: user.email || fallbackEmail,
      });
    } else {
      await this.repository.createCustomer({
        app,
        ownerId: user.userId,
        ownerType: user.ownerType,
        email: user.email || fallbackEmail,
        provider: 'stripe',
        providerCustomerId: customer.id,
        updatedAt: new Date(),
      });
    }

    return customer.id;
  }

  private async handleStripeCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (!session.id) {
      return;
    }

    await this.repository.updateTransactionByProviderId({
      provider: 'stripe',
      providerPaymentId: session.id,
      status: 'succeeded',
      metadata: {
        paymentIntent: session.payment_intent,
        subscription: session.subscription,
      },
    });

    if (session.mode === 'subscription' && typeof session.subscription === 'string') {
      const updated = await this.repository.updateSubscriptionByProviderId({
        provider: 'stripe',
        providerSubscriptionId: session.subscription,
        status: 'active',
      });

      if (!updated) {
        const metadata = session.metadata ?? {};
        if (metadata.planId && metadata.app && metadata.ownerId && metadata.ownerType) {
          await this.repository.createSubscription({
            app: metadata.app,
            ownerId: metadata.ownerId,
            ownerType: metadata.ownerType,
            provider: 'stripe',
            providerSubscriptionId: session.subscription,
            planId: metadata.planId,
            status: 'active',
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false,
            updatedAt: new Date(),
          });
        }
      }
    }
  }

  private async handleStripeInvoiceFailed(invoice: Stripe.Invoice) {
    const subscriptionId =
      (invoice as Stripe.Invoice & { subscription?: string | null })
        .subscription ?? null;
    if (!subscriptionId || typeof subscriptionId !== 'string') {
      return;
    }

    await this.repository.updateSubscriptionByProviderId({
      provider: 'stripe',
      providerSubscriptionId: subscriptionId,
      status: 'past_due',
    });
  }

  private async handleStripeSubscriptionUpdate(subscription: Stripe.Subscription) {
    const currentPeriodEnd = (
      subscription as Stripe.Subscription & { current_period_end?: number | null }
    ).current_period_end;
    await this.repository.updateSubscriptionByProviderId({
      provider: 'stripe',
      providerSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }
}
