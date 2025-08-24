
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
const Home = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const Service = lazy(() => import("./pages/Service"));
const Services = lazy(() => import("./pages/Services"));
const Providers = lazy(() => import("./pages/Providers"));
const Provider = lazy(() => import("./pages/Provider"));
const CheckoutV2 = lazy(() => import("./pages/CheckoutV2"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Home />
                    </Suspense>
                  }
                />
                <Route
                  path="/auth"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Auth />
                    </Suspense>
                  }
                />
                <Route
                  path="/customer-dashboard"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <CustomerDashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/provider-dashboard"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <ProviderDashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="/service/:serviceId"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Service />
                    </Suspense>
                  }
                />
                <Route
                  path="/services"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Services />
                    </Suspense>
                  }
                />
                <Route
                  path="/providers"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Providers />
                    </Suspense>
                  }
                />
                <Route
                  path="/provider/:providerId"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <Provider />
                    </Suspense>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <CheckoutV2 />
                    </Suspense>
                  }
                />
                <Route
                  path="/payment-success"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <PaymentSuccess />
                    </Suspense>
                  }
                />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
