
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, MapPin, Calendar, Clock, User, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useBookingsActions } from '@/hooks/useBookingsActions';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import AddressManager, { Address } from '@/components/AddressManager';

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useShoppingCart();
  const { createBookingsFromCart } = useBookingsActions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add services to your cart before checkout.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a service address.',
        variant: 'destructive'
      });
      return;
    }

    // Validate that all items have scheduled dates
    const itemsWithoutDate = items.filter(item => !item.scheduled_date);
    if (itemsWithoutDate.length > 0) {
      toast({
        title: 'Missing Schedule',
        description: 'All services must have a scheduled date before checkout.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Integrate with Stripe payment processing
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Convert selected address to the format expected by createBookingsFromCart
      const addressForBooking = {
        address_line_1: selectedAddress.address_line_1,
        address_line_2: selectedAddress.address_line_2 || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip_code: selectedAddress.postal_code,
        country: selectedAddress.country
      };

      // Create bookings from cart items
      const success = await createBookingsFromCart(items, addressForBooking);

      if (success) {
        // Clear cart after successful booking creation
        clearCart();
        
        toast({
          title: 'Payment Successful!',
          description: 'Your bookings have been confirmed and moved to My Bookings.',
        });

        // Navigate to customer dashboard to show bookings
        navigate('/customer-dashboard');
      } else {
        throw new Error('Failed to create bookings');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some services to get started</p>
            <Button onClick={() => navigate('/customer-dashboard')} className="bg-teal hover:bg-teal/90">
              Browse Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/customer-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.service_title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <User className="w-4 h-4" />
                          <span>{item.provider_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{item.duration_minutes} min</span>
                          </div>
                          {item.scheduled_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(item.scheduled_date), 'MMM d, p')}</span>
                            </div>
                          )}
                        </div>
                        {item.special_instructions && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <strong>Notes:</strong> {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-teal">${item.price}</span>
                      </div>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-teal">${totalPrice}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Address & Payment Form */}
            <div className="space-y-6">
              {/* Service Address Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Select Service Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressManager
                    onAddressSelect={handleAddressSelect}
                    selectedAddressId={selectedAddress?.id}
                    showSelection={true}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Test Mode:</strong> Use test card number 4242 4242 4242 4242 with any future expiry date and any 3-digit CVV.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={loading || !selectedAddress}
                className="w-full h-14 text-lg bg-teal hover:bg-teal/90"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Pay ${totalPrice}
                  </div>
                )}
              </Button>
              
              {!selectedAddress && (
                <p className="text-sm text-muted-foreground text-center">
                  Please select a service address to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
