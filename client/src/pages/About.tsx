import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContentManager } from "@/hooks/useContentManager";
import {
  ArrowRight,
  Award,
  Users,
  Target,
  Shield,
  Clock,
  Building2,
  Lightbulb,
  Heart,
} from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Quality First",
    description: "We never compromise on quality. Every project is built to the highest standards using premium materials and expert craftsmanship.",
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description: "We understand the importance of deadlines. Our efficient project management ensures on-time completion without sacrificing quality.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We maintain open communication and transparency throughout every project phase.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We embrace modern construction techniques and technologies to deliver better results and improved efficiency.",
  },
  {
    icon: Heart,
    title: "Safety Commitment",
    description: "Safety is non-negotiable. We maintain strict safety protocols to protect our workers, clients, and communities.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from initial planning to final handover and beyond.",
  },
];

const milestones = [
  { year: "2005", title: "Company Founded", description: "Started with a vision to transform the construction industry" },
  { year: "2010", title: "50th Project", description: "Completed our 50th project, establishing our reputation" },
  { year: "2015", title: "Regional Expansion", description: "Expanded operations across multiple states" },
  { year: "2018", title: "ISO Certification", description: "Achieved ISO 9001:2015 quality certification" },
  { year: "2020", title: "100+ Team Members", description: "Grew our team to over 100 skilled professionals" },
  { year: "2024", title: "150+ Projects", description: "Celebrating 150+ successfully completed projects" },
];

export default function About() {
  // Get dynamic content from admin panel
  const { getAboutContent, getTeamContent } = useContentManager();
  const aboutContent = getAboutContent();
  const teamContent = getTeamContent();

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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
              {aboutContent.title || "Building Excellence for Over 18 Years"}
            </h1>
            <p className="text-lg text-white/80 mb-8">
              {aboutContent.description || "Blueladder Infra is a leading construction company dedicated to transforming visions into reality. With a commitment to quality, innovation, and customer satisfaction, we have become a trusted partner for residential, commercial, and infrastructure projects."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="gradient-accent text-accent-foreground font-semibold">
                  Start Your Project
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                From Humble Beginnings to Industry Leaders
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {aboutContent.description || "Founded in 2005, Blueladder Infra began with a simple mission: to deliver construction projects that exceed expectations. What started as a small team of passionate builders has grown into one of the region's most respected construction companies."}
                </p>
                {aboutContent.vision && (
                  <p>
                    <strong>Our Vision:</strong> {aboutContent.vision}
                  </p>
                )}
                {aboutContent.mission && (
                  <p>
                    <strong>Our Mission:</strong> {aboutContent.mission}
                  </p>
                )}
                <p>
                  Today, we continue to push boundaries, embracing new technologies and 
                  sustainable practices while maintaining the personal touch that has been 
                  our hallmark since day one.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src={aboutContent.image || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop"}
                alt="Construction site"
                className="rounded-xl shadow-elegant w-full h-48 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop"
                alt="Team at work"
                className="rounded-xl shadow-elegant w-full h-48 object-cover mt-8"
              />
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"
                alt="Completed building"
                className="rounded-xl shadow-elegant w-full h-48 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop"
                alt="Modern construction"
                className="rounded-xl shadow-elegant w-full h-48 object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-elegant-lg overflow-hidden">
              <div className="h-2 gradient-primary" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutContent.vision || "To be the most trusted and innovative construction company, recognized for delivering exceptional quality, sustainable practices, and transformative projects that enhance communities and improve lives."}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-elegant-lg overflow-hidden">
              <div className="h-2 gradient-accent" />
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6">
                  <Building2 className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {aboutContent.mission || "To deliver construction excellence through quality workmanship, innovative solutions, and unwavering commitment to customer satisfaction. We build not just structures, but lasting relationships and thriving communities."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              Why Choose Blueladder Infra
            </h2>
            <p className="text-muted-foreground">
              Our core values guide everything we do, from project planning to final delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-0 shadow-elegant hover-lift">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding gradient-dark">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
              Milestones That Define Us
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 hidden md:block" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 inline-block">
                      <span className="text-white font-bold text-2xl">{milestone.year}</span>
                      <h3 className="font-semibold text-white text-lg mt-2">{milestone.title}</h3>
                      <p className="text-white/70 text-sm mt-1">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-accent border-4 border-[#0a1628] z-10" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
              {teamContent.title}
            </h2>
            <p className="text-muted-foreground">
              {teamContent.description}
            </p>
          </div>

          <div className={`team-grid-centered ${
            teamContent.team.length === 1 ? 'team-grid-1' :
            teamContent.team.length === 2 ? 'team-grid-2' :
            teamContent.team.length === 3 ? 'team-grid-3' :
            'team-grid-4-plus'
          }`}>
            {teamContent.team.map((member) => (
              <Card key={member.name} className="border-0 shadow-elegant overflow-hidden group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-5 text-center">
                  <h3 className="font-semibold text-lg text-foreground">{member.name}</h3>
                  <p className="text-primary text-sm">{member.role}</p>
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
            Ready to Build Something Great?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Let's discuss your project and see how we can bring your vision to life.
          </p>
          <Link href="/contact">
            <Button size="lg" className="gradient-accent text-accent-foreground font-semibold">
              Get in Touch
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
