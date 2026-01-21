import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TreasuryDashboard from "./pages/TreasuryDashboard";
import BusinessUnits from "./pages/BusinessUnits";
import ForecastAccuracy from "./pages/ForecastAccuracy";
import ARAgingUpload from "./pages/ARAgingUpload";
import APAgingUpload from "./pages/APAgingUpload";
import ContractsUpload from "./pages/ContractsUpload";
import PatternsUpload from "./pages/PatternsUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TreasuryDashboard />} />
          <Route path="/business-units" element={<BusinessUnits />} />
          <Route path="/accuracy" element={<ForecastAccuracy />} />
          <Route path="/upload/ar-aging" element={<ARAgingUpload />} />
          <Route path="/upload/ap-aging" element={<APAgingUpload />} />
          <Route path="/upload/contracts" element={<ContractsUpload />} />
          <Route path="/upload/patterns" element={<PatternsUpload />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
