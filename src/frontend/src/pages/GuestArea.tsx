import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useI18n } from '../i18n/I18nProvider';
import PrincipalIdPanel from '../components/profile/PrincipalIdPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Shield, Users, Globe, User, BarChart3 } from 'lucide-react';

export default function GuestArea() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              {t('guestArea.title')}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('guestArea.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate({ to: '/browse' })}
                className="gap-2"
              >
                <Building2 className="h-5 w-5" />
                {t('guestArea.browseHotels')}
              </Button>
              {isAuthenticated && (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate({ to: '/guest-account' })}
                    className="gap-2"
                  >
                    <User className="h-5 w-5" />
                    {t('guestArea.myAccount')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate({ to: '/account-status' })}
                    className="gap-2"
                  >
                    <BarChart3 className="h-5 w-5" />
                    {t('guestArea.accountStatus')}
                  </Button>
                </>
              )}
            </div>
          </div>

          {isAuthenticated && (
            <div className="mx-auto max-w-2xl mt-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Welcome back!</CardTitle>
                  <CardDescription>You are logged in</CardDescription>
                </CardHeader>
                <CardContent>
                  <PrincipalIdPanel />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 mb-4 text-primary" />
                  <CardTitle>Secure & Decentralized</CardTitle>
                  <CardDescription>
                    Built on the Internet Computer blockchain for maximum security and transparency
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 mb-4 text-primary" />
                  <CardTitle>Easy Booking</CardTitle>
                  <CardDescription>
                    Simple and intuitive booking process with instant confirmation
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <Globe className="h-10 w-10 mb-4 text-primary" />
                  <CardTitle>Global Hotels</CardTitle>
                  <CardDescription>
                    Access hotels worldwide through our decentralized platform
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
