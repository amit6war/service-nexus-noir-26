
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, Star, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

interface BookingFlowProps {
  service: any;
  provider: any;
  onClose: () => void;
  onComplete: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  service,
  provider,
  onClose,
  onComplete
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleConfirmBooking = async () => {
    if (!selectedDateTime) {
      toast({
        title: 'Date & Time Required',
        description: 'Please select a date and time for your booking.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const success = addToCart({
        service_id: service.id,
        provider_id: provider.user_id,
        service_title: service.title,
        provider_name: provider.business_name,
        price: service.base_price,
        duration_minutes: service.duration_minutes,
        scheduled_date: selectedDateTime,
        special_instructions: specialInstructions
      });

      if (success) {
        toast({
          title: 'Added to Cart',
          description: `${service.title} with ${provider.business_name} has been added to your cart.`
        });
        onComplete();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add booking to cart. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Book Service</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Service & Provider Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center">
                  {provider.portfolio_images?.[0] ? (
                    <img
                      src={provider.portfolio_images[0]}
                      alt={provider.business_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-teal" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{provider.business_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{provider.rating || 0}</span>
                    <span>({provider.total_reviews || 0} reviews)</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Service:</span>
                  <span>{service.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Duration:</span>
                  <Badge variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {service.duration_minutes} minutes
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Price:</span>
                  <span className="text-xl font-bold text-teal">
                    ${service.base_price}
                    {service.price_type === 'hourly' ? '/hr' : ''}
                  </span>
                </div>
                {service.emergency_available && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Emergency Service:</span>
                    <Badge variant="outline" className="text-red-500 border-red-500">
                      Available
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Special Instructions (Optional)
              </label>
              <Textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any specific requirements or notes for the service provider..."
                className="w-full"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                className="flex-1 bg-teal hover:bg-teal/90"
                disabled={loading}
              >
                {loading ? 'Adding to Cart...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingFlow;
