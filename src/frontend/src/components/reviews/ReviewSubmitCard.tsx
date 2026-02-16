import { useState } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { useSubmitReview } from '../../hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';
import StarRatingField from './StarRatingField';
import { toast } from 'sonner';

interface ReviewSubmitCardProps {
  targetId: Principal;
  targetType: string;
  targetName?: string;
}

export default function ReviewSubmitCard({
  targetId,
  targetType,
  targetName,
}: ReviewSubmitCardProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const submitReview = useSubmitReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }

    try {
      await submitReview.mutateAsync({
        targetType,
        targetId,
        rating: BigInt(rating),
        comment: comment.trim() || undefined,
      });

      toast.success('Review submitted successfully!');
      setRating(5);
      setComment('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Submit a Review
        </CardTitle>
        <CardDescription>
          {targetName ? `Share your experience with ${targetName}` : 'Share your experience'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating *</Label>
            <StarRatingField
              rating={rating}
              onRatingChange={setRating}
              size="lg"
            />
            <p className="text-xs text-muted-foreground">
              {rating} out of 5 stars
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about your experience..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/500 characters
            </p>
          </div>

          {submitReview.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {submitReview.error instanceof Error
                  ? submitReview.error.message
                  : 'Failed to submit review'}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={submitReview.isPending}
            className="w-full"
          >
            {submitReview.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
