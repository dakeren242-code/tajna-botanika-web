import { useEffect, lazy, Suspense } from 'react';
import { initPostHog, phPage } from './lib/posthog';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';
import { PerformanceProvider } from './contexts/PerformanceContext';
import { ConsentProvider } from './contexts/ConsentContext';
import { useTracking, trackPageView } from './hooks/useTracking';
import GlobalBackground from './components/GlobalBackground';
import FlyingUFOs from './components/FlyingUFOs';
import PersistentDecorations from './components/PersistentDecorations';
import HeroSection from './components/HeroSection';
import Header from './components/Header';
import { Loader2 } from 'lucide-react';
import { supabase } from './lib/supabase';

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
// FloatingActionButton removed — replaced by SupportChat
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
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Deals = lazy(() => import('./pages/Deals'));
const BundleBuilder = lazy(() => import('./pages/BundleBuilder'));
const CookieBanner = lazy(() => import('./components/CookieBanner'));
const Blog = lazy(() => import('./pages/Blog'));
const Academy = lazy(() => import('./pages/Academy'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogSection = lazy(() => import('./components/BlogSection'));
const SupportChat = lazy(() => import('./components/SupportChat'));
const UrgencyBanner = lazy(() => import('./components/UrgencyBanner'));
const ExitIntentPopup = lazy(() => import('./components/ExitIntentPopup'));
const ProductComparisonSection = lazy(() => import('./components/ProductComparisonSection'));
const SeasonalBanner = lazy(() => import('./components/SeasonalBanner'));
const ReferralSection = lazy(() => import('./components/ReferralSection'));
const FloatingRegisterCTA = lazy(() => import('./components/FloatingRegisterCTA'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black">
    <div className="text-center">
      <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto mb-3" />
      <p className="text-emerald-400/60 text-sm">Načítání...</p>
    </div>
  </div>
);

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToProducts) {
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          const headerOffset = 80;
          const elementPosition = productsSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#products') {
      setTimeout(() => {
        const productsSection = document.getElementById('products');
        if (productsSection) {
          const headerOffset = 80;
          const elementPosition = productsSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 200);
    }
  }, []);

  return (
    <div className="text-white overflow-x-hidden">
      <main className="relative z-10">
        <HeroSection />

        <Suspense fallback={null}>
          <ScrollReveal direction="up">
            <TrustBadgesSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>}>
          <div className="relative overflow-hidden">
            <MovingCarts />
            <ScrollReveal direction="fade">
              <ProductsSection />
            </ScrollReveal>
          </div>
        </Suspense>

        <Suspense fallback={null}>
          <ScrollReveal direction="fade">
            <ProductComparisonSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={null}>
          <ScrollReveal direction="fade">
            <ExperienceSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={null}>
          <ScrollReveal direction="up">
            <SpecialOffersSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={null}>
          <SeasonalBanner />
        </Suspense>

        <Suspense fallback={null}>
          <ScrollReveal direction="fade">
            <TestimonialsSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={null}>
          <ScrollReveal direction="up">
            <ReferralSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={null}>
          <ScrollReveal direction="up">
            <BlogSection />
          </ScrollReveal>
        </Suspense>

        {/* InstagramSection removed — fake engagement metrics */}

        <Suspense fallback={null}>
          <ScrollReveal direction="fade">
            <FAQSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={null}>
          <ScrollReveal direction="fade">
            <ContactSection />
          </ScrollReveal>
        </Suspense>

        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
    </div>
  );
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = '';
  }, [location.pathname]);
  return null;
}

