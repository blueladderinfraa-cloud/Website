import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useContentManager } from "@/hooks/useContentManager";
import { usePageSEO } from "@/hooks/usePageSEO";
import {
  ArrowRight,
  Building2,
  Factory,
  Home as HomeIcon,
  Landmark,
  CheckCircle,
} from "lucide-react";

const defaultServices = [
  {
    id: "residential",
    category: "residential",
    title: "Residential Construction",
    shortDescription: "Custom homes, apartments, and housing complexes built with precision and care.",
    fullDescription: "We specialize in creating beautiful, functional living spaces that meet the unique needs of homeowners. From custom single-family homes to multi-unit residential complexes, our team delivers quality construction with attention to every detail.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
    features: [
      "Custom home design and construction",
      "Apartment and condominium development",
      "Home renovations and additions",
      "Luxury residential projects",
      "Green building and sustainable homes",
      "Smart home integration",
    ],
  },
  {
    id: "commercial",
    category: "commercial",
    title: "Commercial Construction",
    shortDescription: "Office buildings, retail spaces, and commercial complexes that drive business success.",
    fullDescription: "Our commercial construction services help businesses create spaces that enhance productivity, attract customers, and support growth. We understand the unique requirements of commercial projects and deliver on time and within budget.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
    features: [
      "Office buildings and corporate headquarters",
      "Retail stores and shopping centers",
      "Hotels and hospitality venues",
      "Medical facilities and clinics",
      "Educational institutions",
      "Mixed-use developments",
    ],
  },
  {
    id: "industrial",
    category: "industrial",
    title: "Industrial Construction",
    shortDescription: "Warehouses, factories, and industrial facilities built for efficiency and durability.",
    fullDescription: "We build industrial facilities that optimize operations, ensure safety, and stand the test of time. Our expertise covers everything from manufacturing plants to distribution centers, designed to meet your specific operational needs.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop",
    features: [
      "Manufacturing plants and factories",
      "Warehouses and distribution centers",
      "Cold storage facilities",
      "Processing plants",
      "Heavy industrial construction",
      "Industrial renovations and expansions",
    ],
  },
  {
    id: "infrastructure",
    category: "infrastructure",
    title: "Infrastructure Development",
    shortDescription: "Roads, bridges, and public infrastructure that connects communities.",
    fullDescription: "Our infrastructure projects help build the foundation for thriving communities. We work with government agencies and private clients to deliver essential infrastructure that improves connectivity, safety, and quality of life.",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=500&fit=crop",
    features: [
      "Road and highway construction",
      "Bridge and overpass construction",
      "Water and sewage systems",
      "Public utilities infrastructure",
      "Site development and earthwork",
      "Environmental remediation",
    ],
  },
];

const serviceIcons = {
  residential: HomeIcon,
  commercial: Building2,
  industrial: Factory,
  infrastructure: Landmark,
};

const defaultServiceImages: Record<string, string> = {
  residential: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
  commercial: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop",
  industrial: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop",
  infrastructure: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=500&fit=crop",
};

export default function Services() {
  usePageSEO({ title: "Construction Services - Blueladder Infra", description: "Residential, commercial, industrial & infrastructure construction services in Gujarat, India. Quality construction with experienced professionals." });
  const { data: dbServices } = trpc.services.list.useQuery();
  const services = dbServices?.length ? dbServices : defaultServices;

  // Get dynamic content from admin panel
  const { getServicesContent } = useContentManager();
  const servicesContent = getServicesContent();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=800&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 to-[#0a1628]/80" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Services</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
              {servicesContent.services_title || "Comprehensive Construction Solutions"}
            </h1>
            <p className="text-lg text-white/80 mb-8">
              {servicesContent.services_description || "From residential homes to large-scale infrastructure projects, we deliver excellence across all sectors of construction. Our experienced team brings expertise, innovation, and dedication to every project."}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="space-y-24">
            {services.map((service: any, index) => {
              const Icon = serviceIcons[service.category as keyof typeof serviceIcons] || Building2;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={service.id || service.category}
                  id={service.category}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}
                >
                  <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
                    <div className="relative rounded-2xl overflow-hidden shadow-elegant-lg">
                      <img loading="lazy"
                        src={service.image || defaultServiceImages[service.category] || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=500&fit=crop"}
                        alt={service.title}
                        className="w-full h-[400px] object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=500&fit=crop"; }}
                      />
                      <div className="absolute top-4 left-4">
                        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={isEven ? 'lg:order-2' : 'lg:order-1'}>
                    <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                      {service.category}
                    </span>
                    <h2 className="text-3xl font-bold text-foreground mt-2 mb-4">
                      {service.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.fullDescription || service.shortDescription}
                    </p>
                    
                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                      {(service.features || []).map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link href="/contact">
                      <Button className="gradient-primary text-white">
                        Get a Quote
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              How We Work
            </h2>
            <p className="text-muted-foreground">
              Our streamlined process ensures every project is delivered with excellence, 
              from initial consultation to final handover.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Consultation", description: "We discuss your vision, requirements, and budget to understand your project needs." },
              { step: "02", title: "Planning", description: "Our team develops detailed plans, timelines, and cost estimates for your approval." },
              { step: "03", title: "Construction", description: "We execute the project with precision, keeping you informed at every stage." },
              { step: "04", title: "Delivery", description: "We complete final inspections and hand over your project ready for use." },
            ].map((item) => (
              <Card key={item.step} className="border-0 shadow-elegant text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4">
                    <span className="text-accent-foreground font-bold text-xl">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Contact us today for a free consultation and quote. Our team is ready to help 
            bring your construction vision to life.
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
