import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/hooks/use-theme";
import { CartProvider } from "@/contexts/CartContext";
import { useReferral } from "@/hooks/use-referral";
import GTMPageView from "@/components/GTMPageView";
import { Loader2 } from "lucide-react";

// Lazy-load non-critical UI overlays
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const Chatbot = lazy(() => import("@/components/Chatbot"));


// Index page — lazy loaded to reduce initial JS parse/execution
const Index = lazy(() => import("./pages/Index"));

// Lazy-loaded routes for code splitting
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const JoinBusiness = lazy(() => import("./pages/JoinBusiness"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Products = lazy(() => import("./pages/admin/Products"));
const Categories = lazy(() => import("./pages/admin/Categories"));
const Orders = lazy(() => import("./pages/admin/Orders"));
const Promotions = lazy(() => import("./pages/admin/Promotions"));
const Affiliates = lazy(() => import("./pages/admin/Affiliates"));
const AffiliateLinks = lazy(() => import("./pages/admin/AffiliateLinks"));
const Consultations = lazy(() => import("./pages/admin/Consultations"));
const Team = lazy(() => import("./pages/admin/Team"));
const Content = lazy(() => import("./pages/admin/Content"));
const Admins = lazy(() => import("./pages/admin/Admins"));
const BusinessRegistrations = lazy(() => import("./pages/admin/BusinessRegistrations"));
const Blog = lazy(() => import("./pages/admin/Blog"));
const AffiliateDashboard = lazy(() => import("./pages/affiliate/Dashboard"));
const DistributorDashboard = lazy(() => import("./pages/distributor/Dashboard"));
const ProductAffiliate = lazy(() => import("./pages/ProductAffiliate"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogCategoryPage = lazy(() => import("./pages/BlogCategoryPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const SocialPosts = lazy(() => import("./pages/admin/SocialPosts"));
const Leads = lazy(() => import("./pages/admin/Leads"));
const ProductKeywords = lazy(() => import("./pages/admin/ProductKeywords"));
const LocationLanding = lazy(() => import("./pages/LocationLanding"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const WellnessHubsIndex = lazy(() => import("./pages/WellnessHubsIndex"));
const WellnessHubPage = lazy(() => import("./pages/WellnessHubPage"));
const AdminWellnessHubs = lazy(() => import("./pages/admin/WellnessHubs"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

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
            <Suspense fallback={null}>
              <Toaster />
              <Sonner />
            </Suspense>
            <BrowserRouter>
              <ReferralTracker />
              <GTMPageView />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/orders" element={<MyOrders />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                  <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
                  <Route path="/order-success/:orderId" element={<OrderConfirmation />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
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
                    <Route path="social-posts" element={<SocialPosts />} />
                    <Route path="leads" element={<Leads />} />
                    <Route path="product-keywords" element={<ProductKeywords />} />
                    <Route path="wellness-hubs" element={<AdminWellnessHubs />} />
                  </Route>
                  <Route path="/affiliate" element={<AffiliateDashboard />} />
                  <Route path="/distributor/dashboard" element={<DistributorDashboard />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/category/:slug" element={<BlogCategoryPage />} />
                  <Route path="/blog/:slug" element={<BlogPage />} />
                  <Route path="/category" element={<CategoryPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/products" element={<CategoryPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/p/:slug" element={<ProductAffiliate />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/terms" element={<TermsConditions />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/wellness" element={<WellnessHubsIndex />} />
                  <Route path="/wellness/:slug" element={<WellnessHubPage />} />
                  <Route path="/:city" element={<LocationLanding />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Suspense fallback={null}>
                  <Chatbot />
                  
                </Suspense>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </CartProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
