
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PaymentSummary {
  totalSpending: number;
  totalRefunded: number;
  recentPayments: PaymentRecord[];
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  refund_amount: number;
  processed_at: string;
  booking_number?: string;
  service_title?: string;
}

const AmountSection = () => {
  const [summary, setSummary] = useState<PaymentSummary>({
    totalSpending: 0,
    totalRefunded: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPaymentSummary();
    }
  }, [user]);

  // Set up real-time subscription for payments updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `customer_id=eq.${user.id}`
        },
        () => {
          console.log('Payment change detected, refreshing amount section...');
          loadPaymentSummary();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadPaymentSummary = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch payment data with booking details - real-time update
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          currency,
          payment_status,
          refund_amount,
          processed_at,
          created_at,
          booking_id
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading payment summary:', error);
        toast({
          title: 'Error',
          description: 'Failed to load payment information. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      // Calculate totals
      const totalSpending = payments?.reduce((sum, payment) => {
        return payment.payment_status === 'completed' ? sum + (payment.amount || 0) : sum;
      }, 0) || 0;

      const totalRefunded = payments?.reduce((sum, payment) => {
        return sum + (payment.refund_amount || 0);
      }, 0) || 0;

      // Get booking details for each payment
      const recentPayments: PaymentRecord[] = [];
      
      for (const payment of payments || []) {
        let booking_number = '';
        let service_title = 'Service';
        
        if (payment.booking_id) {
          const { data: booking } = await supabase
            .from('bookings')
            .select('booking_number, services(title)')
            .eq('id', payment.booking_id)
            .maybeSingle();
          
          if (booking) {
            booking_number = booking.booking_number;
            service_title = (booking as any).services?.title || 'Service';
          }
        }
        
        recentPayments.push({
          id: payment.id,
          amount: payment.amount || 0,
          currency: payment.currency || 'USD',
          payment_status: payment.payment_status,
          refund_amount: payment.refund_amount || 0,
          processed_at: payment.processed_at || payment.created_at || '',
          booking_number,
          service_title
        });
      }

      setSummary({
        totalSpending,
        totalRefunded,
        recentPayments
      });

    } catch (error) {
      console.error('Error loading payment summary:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while loading payment information.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Amount</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Amount</h1>
        <p className="text-muted-foreground">Track your spending and refunds</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${summary.totalSpending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              From completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ${summary.totalRefunded.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Refunds received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary.recentPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payment history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">
                        {payment.service_title || 'Service'}
                      </span>
                      <Badge 
                        variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}
                        className={payment.payment_status === 'completed' ? 'bg-teal text-white' : ''}
                      >
                        {payment.payment_status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {payment.processed_at ? format(new Date(payment.processed_at), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                      {payment.booking_number && (
                        <span>#{payment.booking_number}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">
                      ${payment.amount.toFixed(2)}
                    </div>
                    {payment.refund_amount > 0 && (
                      <div className="text-sm text-orange-500">
                        Refunded: ${payment.refund_amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AmountSection;
