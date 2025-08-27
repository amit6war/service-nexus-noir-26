
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useBookingsActions } from '@/hooks/useBookingsActions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const PaymentSuccessHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearCart, items: cartItems } = useShoppingCart();
  const { createBookingsFromCart } = useBookingsActions();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!sessionId || !user?.id) {
        setError('Missing payment session or user authentication');
        setProcessing(false);
        return;
      }

      try {
        console.log('🔄 Processing payment success for session:', sessionId);
        
        // Get pending checkout data from session storage
        const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
        const pendingAddress = sessionStorage.getItem('pendingCheckoutAddress');

        if (!pendingItems || !pendingAddress) {
          console.warn('⚠️ No pending checkout data found, using current cart items');
          
          if (cartItems.length === 0) {
            setError('No items found to create bookings');
            setProcessing(false);
            return;
          }

          // Use current cart items if no pending data
          const defaultAddress = {
            address_line_1: '123 Default St',
            city: 'Default City', 
            state: 'CA',
            postal_code: '12345'
          };

          await createBookingsFromCart(cartItems, defaultAddress, sessionId);
        } else {
          // Use pending checkout data
          const items = JSON.parse(pendingItems);
          const address = JSON.parse(pendingAddress);
          
          await createBookingsFromCart(items, address, sessionId);
        }

        // Clear cart and session data
        console.log('🧹 Clearing cart and session data...');
        clearCart();
        sessionStorage.removeItem('pendingCheckoutItems');
        sessionStorage.removeItem('pendingCheckoutAddress'); 
        sessionStorage.removeItem('checkoutTimestamp');

        setSuccess(true);
        toast({
          title: 'Payment Successful!',
          description: 'Your bookings have been created successfully.',
        });

        console.log('✅ Payment success handling completed');

      } catch (error) {
        console.error('❌ Error processing payment success:', error);
        setError(error instanceof Error ? error.message : 'Failed to process payment');
        
        toast({
          title: 'Booking Creation Failed',
          description: 'Payment was successful, but there was an issue creating your bookings. Please contact support.',
          variant: 'destructive',
        });
      } finally {
        setProcessing(false);
      }
    };

    handlePaymentSuccess();
  }, [sessionId, user, cartItems, createBookingsFromCart, clearCart, toast]);

  const handleViewBookings = () => {
    navigate('/customer-dashboard');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal/5 to-blue/5">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue/10 rounded-full w-16 h-16 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue animate-spin" />
            </div>
            <CardTitle className="text-2xl">Processing Payment</CardTitle>
            <CardDescription>
              Please wait while we confirm your payment and create your bookings...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red/5 to-orange/5">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-red/10 rounded-full w-16 h-16 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Processing Error</CardTitle>
            <CardDescription className="text-red-500">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleContinueShopping} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green/5 to-teal/5">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green/10 rounded-full w-16 h-16 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Your payment has been processed and your bookings have been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleViewBookings} className="w-full bg-teal hover:bg-teal/90">
            View My Bookings
          </Button>
          <Button onClick={handleContinueShopping} variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessHandler;
