import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, User, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { toast } from '@/hooks/use-toast';

// Define the CartItem type inline to ensure we have the correct structure
interface CartItem {
  id: string;
  service_id: string;
  provider_id: string;
  service_title: string;
  provider_name: string;
  price: number;
  duration_minutes: number;
  scheduled_date: string;
  special_instructions?: string;
}

const PaymentSuccessV2 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useShoppingCart();
  const [checkoutData, setCheckoutData] = useState<{
    items: CartItem[];
    address: any;
    totalAmount: number;
  } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');

    if (success === 'true' && sessionId) {
      // Retrieve stored checkout data
      const pendingItems = localStorage.getItem('pendingCheckoutItems');
      const pendingAddress = localStorage.getItem('pendingCheckoutAddress');
      const pendingAmount = localStorage.getItem('pendingCheckoutAmount');

      console.log('Payment success - retrieving stored data:', { pendingItems, pendingAddress, pendingAmount });

      if (pendingItems && pendingAddress && pendingAmount) {
        try {
          const rawItems = JSON.parse(pendingItems);
          const rawAddress = JSON.parse(pendingAddress);
          
          // Ensure all required fields are present and properly typed
          const itemsWithIds: CartItem[] = rawItems.map((item: any, index: number): CartItem => ({
            id: item.id || `temp-${index}-${Date.now()}`,
            service_id: item.service_id || '',
            provider_id: item.provider_id || '',
            service_title: item.service_title || 'Unknown Service',
            provider_name: item.provider_name || 'Unknown Provider',
            price: Number(item.price) || 0,
            duration_minutes: Number(item.duration_minutes) || 0,
            scheduled_date: item.scheduled_date || new Date().toISOString(),
            special_instructions: item.special_instructions || ''
          }));
          
          // Validate checkout data
          if (itemsWithIds.length > 0) {
            setCheckoutData({
              items: itemsWithIds,
              address: rawAddress,
              totalAmount: parseFloat(pendingAmount)
            });

            // Clear the cart and stored data
            clearCart();
            
            // Clean up localStorage
            localStorage.removeItem('pendingCheckoutItems');
            localStorage.removeItem('pendingCheckoutAddress');
            localStorage.removeItem('pendingCheckoutAmount');

            toast({
              title: "Payment Successful!",
              description: "Your booking has been confirmed. You will receive a confirmation email shortly.",
            });
          } else {
            console.warn('No valid items found in stored checkout data');
            navigate('/customer-dashboard');
          }
        } catch (error) {
          console.error('Error parsing stored checkout data:', error);
          navigate('/customer-dashboard');
        }
      } else {
        console.warn('Missing stored checkout data for payment success');
        navigate('/customer-dashboard');
      }
    } else {
      console.warn('Invalid payment success parameters');
      navigate('/customer-dashboard');
    }
  }, [searchParams, navigate, clearCart]);

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto mb-4"></div>
          <p className="text-muted-foreground">Processing your payment...</p>
        </div>
      </div>
    );
  }

  const { items, address, totalAmount } = checkoutData;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">
            Your booking has been confirmed. We'll send you updates via email.
          </p>
        </motion.div>

        {/* Booking Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Services Booked */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-teal" />
                  Services Booked
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.service_title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{item.provider_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.duration_minutes} min</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span>Scheduled: {new Date(item.scheduled_date).toLocaleString()}</span>
                        </div>
                        {item.special_instructions && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Notes: </span>
                            {item.special_instructions}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-2">
                        ${item.price}
                      </Badge>
                    </div>
                    {index < items.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Address & Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Service Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal" />
                  Service Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p className="font-medium">{address.full_name}</p>
                  <p>{address.street_address}</p>
                  {address.apartment && <p>{address.apartment}</p>}
                  <p>{address.city}, {address.state} {address.zip_code}</p>
                  {address.phone && <p className="mt-2">Phone: {address.phone}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({items.length} service{items.length !== 1 ? 's' : ''})</span>
                    <span>${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service fee</span>
                    <span>${(totalAmount - items.reduce((sum, item) => sum + item.price, 0)).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Paid</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">
              What's next? Your service providers will contact you within 24 hours to confirm the appointment details.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => navigate('/customer-dashboard?tab=bookings')}
                className="bg-teal hover:bg-teal/90"
              >
                View My Bookings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/customer-dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessV2;
