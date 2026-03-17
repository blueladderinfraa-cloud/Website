import React, { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import WhatsAppButton from "./components/WhatsAppButton";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

// Eager-loaded: Home (fast initial load)
import Home from "./pages/Home";

// Lazy-loaded: Public pages
const About = React.lazy(() => import("./pages/About"));
const Services = React.lazy(() => import("./pages/Services"));
const Projects = React.lazy(() => import("./pages/Projects"));
const ProjectDetail = React.lazy(() => import("./pages/ProjectDetail"));
const Contact = React.lazy(() => import("./pages/Contact"));
const CostEstimator = React.lazy(() => import("./pages/CostEstimator"));

// Lazy-loaded: Portals
const ClientPortal = React.lazy(() => import("./pages/ClientPortal"));
const ClientProjectDetail = React.lazy(() => import("./pages/ClientProjectDetail"));
const SubcontractorPortal = React.lazy(() => import("./pages/SubcontractorPortal"));
const TenderDetail = React.lazy(() => import("./pages/TenderDetail"));

// Lazy-loaded: Admin
const AdminDashboard = React.lazy(() => import("./pages/admin/Dashboard"));
const AdminProjects = React.lazy(() => import("./pages/admin/Projects"));
const AdminProjectEdit = React.lazy(() => import("./pages/admin/ProjectEdit"));
const AdminInquiries = React.lazy(() => import("./pages/admin/Inquiries"));
const AdminTestimonials = React.lazy(() => import("./pages/admin/Testimonials"));
const AdminServices = React.lazy(() => import("./pages/admin/Services"));
const AdminContent = React.lazy(() => import("./pages/admin/Content"));
const AdminSubcontractors = React.lazy(() => import("./pages/admin/Subcontractors"));
const AdminTenders = React.lazy(() => import("./pages/admin/Tenders"));
const AdminUsers = React.lazy(() => import("./pages/admin/Users"));
const AdminSettings = React.lazy(() => import("./pages/admin/Settings"));

function LoadingSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div
        style={{
          width: 40,
          height: 40,
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #3b82f6",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Switch>
        {/* Public pages */}
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:slug" component={ProjectDetail} />
        <Route path="/contact" component={Contact} />
        <Route path="/cost-estimator" component={CostEstimator} />

        {/* Client Portal */}
        <Route path="/client" component={ClientPortal} />
        <Route path="/client/project/:id" component={ClientProjectDetail} />

        {/* Subcontractor Portal */}
        <Route path="/subcontractor" component={SubcontractorPortal} />
        <Route path="/subcontractor/tender/:id" component={TenderDetail} />

        {/* Admin CMS */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/projects" component={AdminProjects} />
        <Route path="/admin/projects/new" component={AdminProjectEdit} />
        <Route path="/admin/projects/:id" component={AdminProjectEdit} />
        <Route path="/admin/inquiries" component={AdminInquiries} />
        <Route path="/admin/testimonials" component={AdminTestimonials} />
        <Route path="/admin/services" component={AdminServices} />
        <Route path="/admin/content" component={AdminContent} />
        <Route path="/admin/subcontractors" component={AdminSubcontractors} />
        <Route path="/admin/tenders" component={AdminTenders} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/settings" component={AdminSettings} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
