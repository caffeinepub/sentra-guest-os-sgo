import { useGetHotelProfile } from '../hooks/useHotelProfile';
import { useIsCallerInvited } from '../hooks/useHotelInvites';
import { useSubscriptionStatus } from '../hooks/usePaymentRequest';
import { useGetHotelBookings } from '../hooks/useBookings';
import { useActorSafe } from '../hooks/useActorSafe';
import RequireActorReady from '../components/auth/RequireActorReady';
import HotelInviteGate from '../components/hotel/HotelInviteGate';
import HotelProfileForm from '../components/hotel/HotelProfileForm';
import HotelBookingsSection from '../components/bookings/HotelBookingsSection';
import RecordStayCard from '../components/hotel/RecordStayCard';
import HotelRoomsManager from '../components/hotel/HotelRoomsManager';
import RouteDiagnosticsErrorCard from '../components/diagnostics/RouteDiagnosticsErrorCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Building2, CalendarCheck, History, CreditCard, RefreshCw, BedDouble } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

function HotelAreaContent() {
  const { actorReady, actorError, actorLoading, retry: retryActor } = useActorSafe();
  const { data: isInvited, isLoading: inviteLoading, isError: inviteError, error: inviteErrorObj, refetch: refetchInvite } = useIsCallerInvited();
  const { data: profile, isLoading: profileLoading } = useGetHotelProfile();
  const { data: subscriptionStatus, isLoading: subscriptionLoading } = useSubscriptionStatus();
  const { data: bookings, isLoading: bookingsLoading, isError: bookingsError, error: bookingsErrorObj, refetch: refetchBookings } = useGetHotelBookings();

  // Show loading only during initial load
  if (actorLoading || inviteLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Show consolidated diagnostics error if actor failed or invite check failed
  if (!actorReady || inviteError) {
    const errorMessage = actorError 
      ? (actorError instanceof Error ? actorError.message : 'Actor initialization failed')
      : inviteError 
        ? (inviteErrorObj instanceof Error ? inviteErrorObj.message : 'Failed to verify invite status')
        : 'Unknown error';

    return (
      <RouteDiagnosticsErrorCard
        title="Hotel Area Access Check Failed"
        description="Unable to verify your hotel access permissions"
        errorMessage={errorMessage}
        onRetry={async () => {
          if (actorError) {
            await retryActor();
          }
          if (inviteError) {
            await refetchInvite();
          }
        }}
      />
    );
  }

  // Invite gate
  if (!isInvited) {
    return <HotelInviteGate />;
  }

  // Profile setup required
  if (!profile && !profileLoading) {
    return (
      <div className="container py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Welcome to Hotel Area
            </CardTitle>
            <CardDescription>
              Set up your hotel profile to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HotelProfileForm />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Subscription check
  const needsSubscription = subscriptionStatus === 'unpaid';

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8 px-4">
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Hotel Management</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Manage your hotel profile, bookings, and guest stays
          </p>
        </div>

        {needsSubscription && (
          <Alert variant="destructive">
            <CreditCard className="h-4 w-4" />
            <AlertTitle>Subscription Required</AlertTitle>
            <AlertDescription>
              Your hotel subscription is not active. Please complete payment to activate your hotel listing.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="profile" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="gap-2">
              <BedDouble className="h-4 w-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="stays" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Record Stay</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Profile</CardTitle>
                <CardDescription>Update your hotel information and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <HotelProfileForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rooms">
            <HotelRoomsManager />
          </TabsContent>

          <TabsContent value="bookings">
            {bookingsError ? (
              <Card>
                <CardContent className="py-12">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Failed to Load Bookings</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>{bookingsErrorObj instanceof Error ? bookingsErrorObj.message : 'Unknown error'}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetchBookings()}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <HotelBookingsSection />
            )}
          </TabsContent>

          <TabsContent value="stays">
            <RecordStayCard />
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Payment</CardTitle>
                <CardDescription>Manage your hotel subscription and payment methods</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Alert className={
                      subscriptionStatus === 'active' 
                        ? 'border-green-500/50 bg-green-500/5'
                        : subscriptionStatus === 'pending'
                          ? 'border-yellow-500/50 bg-yellow-500/5'
                          : 'border-red-500/50 bg-red-500/5'
                    }>
                      <AlertTitle className="capitalize">{subscriptionStatus} Subscription</AlertTitle>
                      <AlertDescription>
                        {subscriptionStatus === 'active' && 'Your hotel subscription is active and your listing is visible to guests.'}
                        {subscriptionStatus === 'pending' && 'Your payment is being reviewed. Your hotel will be activated once payment is confirmed.'}
                        {subscriptionStatus === 'unpaid' && 'Please complete payment to activate your hotel listing and start receiving bookings.'}
                      </AlertDescription>
                    </Alert>

                    {subscriptionStatus === 'unpaid' && (
                      <div className="space-y-4">
                        <div className="rounded-lg border bg-card p-6 space-y-4">
                          <h3 className="font-semibold text-lg">Payment Instructions</h3>
                          <p className="text-sm text-muted-foreground">
                            To activate your hotel subscription, please send payment using one of the following methods:
                          </p>

                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                PayPal
                              </h4>
                              <div className="pl-6 space-y-1">
                                <p className="text-sm">Send payment to:</p>
                                <code className="text-sm bg-muted px-2 py-1 rounded">lucky.jamaludin@gmail.com</code>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                DANA
                              </h4>
                              <div className="pl-6 space-y-1">
                                <p className="text-sm">Send to DANA number:</p>
                                <code className="text-sm bg-muted px-2 py-1 rounded">089639541438</code>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-sm flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                GoPay
                              </h4>
                              <div className="pl-6 space-y-1">
                                <p className="text-sm">Send to GoPay number:</p>
                                <code className="text-sm bg-muted px-2 py-1 rounded">089639541438</code>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border bg-card p-6 space-y-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <SiWhatsapp className="h-5 w-5 text-green-600" />
                            Contact Admin
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            For payment confirmation or assistance, contact our admin via WhatsApp:
                          </p>
                          <a
                            href="https://wa.me/6289502436075"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <SiWhatsapp className="h-4 w-4" />
                            +62 89502436075
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function HotelArea() {
  return (
    <RequireActorReady>
      <HotelAreaContent />
    </RequireActorReady>
  );
}
