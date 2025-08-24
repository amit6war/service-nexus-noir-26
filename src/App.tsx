
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProviderDashboard from "./pages/ProviderDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProviderProfile from "./pages/ProviderProfile";
import ProviderDetail from "./pages/ProviderDetail";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import CheckoutV2 from "./pages/CheckoutV2";
import PaymentSuccess from "./components/PaymentSuccess";
import PaymentSuccessV2 from "./components/PaymentSuccessV2";
import ErrorBoundary from "./components/ErrorBoundary";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/provider-dashboard" element={<ProviderDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/provider-profile" element={<ProviderProfile />} />
                <Route path="/provider/:id" element={<ProviderDetail />} />
                <Route path="/checkout" element={<CheckoutV2 />} />
                <Route path="/checkout-v1" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccessV2 />} />
                <Route path="/payment-success-v1" element={<PaymentSuccess />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
