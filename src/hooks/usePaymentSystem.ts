
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatError } from '@/lib/errorFormatter';

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RefundRequest {
  paymentId: string;
  reason?: string;
  amount?: number;
}

export interface PaymentMetrics {
  totalRevenue: number;
  successfulPayments: number;
  failedPayments: number;
  refundedAmount: number;
  disputedAmount: number;
}

export const usePaymentSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = async (params: {
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
    idempotency_key?: string;
  }): Promise<PaymentIntent> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Creating payment intent:', params);

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount: params.amount * 100, // Convert to cents
          currency: params.currency || 'usd',
          metadata: {
            user_id: user.id,
            ...params.metadata
          },
          idempotency_key: params.idempotency_key || `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });

      if (error) {
        console.error('❌ Payment intent creation failed:', error);
        throw new Error(error.message || 'Failed to create payment intent');
      }

      if (!data?.success || !data?.payment_intent) {
        throw new Error('Invalid response from payment service');
      }

      console.log('✅ Payment intent created:', data.payment_intent);
      return data.payment_intent;

    } catch (error) {
      const errorMsg = formatError(error);
      console.error('❌ Payment intent error:', errorMsg);
      setError(errorMsg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const processRefund = async (refundRequest: RefundRequest): Promise<{ success: boolean; refundId?: string }> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Processing refund:', refundRequest);

      const { data, error } = await supabase.functions.invoke('process-refund', {
        body: refundRequest
      });

      if (error) {
        console.error('❌ Refund processing failed:', error);
        throw new Error(error.message || 'Failed to process refund');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Refund processing failed');
      }

      console.log('✅ Refund processed successfully:', data);

      toast({
        title: 'Refund Processed',
        description: `Refund of $${data.amount} has been initiated successfully.`,
      });

      return { success: true, refundId: data.refundId };

    } catch (error) {
      const errorMsg = formatError(error);
      console.error('❌ Refund error:', errorMsg);
      setError(errorMsg);

      toast({
        title: 'Refund Failed',
        description: errorMsg,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (paymentIntentId: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_intent_id', paymentIntentId)
        .eq('customer_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching payment status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Payment status check failed:', error);
      return null;
    }
  };

  const getPaymentHistory = async (limit = 50) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching payment history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Payment history fetch failed:', error);
      return [];
    }
  };

  const getPaymentMetrics = async (): Promise<PaymentMetrics> => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount, payment_status, refund_amount')
        .eq('customer_id', user.id);

      if (error) {
        console.error('❌ Error fetching payment metrics:', error);
        return {
          totalRevenue: 0,
          successfulPayments: 0,
          failedPayments: 0,
          refundedAmount: 0,
          disputedAmount: 0
        };
      }

      const metrics = data?.reduce((acc, payment) => {
        switch (payment.payment_status) {
          case 'completed':
            acc.totalRevenue += payment.amount || 0;
            acc.successfulPayments += 1;
            break;
          case 'failed':
            acc.failedPayments += 1;
            break;
          case 'refunded':
            acc.refundedAmount += payment.refund_amount || 0;
            break;
          case 'disputed':
            acc.disputedAmount += payment.amount || 0;
            break;
        }
        return acc;
      }, {
        totalRevenue: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedAmount: 0,
        disputedAmount: 0
      }) || {
        totalRevenue: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedAmount: 0,
        disputedAmount: 0
      };

      return metrics;
    } catch (error) {
      console.error('❌ Payment metrics fetch failed:', error);
      return {
        totalRevenue: 0,
        successfulPayments: 0,
        failedPayments: 0,
        refundedAmount: 0,
        disputedAmount: 0
      };
    }
  };

  return {
    loading,
    error,
    createPaymentIntent,
    processRefund,
    getPaymentStatus,
    getPaymentHistory,
    getPaymentMetrics
  };
};
