import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Components
import { OnboardingProvider } from "@/components/Onboarding/OnboardingProvider";
import LanguageModal from "@/components/Onboarding/LanguageModal";
import WalkthroughOverlay from "@/components/Onboarding/WalkthroughOverlay";
import Chatbot from "@/components/Chatbot/Chatbot";
import IntroLoader from "@/components/IntroLoader";
import PageLoader from "@/components/PageLoader";

// Stores & Libs
import { useThemeStore, useAuthStore, useApplicationStore, useNotificationStore } from "@/lib/store";
import { useSchemeStore } from "@/stores/schemeStore";
import { useAuditStore } from "@/stores/auditStore";
import { isAdminRole } from "@/lib/rbac";

// Lazy Pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Services = lazy(() => import("./pages/Services"));
const Eligibility = lazy(() => import("./pages/Eligibility"));
const Category = lazy(() => import("./pages/Category"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const SchemeDetail = lazy(() => import("./pages/SchemeDetail"));
const Applications = lazy(() => import("./pages/Applications"));
const ApplicationDetail = lazy(() => import("./pages/ApplicationDetail"));
const Profile = lazy(() => import("./pages/Profile"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Placeholder = lazy(() => import("./pages/Placeholder"));

// Admin lazy pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSchemes = lazy(() => import("./pages/admin/AdminSchemes"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminApplications = lazy(() => import("./pages/admin/AdminApplications"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));

const queryClient = new QueryClient();

// Admin route guard — uses unified auth store
const AdminGuard = ({ children }) => {
  const { isAuthenticated, user, isAuthChecking } = useAuthStore();

  if (isAuthChecking) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdminRole(user?.role)) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have admin privileges.</p>
      </div>
    </div>
  );
  return children;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const initTheme = useThemeStore((s) => s.initTheme);
  const initAuthListener = useAuthStore((s) => s.initAuthListener);
  const loadSchemes = useSchemeStore((s) => s.loadSchemes);
  const loadApplications = useApplicationStore((s) => s.loadApplications);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const loadAuditLogs = useAuditStore((s) => s.loadLogs);
  const user = useAuthStore((s) => s.user);
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    initTheme();
    loadSchemes();
    
    // Explicitly check session on mount to prevent stuck loading
    checkSession();

    // Supabase onAuthStateChange listener — handles sign-in, sign-out, token refresh
    const unsubscribe = initAuthListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initTheme, initAuthListener, loadSchemes, checkSession]);

  // Load user-specific data when user is authenticated/available
  useEffect(() => {
    if (user?.id) {
      loadApplications();
      loadNotifications();
      // Only load audit logs if admin? Or just load them
      loadAuditLogs();
    }
  }, [user?.id, loadApplications, loadNotifications, loadAuditLogs]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingProvider>
          <Toaster />
          <Sonner />
          <LanguageModal />
          <WalkthroughOverlay />

          {isLoading && <IntroLoader onComplete={() => setIsLoading(false)} />}

          <BrowserRouter>
            <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public / User routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/eligibility" element={<Eligibility />} />
                  <Route path="/category/:categoryId" element={<Category />} />
                  <Route path="/service/:serviceId" element={<ServiceDetail />} />
                  <Route path="/schemes/:slug" element={<SchemeDetail />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/applications/:id" element={<ApplicationDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/notifications" element={<Notifications />} />

                  {/* Footer Placeholder routes */}
                  <Route path="/about" element={<Placeholder />} />
                  <Route path="/help" element={<Placeholder />} />
                  <Route path="/privacy" element={<Placeholder />} />
                  <Route path="/terms" element={<Placeholder />} />

                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                  <Route path="/admin/schemes" element={<AdminGuard><AdminSchemes /></AdminGuard>} />
                  <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                  <Route path="/admin/applications" element={<AdminGuard><AdminApplications /></AdminGuard>} />
                  <Route path="/admin/notifications" element={<AdminGuard><AdminNotifications /></AdminGuard>} />
                  <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
                  <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
                  <Route path="/admin/roles" element={<AdminGuard><AdminRoles /></AdminGuard>} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Chatbot />
            </div>
          </BrowserRouter>
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
