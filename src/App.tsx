import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Aircraft from "./pages/Aircraft";
import Employees from "./pages/Employees";
import Shifts from "./pages/Shifts";
import ShiftDetails from "./pages/ShiftDetails";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import Reports from "./pages/Reports";
import ReportDetail from "./pages/ReportDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/aircraft" element={<Aircraft />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/shifts" element={<Shifts />} />
          <Route path="/shifts/:id" element={<ShiftDetails />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/reports/new" element={<ReportDetail />} />
          <Route path="/test" element={<Test />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
