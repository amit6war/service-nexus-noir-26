
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, MapPin, Calendar, Clock, User, CheckCircle } from 'lucide-react';
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

const Checkout = () => {
  const { items, getTotalPrice, clearCart } = useShoppingCart();
  const { createBookingsFromCart } = useBookingsActions();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [address, setAddress] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US'
  });

  const handlePayment = async () => {
    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add services to your cart before checkout.',
        variant: 'destructive'
      });
      return;
    }

    if (!address.address_line_1 || !address.city || !address.state || !address.zip_code) {
      toast({
        title: 'Address Required',
        description: 'Please fill in all required address fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create bookings from cart items
      const success = await createBookingsFromCart(items, address);

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
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

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

            {/* Payment & Address Form */}
            <div className="space-y-6">
              {/* Service Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Service Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address1">Address Line 1 *</Label>
                    <Input
                      id="address1"
                      value={address.address_line_1}
                      onChange={(e) => setAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                      placeholder="Street address"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address2">Address Line 2</Label>
                    <Input
                      id="address2"
                      value={address.address_line_2}
                      onChange={(e) => setAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="State"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      value={address.zip_code}
                      onChange={(e) => setAddress(prev => ({ ...prev, zip_code: e.target.value }))}
                      placeholder="ZIP Code"
                      required
                    />
                  </div>
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
                  </div>
                </CardContent>
              </Card>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={loading}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
