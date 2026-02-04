import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRootRoute, createRoute, ErrorComponent } from '@tanstack/react-router';
import { InternetIdentityProvider } from './hooks/useInternetIdentity';
import AppLayout from './components/AppLayout';
import GuestArea from './pages/GuestArea';
import HotelArea from './pages/HotelArea';
import BrowseHotels from './pages/BrowseHotels';
import AccountStatusPage from './pages/AccountStatusPage';
import AdminPanelPage from './pages/AdminPanelPage';
import GuestAccountPage from './pages/GuestAccountPage';
import RouteDiagnosticsErrorCard from './components/diagnostics/RouteDiagnosticsErrorCard';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { registerServiceWorker } from './pwa/registerSW';

// Register service worker for PWA
registerServiceWorker();

const queryClient = new QueryClient();

// Root route with layout
const rootRoute = createRootRoute({
  component: AppLayout,
});

// Guest area route (public)
const guestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: GuestArea,
});

// Browse hotels route (public)
const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowseHotels,
});

// Hotel area route (requires auth)
const hotelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel',
  component: HotelArea,
});

// Account status route (requires auth)
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: AccountStatusPage,
});

// Admin panel route (requires auth + admin) with error boundary
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPanelPage,
  errorComponent: ({ error, reset }) => {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    return (
      <RouteDiagnosticsErrorCard
        title="Admin Panel Error"
        description="An unexpected error occurred while loading the admin panel"
        errorMessage={errorMessage}
        onRetry={reset}
      />
    );
  },
});

// Guest account route (requires auth)
const guestAccountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/guest-account',
  component: GuestAccountPage,
});

// Create router
const routeTree = rootRoute.addChildren([
  guestRoute,
  browseRoute,
  hotelRoute,
  accountRoute,
  adminRoute,
  guestAccountRoute,
]);
const router = createRouter({ routeTree });

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <InternetIdentityProvider>
          <RouterProvider router={router} />
          <Toaster />
        </InternetIdentityProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
