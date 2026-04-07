import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
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
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Deals = lazy(() => import('./pages/Deals'));
const BundleBuilder = lazy(() => import('./pages/BundleBuilder'));
const CookieBanner = lazy(() => import('./components/CookieBanner'));
const Blog = lazy(() => import('./pages/Blog'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const BlogSection = lazy(() => import('./components/BlogSection'));
const SupportChat = lazy(() => import('./components/SupportChat'));
const UrgencyBanner = lazy(() => import('./components/UrgencyBanner'));
const ExitIntentPopup = lazy(() => import('./components/ExitIntentPopup'));
const ProductComparisonSection = lazy(() => import('./components/ProductComparisonSection'));
const InstagramSection = lazy(() => import('./components/InstagramSection'));
const SeasonalBanner = lazy(() => import('./components/SeasonalBanner'));
const ReferralSection = lazy(() => import('./components/ReferralSection'));
const FloatingRegisterCTA = lazy(() => import('./components/FloatingRegisterCTA'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-black">
    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
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

        <Suspense fallback={null}>
          <ScrollReveal direction="fade">
            <InstagramSection />
          </ScrollReveal>
        </Suspense>

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
    trackPageView(location.pathname);
  }, [location.pathname]);
  return null;
}

function TrackingWrapper({ children }: { children: React.ReactNode }) {
  useTracking();
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
  const { isAdmin } = useAuth();

  useEffect(() => {
    let sid = sessionStorage.getItem('vsid');
    if (!sid) {
      sid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem('vsid', sid);
    }
    const ch = supabase.channel('visitors', { config: { presence: { key: sid } } });
    ch.on('presence', { event: 'sync' }, () => {
      // Count only non-admin visitors
      const state = ch.presenceState();
      let count = 0;
      for (const key of Object.keys(state)) {
        const entries = state[key] as any[];
        if (entries && entries.length > 0 && !entries[0].isAdmin) {
          count++;
        }
      }
      _visitorCount = count;
      _visitorListeners.forEach(cb => cb(_visitorCount));
    });
    ch.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await ch.track({ t: Date.now(), isAdmin: !!isAdmin });
      }
    });
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);
  return null;
}

function App() {
  return (
    <PerformanceProvider>
      <ConsentProvider>
        <AuthProvider>
          <CartProvider>
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
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/akce" element={<Deals />} />
                    <Route path="/balicek" element={<BundleBuilder />} />
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
          </CartProvider>
        </AuthProvider>
      </ConsentProvider>
    </PerformanceProvider>
  );
}

export default App;