function PageViewTracker() {
  const location = useLocation();
  useEffect(() => {
    // Capture fbclid from URL and store for Meta EMQ improvement
    const params = new URLSearchParams(window.location.search);
    const fbclid = params.get('fbclid');
    if (fbclid) {
      // Store fbclid with timestamp — used later in CAPI Purchase events
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      sessionStorage.setItem('tb_fbclid', fbclid);
      sessionStorage.setItem('tb_fbc', fbc);
      // Also store in cookie for _fbc (Meta format)
      const expires = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `_fbc=${fbc}; expires=${expires}; path=/; SameSite=Lax`;
    }

    trackPageView(location.pathname);
    // Track in Supabase for admin dashboard stats (fire-and-forget, no await)
    // Skip page_view logging for admin devices to avoid inflating stats
    const isAdminDevice = localStorage.getItem('tb_admin') === '1';
    if (!isAdminDevice) {
      let sid = sessionStorage.getItem('vsid');
      if (!sid) {
        sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        sessionStorage.setItem('vsid', sid);
      }
      supabase.auth.getUser().then(({ data }) => {
        supabase.from('page_views').insert({
          session_id: sid,
          path: location.pathname,
          user_id: data?.user?.id ?? null,
        }).then(() => {/* silent */});
      });
    }
    phPage(location.pathname);
  }, [location.pathname]);
  return null;
}

function TrackingWrapper({ children }: { children: React.ReactNode }) {
  useTracking();
  // Init PostHog once
  useEffect(() => { initPostHog(); }, []);
  return <>{children}</>;
}

// Global visitor count exposed for AdminDashboard
let _visitorCount = 0;
let _visitorListeners: Array<(n: number) => void> = [];
export function getVisitorCount() { return _visitorCount; }
export function onVisitorCountChange(cb: (n: number) => void) {
  _visitorListeners.push(cb);
  return () => { _visitorListeners = _visitorListeners.filter(l => l !== cb); };
}

function VisitorPresenceTracker() {
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    // Admin devices don't participate in presence at all — they only listen
    const isAdminDevice = isAdmin || localStorage.getItem('tb_admin') === '1';

    // Mark device as admin if logged in as admin (persists even after logout)
    if (isAdmin) {
      localStorage.setItem('tb_admin', '1');
    }

    let sid = sessionStorage.getItem('vsid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem('vsid', sid);
    }

    const ch = supabase.channel('visitors', { config: { presence: { key: sid } } });
    ch.on('presence', { event: 'sync' }, () => {
      const state = ch.presenceState();
      let count = 0;
      for (const key of Object.keys(state)) {
        const entries = state[key] as any[];
        if (entries && entries.length > 0 && !entries[0].adm) {
          count++;
        }
      }
      _visitorCount = count;
      _visitorListeners.forEach(cb => cb(_visitorCount));
    });
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Admin devices track with adm flag so they're excluded from count
        // Non-admin devices track normally
        await ch.track({ t: Date.now(), adm: isAdminDevice });
      }
    });
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, user]);
  return null;
}

function App() {
  return (
    <PerformanceProvider>
      <ConsentProvider>
        <AuthProvider>
          <CartProvider>
            <LoyaltyProvider>
            <Router>
              <TrackingWrapper>
                <ScrollToTop />
                <PageViewTracker />
                <VisitorPresenceTracker />
                <GlobalBackground />
                <PersistentDecorations />
                <FlyingUFOs />
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
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/akce" element={<Deals />} />
                    <Route path="/balicek" element={<BundleBuilder />} />
                    <Route path="/akademie" element={<Academy />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/podminky" element={<Terms />} />
                    <Route path="/soukromi" element={<Privacy />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <Suspense fallback={null}>
                  <UrgencyBanner />
                </Suspense>
                <Suspense fallback={null}>
                  <ExitIntentPopup />
                </Suspense>
                <Suspense fallback={null}>
                  <FloatingRegisterCTA />
                </Suspense>
                <Suspense fallback={null}>
                  <CookieBanner />
                </Suspense>
                <Suspense fallback={null}>
                  <SupportChat />
                </Suspense>
              </TrackingWrapper>
            </Router>
          </LoyaltyProvider>
          </CartProvider>
        </AuthProvider>
      </ConsentProvider>
    </PerformanceProvider>
  );
}

export default App;
