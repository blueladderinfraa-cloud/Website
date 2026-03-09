import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  FileText,
  Image,
  Calendar,
  Clock,
  ArrowRight,
  Lock,
  FolderOpen,
} from "lucide-react";

export default function ClientPortal() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: clientProjects, isLoading: projectsLoading } = trpc.clientPortal.myProjects.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "client",
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "client") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=800&fit=crop')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 to-[#0a1628]/80" />
          </div>
          <div className="container relative z-10">
            <div className="max-w-xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Client Portal
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Access your project dashboard, view progress updates, daily photo logs, 
                and download important documents. Please log in to continue.
              </p>
              <Button
                size="lg"
                className="gradient-accent text-accent-foreground font-semibold"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Login to Access
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="section-padding bg-white">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                What You'll Get Access To
              </h2>
              <p className="text-muted-foreground">
                Our client portal provides comprehensive tools to track your project's progress.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Building2, title: "Project Timeline", description: "Track milestones and phases with visual progress bars" },
                { icon: Image, title: "Daily Photo Logs", description: "View daily construction photos and updates" },
                { icon: FileText, title: "Document Vault", description: "Access contracts, blueprints, and invoices" },
                { icon: Calendar, title: "Schedule Updates", description: "Stay informed about project timelines" },
              ].map((feature) => (
                <Card key={feature.title} className="border-0 shadow-elegant text-center">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.name || "Client"}
              </h1>
              <p className="text-muted-foreground">
                Track your project progress and access important documents
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <section className="py-8">
        <div className="container">
          {projectsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-elegant">
                  <CardContent className="p-6">
                    <div className="h-40 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : clientProjects && clientProjects.length > 0 ? (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-foreground">Your Projects</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clientProjects.map((cp: any) => (
                  <Link key={cp.id} href={`/client/project/${cp.project.id}`}>
                    <Card className="border-0 shadow-elegant hover-lift cursor-pointer h-full">
                      <div className="relative h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={cp.project.coverImage || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=300&fit=crop"}
                          alt={cp.project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cp.project.status === "completed" ? "bg-green-500/90 text-white" :
                            cp.project.status === "ongoing" ? "bg-accent/90 text-accent-foreground" :
                            "bg-primary/90 text-white"
                          }`}>
                            {cp.project.status.charAt(0).toUpperCase() + cp.project.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                          {cp.project.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {cp.project.description || "Your construction project"}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-foreground">
                              {cp.project.progress || 0}%
                            </span>
                          </div>
                          <Progress value={cp.project.progress || 0} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-0 shadow-elegant">
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Projects Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any active projects. Contact us to start your construction journey.
                </p>
                <Link href="/contact">
                  <Button className="gradient-primary text-white">
                    Start a Project
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
