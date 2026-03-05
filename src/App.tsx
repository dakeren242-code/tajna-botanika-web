import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { useMetaTracking, useScrollDepthTracking, useTimeOnPageTracking } from './hooks/useMetaTracking';
import { initFbcPersistence } from './lib/metaTracking';
import ParticleBackground from './components/ParticleBackground';
import HeroSection from './components/HeroSection';
import Header from './components/Header';
import { Loader2 } from 'lucide-react';

const TrustBadgesSection = lazy(() => import('./components/TrustBadgesSection'));
const ProductsSection = lazy(() => import('./components/ProductsSection'));
const SpecialOffersSection = lazy(() => import('./components/SpecialOffersSection'));
const ExperienceSection = lazy(() => import('./components/ExperienceSection'));
const TestimonialsSection = lazy(() => import('./components/TestimonialsSection'));
const FAQSection = lazy(() => import('./components/FAQSection'));
const ContactSection = lazy(() => import('./components/ContactSection'));
const Footer = lazy(() => import('./components/Footer'));
const ProductDetail = lazy(() => import('./components/ProductDetail'));
const MovingCarts = lazy(() => import('./components/MovingCarts'));
const ScrollReveal = lazy(() => import('./components/ScrollReveal'));
const LiveNotifications = lazy(() => import('./components/LiveNotifications'));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Success = lazy(() => import('./pages/Success').then(m => ({ default: m.Success })));
const PaymentOk = lazy(() => import('./pages/PaymentOk'));
const PaymentErr = lazy(() => import('./pages/PaymentErr'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const OrderDetail = lazy(() => import('./pages/OrderDetail'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminOrderDetail = lazy(() => import('./pages/AdminOrderDetail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const SuperAdminRoute = lazy(() => import('./components/auth/SuperAdminRoute'));
const Terms = lazy(() => import('./pages/Terms'));

const ADMIN_ROUTES = ['/admin', '/dashboard'];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route));
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
  </div>
);

function RouteChangeTracker() {
  const location = useLocation();
  const { trackPageView } = useMetaTracking();

  useEffect(() => {
    // Inicializuj fbc persistenci při každé route change — zachytí fbclid po redirectu
    // i obnoví cookie z localStorage pokud expirovala nebo zmizela po redirectu
    initFbcPersistence();

    if (!isAdminRoute(location.pathname)) {
      trackPageView();
    }
  }, [location.pathname, location.search]);

  return null;
}

function EngagementTracker() {
  useScrollDepthTracking();
  useTimeOnPageTracking();
  return null;
}

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToProducts) {
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          const headerOffset = 80;
          const offsetPosition =
            productsSection.getBoundingClientRect().top +
            window.pageYOffset -
            headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    if (window.location.hash === '#products') {
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          const headerOffset = 80;
          const offsetPosition =
            productsSection.getBoundingClientRect().top +
            window.pageYOffset -
            headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 200);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <ParticleBackground />

      <main className="relative z-10">
        <HeroSection />

        <Suspense fallback={<div className="h-32" />}>
          <div className="relative">
            <ScrollReveal direction="up">
              <TrustBadgesSection />
            </ScrollReveal>
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>}>
          <div className="relative overflow-hidden">
            <MovingCarts />
            <ProductsSection />
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <div className="relative">
            <ScrollReveal direction="scale">
              <SpecialOffersSection />
            </ScrollReveal>
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <div className="relative">
            <ScrollReveal direction="fade">
              <ExperienceSection />
            </ScrollReveal>
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <div className="relative">
            <ScrollReveal direction="scale">
              <TestimonialsSection />
            </ScrollReveal>
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <div className="relative">
            <ScrollReveal direction="up">
              <FAQSection />
            </ScrollReveal>
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-64" />}>
          <div className="relative">
            <ScrollReveal direction="fade">
              <ContactSection />
            </ScrollReveal>
          </div>
        </Suspense>

        <Suspense fallback={<div className="h-32" />}>
          <Footer />
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <PerformanceProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <RouteChangeTracker />
            <EngagementTracker />
            <Header />
            <Suspense fallback={null}>
              <LiveNotifications />
            </Suspense>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/success" element={<Success />} />
                <Route path="/paymentok" element={<PaymentOk />} />
                <Route path="/paymenterr" element={<PaymentErr />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/orders/:orderId" element={<OrderDetail />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={
                  <SuperAdminRoute>
                    <Dashboard />
                  </SuperAdminRoute>
                } />
                <Route path="/dashboard/orders/:orderId" element={
                  <SuperAdminRoute>
                    <AdminOrderDetail />
                  </SuperAdminRoute>
                } />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/terms" element={<Terms />} />
              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </AuthProvider>
    </PerformanceProvider>
  );
}

export default App;
