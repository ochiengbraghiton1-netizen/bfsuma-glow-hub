import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import { CartProvider } from "@/contexts/CartContext";
import { useReferral } from "@/hooks/use-referral";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import JoinBusiness from "./pages/JoinBusiness";
import AboutPage from "./pages/AboutPage";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Promotions from "./pages/admin/Promotions";
import Affiliates from "./pages/admin/Affiliates";
import AffiliateLinks from "./pages/admin/AffiliateLinks";
import Consultations from "./pages/admin/Consultations";
import Team from "./pages/admin/Team";
import Content from "./pages/admin/Content";
import Admins from "./pages/admin/Admins";
import BusinessRegistrations from "./pages/admin/BusinessRegistrations";
import Blog from "./pages/admin/Blog";
import AffiliateDashboard from "./pages/affiliate/Dashboard";
import ProductAffiliate from "./pages/ProductAffiliate";
import BlogPage from "./pages/BlogPage";
import CategoryPage from "./pages/CategoryPage";

// Component to initialize referral tracking
const ReferralTracker = () => {
  useReferral();
  return null;
};

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
              <ReferralTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
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
                  <Route path="affiliate-links" element={<AffiliateLinks />} />
                  <Route path="consultations" element={<Consultations />} />
                  <Route path="team" element={<Team />} />
                  <Route path="content" element={<Content />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="admins" element={<Admins />} />
                  <Route path="business-registrations" element={<BusinessRegistrations />} />
                </Route>
                <Route path="/affiliate" element={<AffiliateDashboard />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:slug" element={<BlogPage />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/p/:slug" element={<ProductAffiliate />} />
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
