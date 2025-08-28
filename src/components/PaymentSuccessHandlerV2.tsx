import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useBookingsActionsV3 } from '@/hooks/useBookingsActionsV3';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccessHandlerV2: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart, loading: cartLoading } = useCart();
  const { createBookingsFromCart } = useBookingsActionsV3();
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

      if (cartLoading) {
        return;
      }

      try {
        console.log('🔄 Processing payment success for session:', sessionId);
        
        const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
        const pendingAddress = sessionStorage.getItem('pendingCheckoutAddress');

        let itemsToProcess = items;
        let addressToUse = {
          address_line_1: '123 Default St',
          city: 'Default City',
          state: 'CA',
          postal_code: '12345'
        };

        if (pendingItems && pendingAddress) {
          itemsToProcess = JSON.parse(pendingItems);
          addressToUse = JSON.parse(pendingAddress);
          console.log('📦 Using pending checkout data');
        } else if (items.length === 0) {
          setError('No items found to create bookings');
          setProcessing(false);
          return;
        }

        console.log('📋 Processing', itemsToProcess.length, 'items for booking creation');

        await createBookingsFromCart({
          items: itemsToProcess,
          address: addressToUse,
          sessionId: sessionId
        });

        console.log('🧹 Clearing session data...');
        sessionStorage.removeItem('pendingCheckoutItems');
        sessionStorage.removeItem('pendingCheckoutAddress');
        sessionStorage.removeItem('checkoutTimestamp');

        setSuccess(true);
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
  }, [sessionId, user, items, cartLoading, createBookingsFromCart, toast]);

  const handleViewBookings = () => {
    navigate('/customer-dashboard');
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (processing || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal/5 to-blue/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue/10 rounded-full w-16 h-16 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-8 h-8 text-blue" />
                </motion.div>
              </div>
              <CardTitle className="text-2xl">Processing Payment</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment and create your bookings...
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red/5 to-orange/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 p-3 bg-red/10 rounded-full w-16 h-16 flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </motion.div>
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green/5 to-teal/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 p-3 bg-green/10 rounded-full w-16 h-16 flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment has been processed and your bookings have been created successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button onClick={handleViewBookings} className="w-full bg-teal hover:bg-teal/90">
                View My Bookings
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button onClick={handleContinueShopping} variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessHandlerV2;
