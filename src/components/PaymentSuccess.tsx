
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useToast } from '@/hooks/use-toast';
import BookingResultModal from './BookingResultModal';
import { useAuth } from '@/hooks/useAuth';

const PAYMENT_PROCESSED_FLAG = 'payment_success_processed';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { clearCart } = useShoppingCart();
  const { toast } = useToast();

  const [processing, setProcessing] = useState(true);
  const [bookingsCreated, setBookingsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const hasProcessedRef = useRef(false);

  const processPaymentSuccess = async () => {
    // Check if already processed in this session
    if (hasProcessedRef.current || sessionStorage.getItem(PAYMENT_PROCESSED_FLAG) === 'true') {
      console.log('✅ Payment already processed, showing success state');
      setBookingsCreated(true);
      setShowModal(true);
      setProcessing(false);
      return;
    }

    if (!user?.id) {
      console.log('❌ User not authenticated');
      setError('You are not signed in. Please sign in to view your bookings.');
      setShowModal(true);
      setProcessing(false);
      return;
    }

    // Check for payment intent success from URL
    const paymentIntentId = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
    
    console.log('🔍 Payment Success URL params:', {
      paymentIntentId,
      hasClientSecret: !!paymentIntentClientSecret
    });

    if (!paymentIntentId || !paymentIntentClientSecret) {
      // Check if there's pending checkout data
      const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
      const pendingAddress = sessionStorage.getItem('pendingCheckoutAddress');
      
      if (pendingItems && pendingAddress) {
        console.log('⚠️ Found pending data but no payment confirmation - possible navigation issue');
        setError('Payment confirmation not received. Please contact support if you were charged.');
      } else {
        console.log('❌ No payment confirmation or pending data found');
        setError('No payment session found. Please contact support if you were charged.');
      }
      setShowModal(true);
      setProcessing(false);
      return;
    }

    try {
      hasProcessedRef.current = true;
      console.log('🔄 Processing payment success with Payment Intent:', paymentIntentId);

      // Verify the payment was successful using Stripe
      const stripe = (window as any).Stripe?.(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (stripe) {
        const { paymentIntent } = await stripe.retrievePaymentIntent(paymentIntentClientSecret);
        
        if (paymentIntent.status === 'succeeded') {
          console.log('✅ Payment confirmed by Stripe as succeeded');
          
          // Mark as processed to avoid duplicates
          sessionStorage.setItem(PAYMENT_PROCESSED_FLAG, 'true');
          
          // Clear cart and session data
          clearCart();
          sessionStorage.removeItem('pendingCheckoutItems');
          sessionStorage.removeItem('pendingCheckoutAddress');
          sessionStorage.removeItem('checkoutTimestamp');
          
          setBookingsCreated(true);
          
          toast({
            title: 'Payment Successful!',
            description: 'Your bookings are being created. You will receive confirmation emails shortly.',
          });
          
          console.log('🎉 Payment success process completed');
        } else {
          throw new Error(`Payment status: ${paymentIntent.status}`);
        }
      } else {
        // Fallback: assume success based on URL presence
        console.log('⚠️ Stripe not loaded, assuming success based on URL params');
        
        sessionStorage.setItem(PAYMENT_PROCESSED_FLAG, 'true');
        clearCart();
        sessionStorage.removeItem('pendingCheckoutItems');
        sessionStorage.removeItem('pendingCheckoutAddress');
        sessionStorage.removeItem('checkoutTimestamp');
        
        setBookingsCreated(true);
        
        toast({
          title: 'Payment Received!',
          description: 'Your bookings are being processed. You will receive confirmation emails shortly.',
        });
      }
      
      setShowModal(true);
      
    } catch (error) {
      console.error('❌ Error processing payment success:', error);
      setError(`Payment verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowModal(true);
      
      toast({
        title: 'Payment Verification Failed',
        description: 'There was an issue confirming your payment. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleViewBookings = () => {
    navigate('/customer-dashboard?tab=bookings');
  };

  const handleViewDashboard = () => {
    navigate('/customer-dashboard');
  };

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent');
    
    console.log('🚀 PaymentSuccess mounted:', {
      authLoading,
      userId: user?.id,
      paymentIntentId,
      currentUrl: window.location.href
    });

    if (!authLoading && user?.id && paymentIntentId) {
      console.log('✅ All conditions met, processing payment success');
      processPaymentSuccess();
    } else if (!authLoading && !user?.id) {
      console.log('❌ User not authenticated');
      setError('You are not signed in. Please sign in to view your bookings.');
      setShowModal(true);
      setProcessing(false);
    } else if (!authLoading && user?.id && !paymentIntentId) {
      console.log('❌ No payment intent ID found');
      setError('Invalid payment confirmation. Please contact support if you were charged.');
      setShowModal(true);
      setProcessing(false);
    }
  }, [authLoading, user?.id, searchParams]);

  // Show loading state
  if (processing && !showModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Preparing your account...' : 'Confirming your payment and creating bookings...'}
          </p>
        </div>
      </div>
    );
  }

  // Show result modal
  if (showModal) {
    return (
      <BookingResultModal
        type={bookingsCreated ? 'success' : 'error'}
        title={bookingsCreated ? 'Payment Successful!' : 'Payment Issue'}
        message={
          bookingsCreated
            ? 'Thank you for your payment! Your bookings have been created and you will receive confirmation emails shortly. Our team will process your requests and contact you with further details.'
            : 'There was an issue with your payment confirmation.'
        }
        errorDetails={error || undefined}
        onViewBookings={handleViewBookings}
        onGoToDashboard={handleViewDashboard}
        isRetrying={false}
        retryAttempts={0}
      />
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
