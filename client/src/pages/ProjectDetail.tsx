import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { usePageSEO } from "@/hooks/usePageSEO";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  Ruler,
  Building2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

// Before/After Image Comparison Slider
function BeforeAfterSlider({ beforeImage, afterImage }: { beforeImage: string; afterImage: string }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
    >
      {/* After Image (Background) */}
      <img loading="lazy"
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img loading="lazy"
          src={beforeImage}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current?.offsetWidth ? `${containerRef.current.offsetWidth}px` : "100%" }}
        />
      </div>
      
      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-foreground" />
          <ChevronRight className="w-4 h-4 text-foreground" />
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        Before
      </div>
      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
        After
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: project, isLoading } = trpc.projects.getBySlug.useQuery({ slug: slug || "" });
  usePageSEO({ title: project ? `${project.title} - Blueladder Infra` : "Project Details - Blueladder Infra", description: project?.description || "View construction project details, timeline, and gallery at Blueladder Infra." });
  const images = project?.images;

  const defaultProject = {
    title: "Skyline Towers",
    description: "A 40-story mixed-use development featuring luxury apartments, premium retail spaces, and state-of-the-art amenities. This landmark project showcases our expertise in high-rise construction and sustainable building practices.",
    location: "Downtown, New York",
    status: "completed",
    category: "commercial",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop",
    startDate: new Date("2021-03-01"),
    endDate: new Date("2023-09-15"),
    sqftBuilt: 500000,
    clientName: "Metro Development Corp",
    
    beforeImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop",
    afterImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=800&fit=crop",
  };

  const displayProject = project || defaultProject;
  const displayImages = images?.length ? images : [
    { id: 1, imageUrl: displayProject.coverImage, caption: "Main View" },
    { id: 2, imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop", caption: "Interior" },
    { id: 3, imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop", caption: "Lobby" },
  ];

  // Automatic slider functionality
  useEffect(() => {
    if (!isAutoPlaying || displayImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, displayImages.length]);

  // Clean up resume timer on unmount
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Pause auto-play when user interacts with slider
  const handleManualNavigation = (newIndex: number) => {
    setCurrentImageIndex(newIndex);
    setIsAutoPlaying(false);

    // Clear any existing resume timer
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

    // Resume auto-play after 10 seconds of no interaction
    resumeTimerRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container">
            <div className="animate-pulse space-y-8">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-[500px] bg-muted rounded-xl" />
              <div className="h-6 w-full bg-muted rounded" />
              <div className="h-6 w-3/4 bg-muted rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${displayProject.coverImage}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 to-[#0a1628]/80" />
        </div>
        <div className="container relative z-10">
          <Link href="/projects">
            <Button variant="ghost" className="text-white/80 hover:text-white mb-6 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                displayProject.status === "completed" ? "bg-green-500/90 text-white" :
                displayProject.status === "ongoing" ? "bg-accent/90 text-accent-foreground" :
                "bg-primary/90 text-white"
              }`}>
                {displayProject.status.charAt(0).toUpperCase() + displayProject.status.slice(1)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                {displayProject.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {displayProject.title}
            </h1>
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{displayProject.location}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Project Details */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Project Overview</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {displayProject.description}
                </p>
              </div>

              {/* Image Gallery */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Project Gallery</h2>
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden h-[400px]">
                    <div className="relative w-full h-full">
                      {displayImages.map((img: any, index: number) => (
                        <img loading="lazy"
                          key={img.id}
                          src={img.imageUrl}
                          alt={img.caption ?? displayProject.title}
                          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                          }`}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop"; }}
                        />
                      ))}
                    </div>
                    {displayImages.length > 1 && (
                      <>
                        <button
                          onClick={() => handleManualNavigation((currentImageIndex - 1 + displayImages.length) % displayImages.length)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleManualNavigation((currentImageIndex + 1) % displayImages.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        {/* Auto-play controls */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <button
                            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                            className="bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                            title={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
                          >
                            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="w-full bg-white/30 rounded-full h-1">
                            <div 
                              className="bg-white h-1 rounded-full transition-all duration-100"
                              style={{ 
                                width: `${((currentImageIndex + 1) / displayImages.length) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  {displayImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {displayImages.map((img: any, index: number) => (
                        <button
                          key={img.id}
                          onClick={() => handleManualNavigation(index)}
                          className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <img loading="lazy"
                            src={img.imageUrl}
                            alt={img.caption ?? `Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Before/After Comparison */}
              {(displayProject.beforeImage && displayProject.afterImage) && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">Before & After</h2>
                  <BeforeAfterSlider
                    beforeImage={displayProject.beforeImage}
                    afterImage={displayProject.afterImage}
                  />
                  <p className="text-muted-foreground text-sm mt-2 text-center">
                    Drag the slider to compare before and after images
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Project Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Location</div>
                        <div className="font-medium text-foreground">{displayProject.location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Category</div>
                        <div className="font-medium text-foreground capitalize">{displayProject.category}</div>
                      </div>
                    </div>
                    {displayProject.sqftBuilt && (
                      <div className="flex items-start gap-3">
                        <Ruler className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Area</div>
                          <div className="font-medium text-foreground">
                            {displayProject.sqftBuilt.toLocaleString()} sq. ft.
                          </div>
                        </div>
                      </div>
                    )}
                    {displayProject.startDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Timeline</div>
                          <div className="font-medium text-foreground">
                            {new Date(displayProject.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {displayProject.endDate && ` - ${new Date(displayProject.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                          </div>
                        </div>
                      </div>
                    )}
{displayProject.clientName && (
                      <div>
                        <div className="text-sm text-muted-foreground">Client</div>
                        <div className="font-medium text-foreground">{displayProject.clientName}</div>
                      </div>
                    )}
                    
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-elegant gradient-primary text-white">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Start Your Project</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Interested in a similar project? Let's discuss your vision.
                  </p>
                  <Link href="/contact">
                    <Button className="w-full gradient-accent text-accent-foreground font-semibold">
                      Get a Quote
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
