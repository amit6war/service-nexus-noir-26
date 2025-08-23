
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, Star, DollarSign, CalendarIcon, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [conflictError, setConflictError] = useState('');
  
  const { addItem } = useShoppingCart();
  const { toast } = useToast();

  console.log('BookingFlow rendered with:', { service: service?.title, provider: provider?.business_name });

  // Generate available time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Mock booked slots - simulating backend data
  const bookedSlots = [
    { provider_id: provider.id, date: format(new Date(), 'yyyy-MM-dd'), time: '10:00' },
    { provider_id: provider.id, date: format(addDays(new Date(), 1), 'yyyy-MM-dd'), time: '14:00' },
  ];

  const checkTimeSlotAvailability = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !bookedSlots.some(slot => 
      slot.provider_id === provider.id && 
      slot.date === dateStr && 
      slot.time === time
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot('');
    setConflictError('');
    console.log('Date selected:', date);
  };

  const handleTimeSlotSelect = (time: string) => {
    if (!selectedDate) return;
    
    // Check if this provider is available at this time
    if (!checkTimeSlotAvailability(selectedDate, time)) {
      setConflictError(`${provider.business_name} is already booked for this time slot. Please choose a different time.`);
      return;
    }
    
    setSelectedTimeSlot(time);
    setConflictError('');
    console.log('Time slot selected:', time);
  };

  const handleConfirmBooking = async () => {
    console.log('🛒 Confirm booking clicked - starting add to cart process');
    
    if (!selectedDate || !selectedTimeSlot) {
      toast({
        title: 'Date & Time Required',
        description: 'Please select both a date and time for your booking.',
        variant: 'destructive'
      });
      return;
    }

    // Final availability check before adding to cart
    if (!checkTimeSlotAvailability(selectedDate, selectedTimeSlot)) {
      setConflictError(`${provider.business_name} is no longer available at this time. Please choose a different slot.`);
      return;
    }

    setLoading(true);

    try {
      const scheduledDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot}:00`;
      
      const cartItem = {
        service_id: service.id,
        provider_id: provider.user_id || provider.id,
        service_title: service.title,
        provider_name: provider.business_name,
        price: provider.price,
        duration_minutes: service.duration_minutes,
        scheduled_date: scheduledDateTime,
        special_instructions: specialInstructions
      };

      console.log('🛒 Adding item to cart:', cartItem);

      const success = addItem(cartItem);

      console.log('🛒 Add to cart result:', success);

      if (success) {
        console.log('✅ Successfully added to cart');
        toast({
          title: 'Added to Cart!',
          description: `${service.title} with ${provider.business_name} has been added to your cart.`
        });
        onComplete();
      } else {
        console.log('❌ Failed to add to cart');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add booking to cart. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
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
                  <User className="w-6 h-6 text-teal" />
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
                    ${provider.price}
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

          {/* Date Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                <Calendar className="w-4 h-4 inline mr-2" />
                Select Date *
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slot Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Select Time Slot *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => {
                    const isAvailable = checkTimeSlotAvailability(selectedDate, time);
                    const isSelected = selectedTimeSlot === time;
                    
                    return (
                      <Button
                        key={time}
                        variant={isSelected ? "default" : "outline"}
                        className={cn(
                          "h-10",
                          isSelected && "bg-teal hover:bg-teal/90",
                          !isAvailable && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => handleTimeSlotSelect(time)}
                        disabled={!isAvailable}
                      >
                        {time}
                        {!isAvailable && <span className="ml-1 text-xs">(Booked)</span>}
                      </Button>
                    );
                  })}
                </div>
                
                {conflictError && (
                  <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">{conflictError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Special Instructions */}
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
                disabled={loading || !selectedDate || !selectedTimeSlot}
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
