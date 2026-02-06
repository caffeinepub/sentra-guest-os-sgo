import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, ErrorComponent } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import { I18nProvider } from './i18n/I18nProvider';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/AppLayout';
import GuestArea from './pages/GuestArea';
import BrowseHotels from './pages/BrowseHotels';
import HotelArea from './pages/HotelArea';
import GuestAccountPage from './pages/GuestAccountPage';
import AccountStatusPage from './pages/AccountStatusPage';
import AdminPanelPage from './pages/AdminPanelPage';
import './pwa/registerSW';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GuestArea,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowseHotels,
});

const hotelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel',
  component: HotelArea,
});

const guestAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest-account',
  component: GuestAccountPage,
});

const accountStatusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account-status',
  component: AccountStatusPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanelPage,
  errorComponent: ({ error }) => (
    <div className="container py-12">
      <ErrorComponent error={error} />
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  hotelRoute,
  guestAccountRoute,
  accountStatusRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
        <QueryClientProvider client={queryClient}>
          <InternetIdentityProvider>
            <I18nProvider>
              <RouterProvider router={router} />
              <Toaster />
            </I18nProvider>
          </InternetIdentityProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
