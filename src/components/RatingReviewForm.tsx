
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RatingReviewFormProps {
  bookingId: string;
  providerUserId: string;
  serviceName: string;
  providerName: string;
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

const RatingReviewForm: React.FC<RatingReviewFormProps> = ({
  bookingId,
  providerUserId,
  serviceName,
  providerName,
  onSubmitSuccess,
  onCancel
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          reviewer_id: userData.user.id,
          provider_user_id: providerUserId,
          rating,
          title: title || `Review for ${serviceName}`,
          comment
        });

      if (error) throw error;

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!'
      });

      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Rate & Review</CardTitle>
          <p className="text-sm text-muted-foreground">
            How was your experience with {providerName} for {serviceName}?
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your experience"
              className="w-full p-2 border border-border rounded-md"
              maxLength={100}
            />
          </div>

          {/* Review Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">Comment (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share details about your experience..."
              rows={4}
              maxLength={1000}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="flex-1 bg-teal hover:bg-teal/90"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Review
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RatingReviewForm;
