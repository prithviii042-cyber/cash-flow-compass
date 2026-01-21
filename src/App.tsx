import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import TreasuryDashboard from "./pages/TreasuryDashboard";
import BusinessUnits from "./pages/BusinessUnits";
import ForecastAccuracy from "./pages/ForecastAccuracy";
import ARAgingUpload from "./pages/ARAgingUpload";
import APAgingUpload from "./pages/APAgingUpload";
import ContractsUpload from "./pages/ContractsUpload";
import PatternsUpload from "./pages/PatternsUpload";
import SimulationDashboard from "./pages/SimulationDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><TreasuryDashboard /></ProtectedRoute>} />
            <Route path="/business-units" element={<ProtectedRoute><BusinessUnits /></ProtectedRoute>} />
            <Route path="/accuracy" element={<ProtectedRoute><ForecastAccuracy /></ProtectedRoute>} />
            <Route path="/simulation" element={<ProtectedRoute><SimulationDashboard /></ProtectedRoute>} />
            <Route path="/upload/ar-aging" element={<ProtectedRoute><ARAgingUpload /></ProtectedRoute>} />
            <Route path="/upload/ap-aging" element={<ProtectedRoute><APAgingUpload /></ProtectedRoute>} />
            <Route path="/upload/contracts" element={<ProtectedRoute><ContractsUpload /></ProtectedRoute>} />
            <Route path="/upload/patterns" element={<ProtectedRoute><PatternsUpload /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
