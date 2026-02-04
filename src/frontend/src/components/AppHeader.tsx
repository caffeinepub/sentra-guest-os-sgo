import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Hotel, Users, Menu, Shield, User, AlertCircle, RefreshCw, UserCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoginButton from './auth/LoginButton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useCurrentUser';

export default function AppHeader() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { showAdminUI, isFailed, isLoading, refetch } = useIsAdmin();
  
  const isAuthenticated = !!identity;
  
  // Show verification error state when authenticated but admin check failed
  const showVerificationError = isAuthenticated && isFailed;

  const handleNavigation = (path: '/' | '/hotel' | '/browse' | '/account' | '/admin' | '/guest-account') => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };
  
  const handleRetryAdminCheck = async () => {
    await refetch();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/" className="flex items-center gap-2 font-semibold text-base md:text-lg">
            <img 
              src="/assets/generated/sgo-logo.dim_512x512.png" 
              alt="Sentra Guest OS Logo" 
              className="h-8 w-8 flex-shrink-0"
            />
            <span className="hidden sm:inline-block">Sentra Guest OS (SGO)</span>
            <span className="sm:hidden">SGO</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/' })}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Guest Area</span>
              <span className="lg:hidden">Guest</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: '/hotel' })}
              className="gap-2"
            >
              <Hotel className="h-4 w-4" />
              <span className="hidden lg:inline">Hotel Area</span>
              <span className="lg:hidden">Hotel</span>
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/guest-account' })}
                  className="gap-2"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden lg:inline">Guest Account</span>
                  <span className="lg:hidden">Account</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/account' })}
                  className="gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Account Status</span>
                  <span className="lg:hidden">Status</span>
                </Button>
              </>
            )}
            {showAdminUI && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/admin' })}
                className="gap-2 border-primary/50 bg-primary/5"
                disabled={isLoading}
              >
                <Shield className="h-4 w-4" />
                <span className="hidden lg:inline">Admin Panel</span>
                <span className="lg:hidden">Admin</span>
              </Button>
            )}
            {showVerificationError && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetryAdminCheck}
                className="gap-2 text-destructive hover:text-destructive"
                title="Admin status could not be verified. Click to retry."
              >
                <AlertCircle className="h-4 w-4" />
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Admin Badge - Desktop */}
          {showAdminUI && (
            <Badge variant="default" className="hidden md:flex gap-1">
              <Shield className="h-3 w-3" />
              Admin
            </Badge>
          )}
          
          <LoginButton />
          
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetTitle className="text-left mb-6">Menu</SheetTitle>
              <nav className="flex flex-col gap-4">
                {/* Admin Badge - Mobile */}
                {showAdminUI && (
                  <Badge variant="default" className="w-fit gap-1">
                    <Shield className="h-3 w-3" />
                    Admin Access
                  </Badge>
                )}
                
                {/* Verification Error - Mobile */}
                {showVerificationError && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Admin status could not be verified.
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRetryAdminCheck}
                        className="mt-2 h-8 w-full gap-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry Verification
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleNavigation('/')}
                  className="justify-start gap-3"
                >
                  <Users className="h-5 w-5" />
                  Guest Area
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleNavigation('/browse')}
                  className="justify-start gap-3"
                >
                  <Hotel className="h-5 w-5" />
                  Browse Hotels
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => handleNavigation('/hotel')}
                  className="justify-start gap-3"
                >
                  <Hotel className="h-5 w-5" />
                  Hotel Area
                </Button>
                
                {/* Guest Account Link - Mobile (authenticated only) */}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleNavigation('/guest-account')}
                    className="justify-start gap-3"
                  >
                    <UserCircle className="h-5 w-5" />
                    Guest Account
                  </Button>
                )}
                
                {/* Account Status Link - Mobile (authenticated only) */}
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleNavigation('/account')}
                    className="justify-start gap-3"
                  >
                    <User className="h-5 w-5" />
                    Account Status
                  </Button>
                )}
                
                {/* Admin Panel Link - Mobile (admin only) */}
                {showAdminUI && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleNavigation('/admin')}
                    className="justify-start gap-3 border-primary/50 bg-primary/5"
                    disabled={isLoading}
                  >
                    <Shield className="h-5 w-5" />
                    Admin Panel
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
