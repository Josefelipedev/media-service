import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq } from 'drizzle-orm';
import * as schema from './schema';

type ProductSeed = {
  app: string;
  name: string;
  description?: string;
  provider: string;
};

type PlanSeed = {
  app: string;
  productName: string;
  name: string;
  interval: string;
  amount: number;
  currency: string;
  provider: string;
};

const provider = 'stripe';
const defaultCurrency = process.env.PAYMENTS_DEFAULT_CURRENCY || 'brl';

const products: ProductSeed[] = [
  {
    app: 'webchat',
    name: 'Webchat',
    description: 'Webchat core plans.',
    provider,
  },
  {
    app: 'finance',
    name: 'Finance',
    description: 'Finance core plans.',
    provider,
  },
];

const plans: PlanSeed[] = [
  {
    app: 'webchat',
    productName: 'Webchat',
    name: 'Webchat Starter Monthly',
    interval: 'month',
    amount: 4900,
    currency: defaultCurrency,
    provider,
  },
  {
    app: 'webchat',
    productName: 'Webchat',
    name: 'Webchat Pro Monthly',
    interval: 'month',
    amount: 9900,
    currency: defaultCurrency,
    provider,
  },
  {
    app: 'finance',
    productName: 'Finance',
    name: 'Finance Basic Monthly',
    interval: 'month',
    amount: 7900,
    currency: defaultCurrency,
    provider,
  },
  {
    app: 'finance',
    productName: 'Finance',
    name: 'Finance Plus Monthly',
    interval: 'month',
    amount: 14900,
    currency: defaultCurrency,
    provider,
  },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set.');
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    for (const product of products) {
      const [existing] = await db
        .select()
        .from(schema.billingProduct)
        .where(
          and(
            eq(schema.billingProduct.app, product.app),
            eq(schema.billingProduct.name, product.name),
            eq(schema.billingProduct.provider, product.provider),
          ),
        );

      if (!existing) {
        await db.insert(schema.billingProduct).values({
          app: product.app,
          name: product.name,
          description: product.description,
          provider: product.provider,
          active: true,
          updatedAt: new Date(),
        });
      }
    }

    for (const plan of plans) {
      const [productRow] = await db
        .select()
        .from(schema.billingProduct)
        .where(
          and(
            eq(schema.billingProduct.app, plan.app),
            eq(schema.billingProduct.name, plan.productName),
            eq(schema.billingProduct.provider, plan.provider),
          ),
        );

      if (!productRow) {
        continue;
      }

      const [existingPlan] = await db
        .select()
        .from(schema.billingPlan)
        .where(
          and(
            eq(schema.billingPlan.app, plan.app),
            eq(schema.billingPlan.name, plan.name),
            eq(schema.billingPlan.provider, plan.provider),
          ),
        );

      if (!existingPlan) {
        await db.insert(schema.billingPlan).values({
          app: plan.app,
          productId: productRow.id,
          name: plan.name,
          interval: plan.interval,
          amount: plan.amount,
          currency: plan.currency,
          provider: plan.provider,
          active: true,
          metadata: { seeded: true },
          updatedAt: new Date(),
        });
      }
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
