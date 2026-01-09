import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';
import { StripeService } from './providers/stripe.service';
import { PaypalService } from './providers/paypal.service';
import { DatabaseModule } from '../../infra/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepository, StripeService, PaypalService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
