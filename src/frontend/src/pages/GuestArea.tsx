import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Star, Shield, Globe, UserCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import PrincipalIdPanel from '../components/profile/PrincipalIdPanel';

export default function GuestArea() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-4xl space-y-8 md:space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-3 md:space-y-4 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Welcome to Sentra Guest OS (SGO)
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            A privacy-first hospitality platform connecting guests and hotels worldwide through transparent reputation and secure identity.
          </p>
        </div>

        {/* Compact Authenticated Section - Only show when authenticated */}
        {isAuthenticated && (
          <div className="px-4">
            <Card className="border-blue-500/50 bg-blue-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 flex-shrink-0">
                    <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl">You're Logged In</CardTitle>
                    <CardDescription className="text-sm">
                      Your Internet Identity is active
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Compact Principal ID Display */}
                <PrincipalIdPanel />
                
                {/* Navigation to Guest Account */}
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate({ to: '/guest-account' })}
                >
                  Guest Account
                </Button>
                
                {/* Navigation to Account Status */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate({ to: '/account' })}
                >
                  View Full Account Status
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 px-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Privacy First</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                No ID cards, passports, or personal documents required. Your identity is protected through Internet Identity while maintaining transparency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Two-Way Reputation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Rate hotels based on facilities and service. Hotels can also rate guests, creating a fair and transparent ecosystem.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Global Platform</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                International-ready from day one. Your reputation follows you across countries, supporting multiple languages and payment methods.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">Free for Guests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm sm:text-base">
                Always free for guests. Browse hotels, make bookings, and build your reputation without subscription fees.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-primary/5 border-primary/20 mx-4">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <h2 className="text-xl sm:text-2xl font-semibold">Ready to Get Started?</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Join Sentra Guest OS today and experience a new way of hotel booking with privacy and transparency at its core.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  size="lg" 
                  onClick={() => navigate({ to: '/hotel' })}
                  className="w-full sm:w-auto"
                >
                  I'm a Hotel
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate({ to: '/browse' })}
                  className="w-full sm:w-auto"
                >
                  Browse Hotels
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
