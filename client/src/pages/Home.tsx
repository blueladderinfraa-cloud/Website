import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useContentManager } from "@/hooks/useContentManager";
import {
  ArrowRight,
  Building2,
  Factory,
  Home as HomeIcon,
  Landmark,
  CheckCircle,
  Users,
  Award,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

// Animated counter hook
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);
  
  return count;
}

// Stats counter component
function StatCounter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const count = useCountUp(value, 2000, isVisible);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl font-bold text-accent mb-2">
        {count}{suffix}
      </div>
      <div className="text-white/80 text-sm uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Service card icons
const serviceIcons = {
  residential: HomeIcon,
  commercial: Building2,
  industrial: Factory,
  infrastructure: Landmark,
};

export default function Home() {
  const { data: projects } = trpc.projects.featured.useQuery();
  const { data: testimonials } = trpc.testimonials.featured.useQuery();
  const { data: stats } = trpc.siteStats.list.useQuery();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Get dynamic content from admin panel
  const { 
    getHeroContent, 
    getAboutContent, 
    getServicesContent, 
    getTestimonialsContent 
  } = useContentManager();

  const heroContent = getHeroContent();
  const aboutContent = getAboutContent();
  const servicesContent = getServicesContent();
  const testimonialsContent = getTestimonialsContent();

  // Default stats if none in database
  const defaultStats = [
    { key: "projects", value: 150, label: "Projects Completed", suffix: "+" },
    { key: "sqft", value: 4, label: "Million Sq. Ft. Built", suffix: "M+" },
    { key: "clients", value: 200, label: "Happy Clients", suffix: "+" },
    { key: "years", value: 18, label: "Years Experience", suffix: "+" },
  ];

  const displayStats = stats?.length ? stats : defaultStats;

  const services = [
    {
      category: "residential",
      title: "Residential",
      description: "Custom homes, apartments, and housing complexes built with precision and care.",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop",
    },
    {
      category: "commercial",
      title: "Commercial",
      description: "Office buildings, retail spaces, and commercial complexes that drive business success.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    },
    {
      category: "industrial",
      title: "Industrial",
      description: "Warehouses, factories, and industrial facilities built for efficiency and durability.",
      image: "https://images.unsplash.com/photo-1565636291267-c23a0f4d6a1b?w=600&h=400&fit=crop",
    },
    {
      category: "infrastructure",
      title: "Infrastructure",
      description: "Roads, bridges, and public infrastructure that connects communities.",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop",
    },
  ];

  const whyChooseUs = [
    { icon: Award, title: "Quality Assured", description: "Highest standards in materials and workmanship" },
    { icon: Clock, title: "On-Time Delivery", description: "Projects completed within agreed timelines" },
    { icon: Users, title: "Expert Team", description: "Skilled professionals with decades of experience" },
    { icon: CheckCircle, title: "Customer First", description: "Your satisfaction is our top priority" },
  ];

  const nextTestimonial = () => {
    if (testimonials?.length) {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }
  };

  const prevTestimonial = () => {
    if (testimonials?.length) {
      setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${heroContent.image}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 via-[#0a1628]/80 to-[#0a1628]/60" />
        </div>



        {/* Content */}
        <div className="container relative z-10 pt-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-white/90 text-sm">Building Excellence Since 2005</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {heroContent.headline}
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
              {heroContent.subheadline}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="gradient-accent text-accent-foreground font-semibold text-base px-8">
                  {heroContent.cta}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8">
                  View Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-elegant-lg">
                <img
                  src={aboutContent.image}
                  alt="Construction site"
                  className="w-full h-[400px] object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-accent text-accent-foreground p-4 md:p-6 rounded-xl shadow-elegant-lg">
                <div className="text-3xl font-bold">18+</div>
                <div className="text-sm">Years Experience</div>
              </div>
            </div>
            
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                {aboutContent.title}
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {aboutContent.description}
              </p>
              {aboutContent.vision && (
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  <strong>Our Vision:</strong> {aboutContent.vision}
                </p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {whyChooseUs.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-muted-foreground text-xs">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/about">
                <Button variant="outline" className="group">
                  Learn More About Us
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              {servicesContent.services_title || "What We Build"}
            </h2>
            <p className="text-muted-foreground">
              {servicesContent.services_description || "Comprehensive construction services tailored to meet your specific needs, from residential homes to large-scale infrastructure projects."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => {
              const Icon = serviceIcons[service.category as keyof typeof serviceIcons];
              return (
                <Card key={service.category} className="group overflow-hidden hover-lift border-0 shadow-elegant">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-2">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg text-foreground mb-2">{service.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
                    <Link href={`/services#${service.category}`}>
                      <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=600&fit=crop')",
            }}
          />
        </div>
        <div className="container relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {displayStats.map((stat: any) => (
              <StatCounter
                key={stat.key}
                value={stat.value}
                suffix={stat.suffix || "+"}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Portfolio</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                Featured Projects
              </h2>
            </div>
            <Link href="/projects">
              <Button variant="outline" className="group">
                View All Projects
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(projects?.slice(0, 6) || []).map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`}>
                <Card className="group overflow-hidden hover-lift border-0 shadow-elegant cursor-pointer">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={project.coverImage || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop"}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 left-4">
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

          {(!projects || projects.length === 0) && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
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
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              {testimonialsContent.testimonials_title || "What Our Clients Say"}
            </h2>
            {testimonialsContent.testimonials_description && (
              <p className="text-muted-foreground">
                {testimonialsContent.testimonials_description}
              </p>
            )}
          </div>

          {testimonials && testimonials.length > 0 ? (
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-elegant-lg p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonials[currentTestimonial].rating || 5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    {testimonials[currentTestimonial].clientImage ? (
                      <img
                        src={testimonials[currentTestimonial].clientImage}
                        alt={testimonials[currentTestimonial].clientName}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl">
                        {testimonials[currentTestimonial].clientName.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <div className="font-semibold text-foreground">
                        {testimonials[currentTestimonial].clientName}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {testimonials[currentTestimonial].clientTitle}
                        {testimonials[currentTestimonial].clientCompany && 
                          `, ${testimonials[currentTestimonial].clientCompany}`}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={prevTestimonial}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    {testimonials.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTestimonial(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          i === currentTestimonial ? "bg-primary" : "bg-primary/30"
                        }`}
                      />
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextTestimonial}
                    className="rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-elegant-lg p-8 md:p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed italic">
                    "Blueladder Infra exceeded our expectations in every way. Their attention to detail, 
                    professionalism, and commitment to quality made our dream home a reality. 
                    Highly recommended!"
                  </blockquote>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl">
                      J
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-foreground">John Smith</div>
                      <div className="text-muted-foreground text-sm">Homeowner, New York</div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=600&fit=crop')",
            }}
          />
        </div>
        <div className="container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Get a free consultation and quote for your construction project. 
            Our experts are ready to help bring your vision to life.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact">
              <Button size="lg" className="gradient-accent text-accent-foreground font-semibold">
                Get Free Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/cost-estimator">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Try Cost Estimator
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
