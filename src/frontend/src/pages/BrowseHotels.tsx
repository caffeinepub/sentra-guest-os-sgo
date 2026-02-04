import { useState, useMemo } from 'react';
import { useGetAllHotelsWithPrincipals } from '../hooks/useBrowseHotels';
import { useTestingMode } from '../hooks/useTestingMode';
import BookingRequestDialog from '../components/bookings/BookingRequestDialog';
import GuestHotelRoomsDialog from '../components/hotel/GuestHotelRoomsDialog';
import RouteDiagnosticsErrorCard from '../components/diagnostics/RouteDiagnosticsErrorCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2, Search, MapPin, ExternalLink, Building2, CalendarCheck, Info, FlaskConical, BedDouble } from 'lucide-react';
import { HotelClassification } from '../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Principal } from '@icp-sdk/core/principal';

const classificationLabels: Record<HotelClassification, string> = {
  [HotelClassification.fiveStar]: '5-Star',
  [HotelClassification.fourStar]: '4-Star',
  [HotelClassification.threeStar]: '3-Star',
  [HotelClassification.twoStar]: '2-Star',
  [HotelClassification.oneStar]: '1-Star',
  [HotelClassification.jasmine]: 'Jasmine',
};

export default function BrowseHotels() {
  const { isTestingMode, toggleTestingMode } = useTestingMode();
  const { data: hotels, isLoading, isError, error, refetch } = useGetAllHotelsWithPrincipals(isTestingMode);
  const [countryFilter, setCountryFilter] = useState('');

  // Get unique countries from hotels
  const availableCountries = useMemo(() => {
    if (!hotels) return [];
    const countries = new Set(hotels.map(h => h.profile.country).filter(c => c && c !== 'unknown'));
    return Array.from(countries).sort();
  }, [hotels]);

  // Filter hotels by country
  const filteredHotels = useMemo(() => {
    if (!hotels) return [];
    if (!countryFilter) return hotels;
    return hotels.filter(hotel => 
      hotel.profile.country.toLowerCase().includes(countryFilter.toLowerCase())
    );
  }, [hotels, countryFilter]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Error state - show diagnostics with retry
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load hotels';
    return (
      <RouteDiagnosticsErrorCard
        title="Failed to Load Hotels"
        description="Unable to fetch hotel listings from the backend"
        errorMessage={errorMessage}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-6xl space-y-6 md:space-y-8 px-4">
        {/* Header */}
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Browse Hotels</h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Discover hotels worldwide on the Sentra Guest OS platform
          </p>
        </div>

        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Search className="h-5 w-5 flex-shrink-0" />
              Filter Hotels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Testing Mode Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                <FlaskConical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="space-y-0.5">
                  <Label htmlFor="testing-mode" className="text-sm font-medium cursor-pointer">
                    Testing Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show test hotels for exploring the booking experience
                  </p>
                </div>
              </div>
              <Switch
                id="testing-mode"
                checked={isTestingMode}
                onCheckedChange={toggleTestingMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="countryFilter">Search by Country</Label>
              <Input
                id="countryFilter"
                placeholder="Enter country name..."
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full"
              />
            </div>
            {availableCountries.length > 0 && (
              <div className="space-y-2">
                <Label>Quick Select:</Label>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
                    <Button
                      variant={countryFilter === '' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCountryFilter('')}
                      className="flex-shrink-0"
                    >
                      All Countries
                    </Button>
                    {availableCountries.map((country) => (
                      <Button
                        key={country}
                        variant={countryFilter === country ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCountryFilter(country)}
                        className="flex-shrink-0"
                      >
                        {country}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-semibold">
              {filteredHotels.length} Hotels Found
            </h2>
          </div>

          {filteredHotels.length === 0 ? (
            <Card>
              <CardContent className="py-12 space-y-6">
                <div className="text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-base sm:text-lg font-medium text-muted-foreground mb-2">
                    {countryFilter 
                      ? `No hotels found in "${countryFilter}"`
                      : 'No hotels available yet'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {countryFilter 
                      ? 'Try searching for a different country or clear the filter.'
                      : isTestingMode 
                        ? 'No test hotels are available. Try turning off testing mode to see production hotels.'
                        : 'Hotels will appear here once they are activated for public visibility.'}
                  </p>
                </div>
                
                {!countryFilter && !isTestingMode && (
                  <Alert className="border-blue-500/50 bg-blue-500/5">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertTitle className="text-blue-600 dark:text-blue-400">
                      Why are no hotels visible?
                    </AlertTitle>
                    <AlertDescription className="text-xs text-blue-600/80 dark:text-blue-400/80 space-y-2">
                      <p>
                        Hotels must meet the following requirements to be publicly visible:
                      </p>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Activated by an administrator</li>
                        <li>Not marked as test/dummy hotel</li>
                        <li>Subscription payment confirmed</li>
                      </ul>
                      <p className="pt-2">
                        If you are a hotel owner, please ensure your profile is complete and your subscription is active. 
                        Contact support at sentraguestos.info@gmail.com if you need assistance.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotelData, index) => {
                const hotel = hotelData.profile;
                const hotelPrincipal = hotelData.principal;
                
                return (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        {hotel.logo ? (
                          <img
                            src={hotel.logo}
                            alt={`${hotel.name} logo`}
                            className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg object-cover border flex-shrink-0"
                          />
                        ) : (
                          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg bg-muted flex items-center justify-center border flex-shrink-0">
                            <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg line-clamp-2">{hotel.name}</CardTitle>
                          <CardDescription className="mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {classificationLabels[hotel.classification]}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium break-words">{hotel.country}</p>
                            <p className="text-muted-foreground text-xs line-clamp-2 break-words">
                              {hotel.location.address}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <a
                            href={hotel.location.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline flex-1"
                          >
                            View on map
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                          <GuestHotelRoomsDialog
                            hotelName={hotel.name}
                            rooms={hotel.rooms}
                            trigger={
                              <Button variant="outline" size="sm" className="gap-2">
                                <BedDouble className="h-4 w-4" />
                                Rooms
                              </Button>
                            }
                          />
                        </div>
                        <BookingRequestDialog
                          hotelName={hotel.name}
                          hotelPrincipal={hotelPrincipal}
                          isTestingMode={isTestingMode}
                          trigger={
                            <Button variant="default" size="sm" className="gap-2 w-full">
                              <CalendarCheck className="h-4 w-4" />
                              Book Now
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
