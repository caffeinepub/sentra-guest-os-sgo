import { Principal } from '@icp-sdk/core/principal';
import { useGetReviewsByTarget } from '../../hooks/useReviews';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, RefreshCw, Star } from 'lucide-react';
import StarRatingField from './StarRatingField';

interface ReviewsListCardProps {
  targetId: Principal;
  targetType: string;
  targetName?: string;
}

export default function ReviewsListCard({
  targetId,
  targetType,
  targetName,
}: ReviewsListCardProps) {
  const { data: reviews, isLoading, error, refetch, isRefetching } = useGetReviewsByTarget(
    targetType,
    targetId
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews
          </CardTitle>
          <CardDescription>
            {targetName ? `Reviews for ${targetName}` : 'Customer reviews'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Reviews
          </CardTitle>
          <CardDescription>
            {targetName ? `Reviews for ${targetName}` : 'Customer reviews'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : 'Failed to load reviews'}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Reviews
        </CardTitle>
        <CardDescription>
          {reviews && reviews.length > 0
            ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''} • Average: ${averageRating.toFixed(1)} stars`
            : 'No reviews yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!reviews || reviews.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No reviews yet. Be the first to share your experience!
            </AlertDescription>
          </Alert>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review.id.toString()}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <StarRatingField rating={Number(review.rating)} readonly size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(Number(review.createdAt / BigInt(1000000))).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      By: {review.reviewer.toString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
