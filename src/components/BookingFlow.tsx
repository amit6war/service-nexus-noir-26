
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, User, Star, DollarSign, CalendarIcon, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, isBefore, startOfDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getYear, getMonth, setYear, setMonth } from 'date-fns';
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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  
  const { addItem } = useShoppingCart();
  const { toast } = useToast();

  console.log('BookingFlow rendered with:', { service: service?.title, provider: provider?.business_name });

  // Load real availability data from database
  useEffect(() => {
    const loadAvailability = async () => {
      if (!provider?.user_id) return;
      
      setLoadingAvailability(true);
      try {
        // Get existing bookings for this provider
        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('service_date')
          .eq('provider_user_id', provider.user_id)
          .gte('service_date', new Date().toISOString())
          .neq('status', 'cancelled');

        if (error) {
          console.error('Error loading availability:', error);
          return;
        }

        // Transform bookings to booked slots format
        const slots = (bookings || []).map(booking => ({
          provider_id: provider.user_id,
          date: format(new Date(booking.service_date), 'yyyy-MM-dd'),
          time: format(new Date(booking.service_date), 'HH:mm')
        }));

        setBookedSlots(slots);
      } catch (error) {
        console.error('Error loading availability:', error);
      } finally {
        setLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [provider?.user_id]);

  // Generate available time slots
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  // Get real booked slots from database
  const [bookedSlots, setBookedSlots] = useState<Array<{provider_id: string, date: string, time: string}>>([]);

  const checkTimeSlotAvailability = (date: Date, time: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return !bookedSlots.some(slot => 
      slot.provider_id === provider.user_id && 
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
        provider_id: provider.user_id,
        service_title: service.title,
        provider_name: provider.business_name,
        price: provider.price,
        duration_minutes: service.duration_minutes,
        scheduled_date: scheduledDateTime,
        special_instructions: specialInstructions
      };

      console.log('🛒 Adding item to cart:', cartItem);

      const success = await addItem(cartItem);

      console.log('🛒 Add to cart result:', success);

      if (success) {
        console.log('✅ Successfully added to cart - closing booking flow');
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const handleYearChange = (year: string) => {
    setCurrentMonth(setYear(currentMonth, parseInt(year)));
  };

  const handleMonthChange = (month: string) => {
    setCurrentMonth(setMonth(currentMonth, parseInt(month)));
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Generate year options (current year + next 2 years)
  const currentYear = getYear(new Date());
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear + i);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const renderCalendar = () => {
    const days = getDaysInMonth();
    const today = new Date();
    
    return (
      <div className="bg-card rounded-lg border p-4">
        {/* Enhanced Calendar Header with Month/Year Selectors */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Select value={getMonth(currentMonth).toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={getYear(currentMonth).toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-20">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Add padding days for proper alignment */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="h-10"></div>
          ))}
          
          {days.map((date) => {
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
            const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isDisabled = isDateDisabled(date);
            
            return (
              <Button
                key={format(date, 'yyyy-MM-dd')}
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "h-10 w-full",
                  isSelected && "bg-teal hover:bg-teal/90 text-white",
                  isToday && !isSelected && "bg-accent text-accent-foreground",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => !isDisabled && handleDateSelect(date)}
                disabled={isDisabled}
              >
                {format(date, 'd')}
              </Button>
            );
          })}
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="mt-4 p-3 bg-accent/50 rounded-lg">
            <p className="text-sm font-medium">
              Selected Date: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Book Service</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service & Provider Summary */}
            <Card>
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
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{service.title}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                  
                  <div className="space-y-3">
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
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Calendar Selection */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Select Date *
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderCalendar()}
              </CardContent>
            </Card>

            {/* Time & Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        <Clock className="w-4 h-4 inline mr-2" />
                        Select Time Slot *
                      </label>
                       {loadingAvailability ? (
                         <div className="flex items-center justify-center py-4">
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal"></div>
                           <span className="ml-2 text-sm text-muted-foreground">Loading availability...</span>
                         </div>
                       ) : (
                         <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                           {timeSlots.map((time) => {
                             const isAvailable = checkTimeSlotAvailability(selectedDate, time);
                             const isSelected = selectedTimeSlot === time;
                             
                             return (
                               <Button
                                 key={time}
                                 variant={isSelected ? "default" : "outline"}
                                 size="sm"
                                 className={cn(
                                   "h-10",
                                   isSelected && "bg-teal hover:bg-teal/90",
                                   !isAvailable && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground"
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
                       )}
                      
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
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingFlow;
