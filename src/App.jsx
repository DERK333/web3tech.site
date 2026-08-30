import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import BlogLayout from '@/components/blog/Layout';
import Home from '@/pages/Home';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost.jsx';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import OAuthConsent from '@/pages/OAuthConsent';
import Connect from '@/pages/Connect';
import Assistant from '@/pages/Assistant';
import FAQ from '@/pages/FAQ';
import Categories from '@/pages/Categories';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Resources from '@/pages/Resources';
import SearchPage from '@/pages/Search';
import Tags from '@/pages/Tags';
import Archive from '@/pages/Archive';
import Testimonials from '@/pages/Testimonials';
import Subscribe from '@/pages/Subscribe';
import { AnimatePresence, motion } from 'framer-motion';
import PageViewTracker from '@/components/PageViewTracker';

const pageVariants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

const pageTransition = { duration: 0.18, ease: "easeInOut" };

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        style={{ width: "100%" }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth/consent" element={<OAuthConsent />} />
          <Route element={<BlogLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/subscribe" element={<Subscribe />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const AuthenticatedApp = () => (
  <>
    <PageViewTracker />
    <AnimatedRoutes />
  </>
);


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App