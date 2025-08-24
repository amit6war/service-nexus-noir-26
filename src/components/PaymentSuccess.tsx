
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useBookingsActions } from '@/hooks/useBookingsActions';
import { useToast } from '@/hooks/use-toast';
import BookingResultModal from './BookingResultModal';
import { useAuth } from '@/hooks/useAuth';
import { formatError } from '@/lib/errorFormatter';

const PAYMENT_PROCESSED_FLAG = 'payment_success_processed';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { clearCart } = useShoppingCart();
  const { createBookingsFromCart } = useBookingsActions();
  const { toast } = useToast();

  const [creating, setCreating] = useState(false);
  const [bookingsCreated, setBookingsCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Prevent duplicate execution (StrictMode double-mounts + reloads)
  const hasTriggeredRef = useRef(false);

  const processPaymentSuccess = async (isRetry = false) => {
    // Guard if already processed in this session and not a retry
    if (!isRetry && (hasTriggeredRef.current || sessionStorage.getItem(PAYMENT_PROCESSED_FLAG) === 'true')) {
      console.log('ℹ️ Payment success already processed. Showing success state.');
      setBookingsCreated(true);
      setShowModal(true);
      return;
    }

    // Require authenticated user
    if (!user?.id) {
      console.log('❌ Cannot process without authenticated user');
      setError('You are not signed in. Please sign in to finalize your bookings.');
      setShowModal(true);
      return;
    }

    // Get stored checkout data created before redirecting to Stripe
    const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
    const pendingAddress = sessionStorage.getItem('pendingCheckoutAddress');

    console.log('🔄 Processing payment success - pendingItems:', !!pendingItems, 'pendingAddress:', !!pendingAddress);

    if (!pendingItems || !pendingAddress) {
      console.log('❌ No pending checkout data found');
      setError('No payment data found to create bookings. If you were charged, contact support.');
      setShowModal(true);
      return;
    }

    // Extract session_id from URL parameters
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      console.log('❌ No session_id found in URL parameters');
      setError('Invalid payment session. Please contact support if you were charged.');
      setShowModal(true);
      return;
    }
  
    try {
      hasTriggeredRef.current = true;
      setCreating(true);
      setError(null);
      console.log('🧾 User:', user.id, '🔄 Creating bookings after successful payment with session:', sessionId);
  
      const items = JSON.parse(pendingItems);
      const address = JSON.parse(pendingAddress);
  
      console.log('📝 Creating bookings with items:', items.length, 'address:', address, 'sessionId:', sessionId);
  
      // Create bookings with confirmed status
      await createBookingsFromCart(items, address, sessionId);
  
      console.log('✅ Bookings created successfully with confirmed status');

      // Mark processed to avoid duplicates on refresh
      sessionStorage.setItem(PAYMENT_PROCESSED_FLAG, 'true');

      // Clear cart and temp data AFTER successful booking creation
      console.log('🧹 Clearing cart and session data...');
      
      // Clear the cart first (localStorage)
      clearCart();
      
      // Then clear session storage
      sessionStorage.removeItem('pendingCheckoutItems');
      sessionStorage.removeItem('pendingCheckoutAddress');
      sessionStorage.removeItem('checkoutTimestamp');

      // Set success state
      setBookingsCreated(true);
      setShowModal(true);

      toast({
        title: 'Payment & Booking Successful!',
        description: `${items.length} booking${items.length !== 1 ? 's' : ''} created with confirmed status.`,
      });

      console.log('🎉 Payment success process completed successfully');
    } catch (err) {
      const friendly = formatError(err);
      console.error('❌ Error creating bookings after payment:', err, '->', friendly);
      setError(`Booking creation failed: ${friendly}`);
      setShowModal(true);
  
      toast({
        title: 'Booking Creation Failed',
        description: 'Your payment was processed successfully, but we encountered an issue creating your bookings. Our team has been notified and will process a refund within 3-5 business days if needed.',
        variant: 'destructive',
        duration: 10000,
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRetry = async () => {
    // Allow new attempt
    sessionStorage.removeItem(PAYMENT_PROCESSED_FLAG);

    if (retryAttempts >= 3) {
      toast({
        title: 'Maximum Retries Reached',
        description: 'Please contact support for assistance. We will ensure your payment is properly handled.',
        variant: 'destructive',
      });
      return;
    }

    setRetryAttempts((prev) => prev + 1);
    await processPaymentSuccess(true);
  };

  const handleViewBookings = () => {
    navigate('/customer-dashboard?tab=bookings');
  };

  const handleViewDashboard = () => {
    navigate('/customer-dashboard');
  };

  // Only proceed when auth is ready and user is known
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    console.log('🚀 PaymentSuccess mounted. Auth loading:', authLoading, 'User:', !!user, 'SessionId:', !!sessionId);
    
    if (!authLoading && user?.id && sessionId) {
      processPaymentSuccess();
    } else if (!authLoading && !user) {
      setError('You are not signed in. Please sign in to view your bookings.');
      setShowModal(true);
    } else if (!authLoading && user?.id && !sessionId) {
      setError('No payment session found. Please contact support if you were charged.');
      setShowModal(true);
    }
  }, [authLoading, user?.id, searchParams]);

  // Show loading state if still processing
  if ((authLoading || creating) && !showModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authLoading ? 'Preparing your account...' : 'Processing your payment and creating bookings...'}
          </p>
        </div>
      </div>
    );
  }

  // Show modal for success or error
  if (showModal) {
    return (
      <BookingResultModal
        type={bookingsCreated ? 'success' : 'error'}
        title={bookingsCreated ? 'Payment Successful!' : 'Booking Creation Failed'}
        message={
          bookingsCreated
            ? 'Thank you for your payment. Your bookings have been confirmed and you will receive confirmation emails shortly.'
            : 'Your payment was processed successfully, but we encountered an issue creating your bookings.'
        }
        errorDetails={error || undefined}
        onViewBookings={handleViewBookings}
        onRetry={!bookingsCreated ? handleRetry : undefined}
        onGoToDashboard={handleViewDashboard}
        retryAttempts={retryAttempts}
        isRetrying={creating}
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
