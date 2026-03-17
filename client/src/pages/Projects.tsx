import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { ArrowRight, Filter } from "lucide-react";
import { usePageSEO } from "@/hooks/usePageSEO";

const statusFilters = [
  { value: "", label: "All Projects" },
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "upcoming", label: "Upcoming" },
];

const categoryFilters = [
  { value: "", label: "All Categories" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "infrastructure", label: "Infrastructure" },
];

const defaultProjects = [
  {
    id: 1,
    slug: "skyline-towers",
    title: "Skyline Towers",
    description: "A 40-story mixed-use development featuring luxury apartments and retail spaces.",
    location: "Downtown, New York",
    status: "completed",
    category: "commercial",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    slug: "green-valley-homes",
    title: "Green Valley Homes",
    description: "Sustainable residential community with 150 eco-friendly homes.",
    location: "Green Valley, CA",
    status: "completed",
    category: "residential",
    coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    slug: "metro-logistics-hub",
    title: "Metro Logistics Hub",
    description: "State-of-the-art distribution center with automated systems.",
    location: "Industrial Park, NJ",
    status: "ongoing",
    category: "industrial",
    coverImage: "https://images.unsplash.com/photo-1565636291267-c23a0f4d6a1b?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    slug: "riverside-bridge",
    title: "Riverside Bridge",
    description: "Modern cable-stayed bridge connecting two major districts.",
    location: "Riverside, TX",
    status: "ongoing",
    category: "infrastructure",
    coverImage: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    slug: "tech-park-campus",
    title: "Tech Park Campus",
    description: "Innovation campus with office buildings and research facilities.",
    location: "Silicon Valley, CA",
    status: "upcoming",
    category: "commercial",
    coverImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    slug: "harbor-view-apartments",
    title: "Harbor View Apartments",
    description: "Luxury waterfront apartments with panoramic ocean views.",
    location: "Miami Beach, FL",
    status: "upcoming",
    category: "residential",
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
  },
];

export default function Projects() {
  usePageSEO({ title: "Our Projects - Blueladder Infra", description: "Explore our portfolio of completed and ongoing construction projects. Residential, commercial, industrial and infrastructure projects in Gujarat." });
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  const { data: dbProjects, isLoading } = trpc.projects.list.useQuery({
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  });

  const projects = dbProjects?.length ? dbProjects : defaultProjects;
  
  // Filter default projects if using them
  const filteredProjects = dbProjects?.length 
    ? projects 
    : projects.filter((p: any) => {
        if (statusFilter && p.status !== statusFilter) return false;
        if (categoryFilter && p.category !== categoryFilter) return false;
        return true;
      });

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
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
          <div className="max-w-3xl">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Portfolio</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
              Projects That Define Excellence
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Explore our portfolio of completed, ongoing, and upcoming projects. 
              Each project showcases our commitment to quality, innovation, and 
              customer satisfaction.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filter.value)}
                  className={statusFilter === filter.value ? "gradient-primary text-white" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <div className="flex flex-wrap gap-2">
              {categoryFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant={categoryFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(filter.value)}
                  className={categoryFilter === filter.value ? "gradient-accent text-accent-foreground" : ""}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-elegant">
                  <div className="h-64 bg-muted animate-pulse" />
                  <CardContent className="p-5">
                    <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-5 w-full bg-muted rounded animate-pulse mb-2" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project: any) => (
                <Link key={project.id} href={`/projects/${project.slug}`}>
                  <Card className="group overflow-hidden hover-lift border-0 shadow-elegant cursor-pointer h-full">
                    <div className="relative h-64 overflow-hidden">
                      <img loading="lazy"
                        src={project.coverImage || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop"}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === "completed" ? "bg-green-500/90 text-white" :
                          project.status === "ongoing" ? "bg-accent/90 text-accent-foreground" :
                          "bg-primary/90 text-white"
                        }`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white/80 text-sm">{project.location}</span>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <span className="text-primary text-xs font-medium uppercase">
                        {project.category}
                      </span>
                      <h3 className="font-semibold text-lg text-foreground mt-1 mb-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description || "A showcase of our construction excellence."}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No projects found matching your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setStatusFilter("");
                  setCategoryFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Want to See Your Project Here?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Let's discuss your project and create something amazing together.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gradient-accent text-accent-foreground font-semibold">
              Start Your Project
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
