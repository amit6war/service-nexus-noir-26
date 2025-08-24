import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// This component helps handle post-payment cleanup and notifications
const PaymentSuccessHandler: React.FC = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Check for successful payment in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const sessionId = urlParams.get('session_id');

    if (success === 'true' && sessionId) {
      // Show a brief success notification
      toast({
        title: 'Payment Processed',
        description: 'Your payment has been processed. Creating your bookings...',
        duration: 3000
      });

      // Clean up URL params
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [toast]);

  return null; // This is a utility component with no visual output
};

export default PaymentSuccessHandler;