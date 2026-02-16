import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Principal } from '@icp-sdk/core/principal';
import RequireAuthenticated from '../components/auth/RequireAuthenticated';
import RequireActorReady from '../components/auth/RequireActorReady';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import PrincipalIdPanel from '../components/profile/PrincipalIdPanel';
import StayHistorySection from '../components/stays/StayHistorySection';
import GuestBookingsSection from '../components/bookings/GuestBookingsSection';
import ReviewSubmitCard from '../components/reviews/ReviewSubmitCard';
import ReviewsListCard from '../components/reviews/ReviewsListCard';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useGetAllHotelsWithPrincipals } from '../hooks/useBrowseHotels';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { User, Mail, Loader2, AlertCircle, RefreshCw, Hotel, CalendarCheck, Star } from 'lucide-react';

function GuestAccountContent() {
  const navigate = useNavigate();
  const { userProfile, isLoading, error, refetch, isRefetching } = useCurrentUser();
  const { data: hotels } = useGetAllHotelsWithPrincipals();
  const [selectedHotelPrincipal, setSelectedHotelPrincipal] = useState<string>('');

  // Show loading only on initial load
  if (isLoading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="mx-auto max-w-4xl space-y-6 px-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const selectedHotel = hotels?.find(h => h.principal.toString() === selectedHotelPrincipal);

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8 px-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">Guest Account</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Your profile, bookings, reviews, and stay history
          </p>
        </div>

        {/* Quick Actions CTA */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5" />
              Ready to Book?
            </CardTitle>
            <CardDescription>
              Browse available hotels and make a reservation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              onClick={() => navigate({ to: '/browse' })}
              className="w-full sm:w-auto gap-2"
            >
              <Hotel className="h-5 w-5" />
              Browse Hotels & Make a Booking
            </Button>
          </CardContent>
        </Card>

        {/* Principal ID Panel */}
        <PrincipalIdPanel />

        {/* Profile Error Alert - Non-blocking */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Profile</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load your profile. Please try again.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                {isRefetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Summary */}
        {userProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium truncate">{userProfile.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium truncate">{userProfile.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bookings Section - Always visible */}
        <GuestBookingsSection />

        {/* Reviews Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6" />
              Reviews & Ratings
            </h2>
            <p className="text-sm text-muted-foreground">
              Share your experience and read reviews from other guests
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Select a Hotel</CardTitle>
                <CardDescription>Choose a hotel to review or view reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="hotel-select">Hotel</Label>
                  <Select value={selectedHotelPrincipal} onValueChange={setSelectedHotelPrincipal}>
                    <SelectTrigger id="hotel-select">
                      <SelectValue placeholder="Select a hotel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels?.map((hotel) => (
                        <SelectItem key={hotel.principal.toString()} value={hotel.principal.toString()}>
                          {hotel.profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {selectedHotelPrincipal && (
              <div className="grid gap-4 md:grid-cols-2">
                <ReviewSubmitCard
                  targetId={Principal.fromText(selectedHotelPrincipal)}
                  targetType="hotel"
                  targetName={selectedHotel?.profile.name}
                />
                <ReviewsListCard
                  targetId={Principal.fromText(selectedHotelPrincipal)}
                  targetType="hotel"
                  targetName={selectedHotel?.profile.name}
                />
              </div>
            )}
          </div>
        </div>

        {/* Stay History Section - Always visible */}
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Stay History</h2>
            <p className="text-sm text-muted-foreground">
              Your recorded hotel check-ins
            </p>
          </div>
          <StayHistorySection />
        </div>
      </div>
    </div>
  );
}

export default function GuestAccountPage() {
  return (
    <RequireAuthenticated>
      <RequireActorReady loadingMessage="Loading your account...">
        <ProfileSetupDialog />
        <GuestAccountContent />
      </RequireActorReady>
    </RequireAuthenticated>
  );
}
