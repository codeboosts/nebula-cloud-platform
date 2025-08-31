import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import VPSManagement from "./pages/VPSManagement";
import DashboardLayout from "./components/layout/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="vps" element={<VPSManagement />} />
              <Route path="databases" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Database Management</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="security" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Security Groups</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="credits" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Credits & Billing</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="iam" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">IAM Management</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="storage" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">File Storage</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="pipelines" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">CI/CD Pipelines</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="notifications" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Notifications</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
              <Route path="settings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Account Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
