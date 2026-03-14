import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

// Public pages
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Contact from "./pages/Contact";
import CostEstimator from "./pages/CostEstimator";

// Portals
import ClientPortal from "./pages/ClientPortal";
import ClientProjectDetail from "./pages/ClientProjectDetail";
import SubcontractorPortal from "./pages/SubcontractorPortal";
import TenderDetail from "./pages/TenderDetail";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import AdminProjectEdit from "./pages/admin/ProjectEdit";
import AdminInquiries from "./pages/admin/Inquiries";
import AdminTestimonials from "./pages/admin/Testimonials";
import AdminServices from "./pages/admin/Services";
import AdminContent from "./pages/admin/Content";
import AdminSubcontractors from "./pages/admin/Subcontractors";
import AdminTenders from "./pages/admin/Tenders";
import AdminUsers from "./pages/admin/Users";

function Router() {
  return (
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
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
