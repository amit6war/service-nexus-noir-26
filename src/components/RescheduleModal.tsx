
import React, { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface RescheduleModalProps {
  bookingId: string;
  currentDate: string;
  currentTime: string;
  onRescheduleSuccess: () => void;
  children: React.ReactNode;
}

const RescheduleModal = ({ bookingId, currentDate, currentTime, onRescheduleSuccess, children }: RescheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(currentDate));
  const [selectedTime, setSelectedTime] = useState(currentTime);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select both date and time.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create new service date
      const newServiceDate = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      newServiceDate.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('bookings')
        .update({
          service_date: newServiceDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking Rescheduled',
        description: `Your booking has been rescheduled to ${format(newServiceDate, 'MMM dd, yyyy')} at ${selectedTime}.`,
      });

      setIsOpen(false);
      onRescheduleSuccess();
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule booking. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Booking</DialogTitle>
          <DialogDescription>
            Select a new date and time for your service appointment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Date</label>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date < new Date(Date.now() + 24 * 60 * 60 * 1000)}
              className="rounded-md border"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Time</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={loading}>
            {loading ? 'Rescheduling...' : 'Reschedule Booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
