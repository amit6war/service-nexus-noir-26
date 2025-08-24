
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useBookingsActions } from '@/hooks/useBookingsActions';
import { useToast } from '@/hooks/use-toast';
import BookingResultModal from './BookingResultModal';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useShoppingCart();
  const { createBookingsFromCart } = useBookingsActions();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [bookingsCreated, setBookingsCreated] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const processPaymentSuccess = async (isRetry = false) => {
    // Get stored checkout data
    const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
    const pendingAddress = sessionStorage.getItem('pendingCheckoutAddress');
    
    if (!pendingItems || !pendingAddress) {
      setError('No payment data found. Please contact support if you were charged.');
      setShowModal(true);
      return;
    }

    if (bookingsCreated && !isRetry) {
      return; // Already processed successfully
    }

    try {
      setCreating(true);
      setError(null);
      console.log('Processing successful payment and creating bookings...');
      
      const items = JSON.parse(pendingItems);
      const address = JSON.parse(pendingAddress);
      
      // Mark payment as processed
      setPaymentProcessed(true);
      
      // Create bookings from the cart data
      const success = await createBookingsFromCart(items, address);
      
      if (success) {
        // Clear stored data and cart
        clearCart();
        sessionStorage.removeItem('pendingCheckoutItems');
        sessionStorage.removeItem('pendingCheckoutAddress');
        sessionStorage.removeItem('checkoutTimestamp');
        
        setBookingsCreated(true);
        setShowModal(true);
        
        toast({
          title: 'Payment & Booking Successful!',
          description: `${items.length} booking${items.length !== 1 ? 's' : ''} created successfully. You will receive confirmation emails shortly.`,
        });
        
        console.log('Bookings created successfully from payment');
      } else {
        throw new Error('Failed to create bookings after payment');
      }
      
    } catch (error) {
      console.error('Error creating bookings after payment:', error);
      setError(`Booking creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowModal(true);
      
      // Show error with refund information
      toast({
        title: 'Booking Creation Failed',
        description: 'Your payment was processed successfully, but we encountered an issue creating your bookings. Our team has been notified and will process a refund within 3-5 business days if needed.',
        variant: 'destructive',
        duration: 10000
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRetry = async () => {
    if (retryAttempts >= 3) {
      toast({
        title: 'Maximum Retries Reached',
        description: 'Please contact support for assistance. We will ensure your payment is properly handled.',
        variant: 'destructive'
      });
      return;
    }
    
    setRetryAttempts(prev => prev + 1);
    await processPaymentSuccess(true);
  };

  const handleViewBookings = () => {
    navigate('/customer-dashboard?tab=bookings');
  };

  const handleViewDashboard = () => {
    navigate('/customer-dashboard');
  };

  useEffect(() => {
    processPaymentSuccess();
  }, []);

  // Show loading state if still processing
  if (creating && !showModal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Processing your payment and creating bookings...
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
