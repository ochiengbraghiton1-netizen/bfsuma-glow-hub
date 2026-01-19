import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import JoinBusiness from "./pages/JoinBusiness";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Promotions from "./pages/admin/Promotions";
import Affiliates from "./pages/admin/Affiliates";
import Consultations from "./pages/admin/Consultations";
import Team from "./pages/admin/Team";
import Content from "./pages/admin/Content";
import Admins from "./pages/admin/Admins";
import BusinessRegistrations from "./pages/admin/BusinessRegistrations";
import AffiliateDashboard from "./pages/affiliate/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CartProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/join-business" element={<JoinBusiness />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="promotions" element={<Promotions />} />
                  <Route path="affiliates" element={<Affiliates />} />
                  <Route path="consultations" element={<Consultations />} />
                  <Route path="team" element={<Team />} />
                  <Route path="content" element={<Content />} />
                  <Route path="admins" element={<Admins />} />
                  <Route path="business-registrations" element={<BusinessRegistrations />} />
                </Route>
                <Route path="/affiliate" element={<AffiliateDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
