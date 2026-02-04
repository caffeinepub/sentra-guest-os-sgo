import { useNavigate } from '@tanstack/react-router';
import RequireAuthenticated from '../components/auth/RequireAuthenticated';
import RequireActorReady from '../components/auth/RequireActorReady';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import PrincipalIdPanel from '../components/profile/PrincipalIdPanel';
import StayHistorySection from '../components/stays/StayHistorySection';
import GuestBookingsSection from '../components/bookings/GuestBookingsSection';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Loader2, AlertCircle, RefreshCw, Hotel, CalendarCheck } from 'lucide-react';

function GuestAccountContent() {
  const navigate = useNavigate();
  const { userProfile, isLoading, error, refetch, isRefetching } = useCurrentUser();

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

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8 px-4">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">Guest Account</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Your profile, bookings, and stay history
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
