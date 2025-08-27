
import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  bookingId,
  currentDate,
  currentTime,
  onRescheduleSuccess,
  children
}) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select both a new date and time.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const newDateTime = new Date(`${newDate}T${newTime}`);
      
      const { error } = await supabase
        .from('bookings')
        .update({
          scheduled_date: newDateTime.toISOString(),
          status: 'confirmed', // Reset to confirmed after reschedule
          reschedule_reason: reason || 'Customer requested reschedule',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Booking Rescheduled',
        description: 'Your booking has been successfully rescheduled.',
      });

      setIsOpen(false);
      setNewDate('');
      setNewTime('');
      setReason('');
      onRescheduleSuccess();
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to reschedule booking. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            Current booking: {format(new Date(currentDate), 'MMM dd, yyyy')} at {currentTime}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-date">New Date</Label>
              <input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-time">New Time</Label>
              <input
                id="new-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Reschedule (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Let the provider know why you're rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Please note:</p>
              <p>The provider will be notified of this reschedule request and may need to confirm the new time.</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={isLoading}
            className="bg-teal hover:bg-teal/90"
          >
            <Clock className="w-4 h-4 mr-2" />
            {isLoading ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleModal;
