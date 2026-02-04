import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useCurrentUser';
import { useI18n } from '../i18n/I18nProvider';
import LoginButton from './auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Menu, User, Shield, AlertCircle, RefreshCw, Languages } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AppHeader() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading, isFailed: adminFailed, refetch: refetchAdmin } = useIsAdmin();
  const { language, setLanguage, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const handleLanguageChange = (newLang: string) => {
    if (newLang === 'en' || newLang === 'id') {
      setLanguage(newLang);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/generated/sgo-logo.dim_512x512.png"
              alt="SGO Logo"
              className="h-8 w-8 rounded"
            />
            <span className="font-bold text-lg hidden sm:inline">SGO</span>
          </button>

          <nav className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => handleNavigation('/browse')}>
              {t('guestArea.browseHotels')}
            </Button>
            {isAuthenticated && (
              <>
                <Button variant="ghost" onClick={() => handleNavigation('/guest-account')}>
                  {t('header.guestAccount')}
                </Button>
                <Button variant="ghost" onClick={() => handleNavigation('/account-status')}>
                  {t('header.accountStatus')}
                </Button>
              </>
            )}
            {isAdmin && !adminLoading && (
              <>
                <Badge variant="default" className="ml-2">
                  Admin
                </Badge>
                <Button variant="ghost" onClick={() => handleNavigation('/admin')}>
                  {t('header.adminPanel')}
                </Button>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[100px] h-9">
              <Languages className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="id">Indonesia</SelectItem>
            </SelectContent>
          </Select>

          <div className="hidden md:block">
            <LoginButton />
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/browse')}>
                  {t('guestArea.browseHotels')}
                </Button>
                {isAuthenticated && (
                  <>
                    <Button variant="ghost" className="justify-start gap-2" onClick={() => handleNavigation('/guest-account')}>
                      <User className="h-4 w-4" />
                      {t('header.guestAccount')}
                    </Button>
                    <Button variant="ghost" className="justify-start" onClick={() => handleNavigation('/account-status')}>
                      {t('header.accountStatus')}
                    </Button>
                  </>
                )}
                {isAdmin && !adminLoading && (
                  <Button variant="ghost" className="justify-start gap-2" onClick={() => handleNavigation('/admin')}>
                    <Shield className="h-4 w-4" />
                    {t('header.adminPanel')}
                  </Button>
                )}
                <div className="pt-4 border-t">
                  <LoginButton />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {adminFailed && isAuthenticated && (
        <div className="border-t bg-yellow-500/10">
          <div className="container px-4 py-2">
            <Alert variant="default" className="border-yellow-500/50 bg-transparent">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-xs flex items-center justify-between gap-2">
                <span className="text-yellow-600 dark:text-yellow-400">
                  Admin verification temporarily unavailable. Retrying...
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetchAdmin()}
                  className="h-6 gap-1 text-yellow-600 dark:text-yellow-400"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </header>
  );
}
