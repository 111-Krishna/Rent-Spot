import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useClerkSync } from "@/hooks/use-clerk-sync";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Home from "./pages/home";
import PropertyDetails from "./pages/PropertyDetails";
import ListProperty from "./pages/ListProperty";
import PaymentPage from "./pages/PaymentPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import SupportAssistantPage from "./pages/SupportAssistantPage";

const queryClient = new QueryClient();

// Wrapper component to use Clerk hooks
const AppContent = () => {
  // This hook runs inside ClerkProvider context
  useClerkSync();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/home/:id" element={<PropertyDetails />} />
            <Route path="/home/:id/payment" element={<PaymentPage />} />
            <Route path="/owner/list-property" element={<ListProperty />} />
            <Route path="/support" element={<SupportAssistantPage />} />
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

export default App;
