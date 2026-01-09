import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../../common/decorators/user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ListPlansDto } from './dto/list-plans.dto';
import { BillingPlanResponseDto } from './dto/billing-plan-response.dto';
import { PaymentSessionResponseDto } from './dto/payment-session-response.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@ApiTags('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('products')
  @ApiOperation({ summary: 'Create a billing product' })
  @ApiCreatedResponse({ description: 'Product created.' })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.paymentsService.createProduct(dto);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Create a billing plan' })
  @ApiCreatedResponse({ description: 'Plan created.', type: BillingPlanResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.paymentsService.createPlan(dto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List billing plans' })
  @ApiOkResponse({ description: 'Plans list.', type: [BillingPlanResponseDto] })
  async listPlans(@Query() dto: ListPlansDto) {
    return this.paymentsService.listPlans(dto);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Create a one-time checkout session' })
  @ApiBearerAuth('JWT')
  @ApiCreatedResponse({
    description: 'Checkout session created.',
    type: PaymentSessionResponseDto,
  })
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @User() user?: JwtPayload,
  ) {
    return this.paymentsService.createCheckoutSession(dto, user);
  }

  @Post('subscriptions')
  @ApiOperation({ summary: 'Create a subscription checkout session' })
  @ApiBearerAuth('JWT')
  @ApiCreatedResponse({
    description: 'Subscription session created.',
    type: PaymentSessionResponseDto,
  })
  async createSubscription(
    @Body() dto: CreateSubscriptionDto,
    @User() user?: JwtPayload,
  ) {
    return this.paymentsService.createSubscriptionSession(dto, user);
  }

  @Post('webhooks/stripe')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook' })
  @ApiOkResponse({ description: 'Webhook received.' })
  async stripeWebhook(@Req() req: Request & { rawBody?: Buffer }) {
    const signature = req.headers['stripe-signature'];
    if (!signature || Array.isArray(signature)) {
      throw new BadRequestException('Missing Stripe signature.');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body.');
    }

    return this.paymentsService.handleStripeWebhook(rawBody, signature);
  }

  @Post('webhooks/paypal')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayPal webhook (placeholder)' })
  @ApiOkResponse({ description: 'Webhook received.' })
  async paypalWebhook() {
    return this.paymentsService.handlePaypalWebhook();
  }
}
