import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../../../shared/infrastructure/config/postgres.config.js';

export interface UserSubscription {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerCellphone: string;
  customerTaxId: string;
  abacatepayCustomerId: string | null;
  abacatepayBillingId: string | null;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  planId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionInput {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerCellphone: string;
  customerTaxId: string;
}

interface UserSubscriptionRow {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_cellphone: string;
  customer_tax_id: string;
  abacatepay_customer_id: string | null;
  abacatepay_billing_id: string | null;
  status: UserSubscription['status'];
  plan_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findByUserId(userId: string): Promise<UserSubscription | null> {
    const result = await this.postgresService.query<UserSubscriptionRow>(
      'SELECT * FROM user_subscriptions WHERE user_id = $1',
      [userId],
    );

    if (result.rows.length === 0) return null;

    return this.toSubscription(result.rows[0]);
  }

  async create(input: CreateSubscriptionInput): Promise<UserSubscription> {
    const result = await this.postgresService.query<UserSubscriptionRow>(
      `INSERT INTO user_subscriptions (user_id, customer_name, customer_email, customer_cellphone, customer_tax_id, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.userId,
        input.customerName,
        input.customerEmail.toLowerCase(),
        input.customerCellphone,
        input.customerTaxId,
        'pending',
      ],
    );

    return this.toSubscription(result.rows[0]);
  }

  async updateBillingId(userId: string, billingId: string): Promise<void> {
    await this.postgresService.query(
      'UPDATE user_subscriptions SET abacatepay_billing_id = $1, updated_at = NOW() WHERE user_id = $2',
      [billingId, userId],
    );
  }

  async updateStatus(userId: string, status: UserSubscription['status']): Promise<void> {
    await this.postgresService.query(
      'UPDATE user_subscriptions SET status = $1, updated_at = NOW() WHERE user_id = $2',
      [status, userId],
    );
  }

  async findByBillingId(billingId: string): Promise<UserSubscription | null> {
    const result = await this.postgresService.query<UserSubscriptionRow>(
      'SELECT * FROM user_subscriptions WHERE abacatepay_billing_id = $1',
      [billingId],
    );

    if (result.rows.length === 0) return null;

    return this.toSubscription(result.rows[0]);
  }

  async findByEmail(email: string): Promise<UserSubscription | null> {
    const result = await this.postgresService.query<UserSubscriptionRow>(
      'SELECT * FROM user_subscriptions WHERE customer_email = $1',
      [email.toLowerCase()],
    );

    if (result.rows.length === 0) return null;

    return this.toSubscription(result.rows[0]);
  }

  async upsert(input: CreateSubscriptionInput): Promise<UserSubscription> {
    const existing = await this.findByUserId(input.userId);

    if (existing) {
      const result = await this.postgresService.query<UserSubscriptionRow>(
        `UPDATE user_subscriptions
         SET customer_name = $1,
             customer_email = $2,
             customer_cellphone = $3,
             customer_tax_id = $4,
             updated_at = NOW()
         WHERE user_id = $5
         RETURNING *`,
        [
          input.customerName,
          input.customerEmail.toLowerCase(),
          input.customerCellphone,
          input.customerTaxId,
          input.userId,
        ],
      );

      return this.toSubscription(result.rows[0]);
    }

    return this.create(input);
  }

  private toSubscription(row: UserSubscriptionRow): UserSubscription {
    return {
      id: row.id,
      userId: row.user_id,
      customerName: row.customer_name,
      customerEmail: row.customer_email,
      customerCellphone: row.customer_cellphone,
      customerTaxId: row.customer_tax_id,
      abacatepayCustomerId: row.abacatepay_customer_id,
      abacatepayBillingId: row.abacatepay_billing_id,
      status: row.status,
      planId: row.plan_id,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }
}
