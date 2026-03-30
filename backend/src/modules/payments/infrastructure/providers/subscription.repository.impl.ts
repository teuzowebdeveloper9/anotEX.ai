import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

@Injectable()
export class SubscriptionRepository {
  private readonly supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async findByUserId(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerCellphone: data.customer_cellphone,
      customerTaxId: data.customer_tax_id,
      abacatepayCustomerId: data.abacatepay_customer_id,
      abacatepayBillingId: data.abacatepay_billing_id,
      status: data.status,
      planId: data.plan_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async create(input: CreateSubscriptionInput): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .insert({
        user_id: input.userId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_cellphone: input.customerCellphone,
        customer_tax_id: input.customerTaxId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      id: data.id,
      userId: data.user_id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerCellphone: data.customer_cellphone,
      customerTaxId: data.customer_tax_id,
      abacatepayCustomerId: data.abacatepay_customer_id,
      abacatepayBillingId: data.abacatepay_billing_id,
      status: data.status,
      planId: data.plan_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateBillingId(userId: string, billingId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({ abacatepay_billing_id: billingId, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateStatus(userId: string, status: UserSubscription['status']): Promise<void> {
    const { error } = await this.supabase
      .from('user_subscriptions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async findByBillingId(billingId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('abacatepay_billing_id', billingId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      customerName: data.customer_name,
      customerEmail: data.customer_email,
      customerCellphone: data.customer_cellphone,
      customerTaxId: data.customer_tax_id,
      abacatepayCustomerId: data.abacatepay_customer_id,
      abacatepayBillingId: data.abacatepay_billing_id,
      status: data.status,
      planId: data.plan_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async upsert(input: CreateSubscriptionInput): Promise<UserSubscription> {
    const existing = await this.findByUserId(input.userId);

    if (existing) {
      const { data, error } = await this.supabase
        .from('user_subscriptions')
        .update({
          customer_name: input.customerName,
          customer_email: input.customerEmail,
          customer_cellphone: input.customerCellphone,
          customer_tax_id: input.customerTaxId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', input.userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        id: data.id,
        userId: data.user_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerCellphone: data.customer_cellphone,
        customerTaxId: data.customer_tax_id,
        abacatepayCustomerId: data.abacatepay_customer_id,
        abacatepayBillingId: data.abacatepay_billing_id,
        status: data.status,
        planId: data.plan_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }

    return this.create(input);
  }
}
