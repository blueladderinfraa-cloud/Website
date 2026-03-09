import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  FileText,
  Image,
  CheckCircle,
  Circle,
  MapPin,
  Building2,
} from "lucide-react";

export default function ClientProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const projectId = parseInt(id || "0");

  const { data: project, isLoading } = trpc.projects.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId && isAuthenticated }
  );

  const { data: dailyLogs } = trpc.clientPortal.getDailyLogs.useQuery(
    { projectId },
    { enabled: !!projectId && isAuthenticated }
  );

  const { data: documents } = trpc.clientPortal.getDocuments.useQuery(
    { projectId },
    { enabled: !!projectId && isAuthenticated }
  );

  if (loading || isLoading) {
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
    window.location.href = getLoginUrl();
    return null;
  }

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
            <Link href="/client">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const phases = project.phases || [];
  const images = project.images || [];

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-8 bg-white border-b">
        <div className="container">
          <Link href="/client">
            <Button variant="ghost" className="mb-4 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="relative rounded-xl overflow-hidden h-48">
                <img
                  src={project.coverImage || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=300&fit=crop"}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <div className="lg:w-2/3">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === "completed" ? "bg-green-500/90 text-white" :
                  project.status === "ongoing" ? "bg-accent/90 text-accent-foreground" :
                  "bg-primary/90 text-white"
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                  {project.category}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-2">{project.title}</h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-semibold text-foreground">{project.progress || 0}%</span>
                </div>
                <Progress value={project.progress || 0} className="h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="py-8">
        <div className="container">
          <Tabs defaultValue="timeline" className="space-y-6">
            <TabsList className="bg-white shadow-elegant">
              <TabsTrigger value="timeline" className="gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-2">
                <Image className="w-4 h-4" />
                Daily Logs
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="w-4 h-4" />
                Documents
              </TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {phases.length > 0 ? (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                      <div className="space-y-8">
                        {phases.map((phase: any, index: number) => (
                          <div key={phase.id} className="relative pl-12">
                            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              phase.status === "completed" ? "bg-green-500 text-white" :
                              phase.status === "in_progress" ? "bg-accent text-accent-foreground" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {phase.status === "completed" ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-foreground">{phase.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  phase.status === "completed" ? "bg-green-100 text-green-700" :
                                  phase.status === "in_progress" ? "bg-accent/20 text-accent-foreground" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {phase.status.replace("_", " ").charAt(0).toUpperCase() + phase.status.slice(1).replace("_", " ")}
                                </span>
                              </div>
                              
                              {phase.description && (
                                <p className="text-muted-foreground text-sm mb-3">{phase.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                                {phase.startDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Start: {new Date(phase.startDate).toLocaleDateString()}
                                  </div>
                                )}
                                {phase.endDate && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    End: {new Date(phase.endDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                              
                              {phase.progress !== null && (
                                <div className="mt-3">
                                  <Progress value={phase.progress} className="h-1.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No timeline phases available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Daily Logs Tab */}
            <TabsContent value="photos">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle>Daily Photo Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyLogs && dailyLogs.length > 0 ? (
                    <div className="space-y-6">
                      {dailyLogs.map((log: any) => (
                        <div key={log.id} className="border-b pb-6 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground">
                              {new Date(log.logDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          
                          {log.notes && (
                            <p className="text-muted-foreground mb-4">{log.notes}</p>
                          )}
                          
                          {log.images && log.images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {log.images.map((img: string, i: number) => (
                                <a
                                  key={i}
                                  href={img}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="relative aspect-square rounded-lg overflow-hidden group"
                                >
                                  <img
                                    src={img}
                                    alt={`Log photo ${i + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                </a>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                            {log.weather && (
                              <span>Weather: {log.weather}</span>
                            )}
                            {log.workersCount && (
                              <span>Workers: {log.workersCount}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No daily logs available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle>Document Vault</CardTitle>
                </CardHeader>
                <CardContent>
                  {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{doc.name}</h4>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span className="capitalize">{doc.type.replace("_", " ")}</span>
                                <span>
                                  {new Date(doc.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No documents available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
