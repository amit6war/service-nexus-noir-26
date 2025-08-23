
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useShoppingCart();
  const { toast } = useToast();

  useEffect(() => {
    // Clear cart after successful payment
    const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
    if (pendingItems) {
      clearCart();
      sessionStorage.removeItem('pendingCheckoutItems');
      sessionStorage.removeItem('pendingCheckoutAddress');
      
      toast({
        title: 'Payment Successful!',
        description: 'Your booking has been confirmed and will appear in your bookings shortly.',
      });
    }
  }, [clearCart, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Thank you for your payment. Your booking has been confirmed and you will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Your bookings will appear in the "My Bookings" section of your dashboard.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/customer-dashboard')} className="bg-teal hover:bg-teal/90">
                View Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/customer-dashboard?tab=bookings')}>
                View Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
