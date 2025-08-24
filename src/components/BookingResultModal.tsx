
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BookingResultModalProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  errorDetails?: string;
  onViewBookings?: () => void;
  onRetry?: () => void;
  onGoToDashboard?: () => void;
  retryAttempts?: number;
  maxRetries?: number;
  isRetrying?: boolean;
}

const BookingResultModal = ({
  type,
  title,
  message,
  errorDetails,
  onViewBookings,
  onRetry,
  onGoToDashboard,
  retryAttempts = 0,
  maxRetries = 3,
  isRetrying = false
}: BookingResultModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className={`border-2 ${type === 'success' ? 'border-green-200' : 'border-red-200'}`}>
          <CardHeader className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              type === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {type === 'success' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <CardTitle className={`text-2xl font-bold ${
              type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {message}
            </p>
            
            {type === 'success' ? (
              <div className="bg-green-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-semibold text-green-800">What happens next:</p>
                <ul className="text-left space-y-1 text-green-700">
                  <li>• Your service providers will contact you within 24 hours</li>
                  <li>• You will receive confirmation emails shortly</li>
                  <li>• You can track your bookings in "My Bookings"</li>
                  <li>• Payment confirmation has been sent to your email</li>
                </ul>
              </div>
            ) : (
              <div className="bg-red-50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-semibold text-red-800">What happens next:</p>
                <ul className="text-left space-y-1 text-red-700">
                  <li>• Our team has been automatically notified</li>
                  <li>• We will attempt to create your bookings manually</li>
                  <li>• If unsuccessful, a full refund will be processed within 3-5 business days</li>
                  <li>• You will receive email updates on the status</li>
                </ul>
              </div>
            )}

            {errorDetails && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Error Details:</p>
                <p className="bg-muted p-2 rounded text-xs font-mono">{errorDetails}</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center pt-4">
              {type === 'success' ? (
                <>
                  <Button 
                    onClick={onViewBookings}
                    className="bg-teal hover:bg-teal/90 flex items-center gap-2"
                  >
                    View My Bookings
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={onGoToDashboard}
                  >
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  {onRetry && retryAttempts < maxRetries && (
                    <Button 
                      onClick={onRetry} 
                      variant="outline"
                      disabled={isRetrying}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                      Retry ({retryAttempts + 1}/{maxRetries})
                    </Button>
                  )}
                  <Button 
                    onClick={onGoToDashboard} 
                    className="bg-teal hover:bg-teal/90"
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              {type === 'success' 
                ? "Thank you for using our services!" 
                : "Need immediate help? Contact our support team with your payment confirmation."
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BookingResultModal;
