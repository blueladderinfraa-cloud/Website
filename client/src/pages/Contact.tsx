import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useContentManager } from "@/hooks/useContentManager";
import { generateMapEmbedUrlFallback, cleanAddressForMap } from "@/lib/mapUtils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
} from "lucide-react";

export default function Contact() {
  // Get dynamic content from admin panel
  const { getContactContent } = useContentManager();
  const contactContent = getContactContent();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    serviceType: "",
    budget: "",
    timeline: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitInquiry = trpc.inquiries.create.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Your inquiry has been submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit inquiry. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInquiry.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
      serviceType: (["residential", "commercial", "industrial", "infrastructure"].includes(formData.serviceType) ? formData.serviceType as "residential" | "commercial" | "industrial" | "infrastructure" | "general" : "general") || undefined,
      estimatedBudget: formData.budget || undefined,
      message: formData.message,
      source: "contact_form",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-32 pb-20 bg-secondary/30">
          <div className="container">
            <Card className="max-w-xl mx-auto border-0 shadow-elegant-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Thank You for Your Inquiry!
                </h2>
                <p className="text-muted-foreground mb-6">
                  We have received your message and will get back to you within 24 hours. 
                  Our team is excited to learn more about your project.
                </p>
                <Button onClick={() => { setIsSubmitted(false); setFormData({ name: "", email: "", phone: "", company: "", serviceType: "", budget: "", timeline: "", message: "" }); }} variant="outline">
                  Submit Another Inquiry
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
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
              backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=800&fit=crop')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/95 to-[#0a1628]/80" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Contact Us</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
              Let's Build Something Great Together
            </h1>
            <p className="text-lg text-white/80">
              Ready to start your project? Get in touch with our team for a free 
              consultation and quote. We're here to help bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>
                <p className="text-muted-foreground mb-8">
                  Have questions or ready to start your project? Contact us through 
                  any of the following methods or fill out the form.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Visit Us</h3>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">
                      {contactContent.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Call Us</h3>
                    {contactContent.phone1 && (
                      <a href={`tel:${contactContent.phone1.replace(/\s/g, '')}`} className="text-muted-foreground text-sm hover:text-primary block">
                        {contactContent.phone1}
                      </a>
                    )}
                    {contactContent.phone2 && (
                      <a href={`tel:${contactContent.phone2.replace(/\s/g, '')}`} className="text-muted-foreground text-sm hover:text-primary block">
                        {contactContent.phone2}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email Us</h3>
                    {contactContent.email1 && (
                      <a href={`mailto:${contactContent.email1}`} className="text-muted-foreground text-sm hover:text-primary block">
                        {contactContent.email1}
                      </a>
                    )}
                    {contactContent.email2 && (
                      <a href={`mailto:${contactContent.email2}`} className="text-muted-foreground text-sm hover:text-primary block">
                        {contactContent.email2}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Business Hours</h3>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">
                      {contactContent.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-elegant-lg">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Request a Quote</h2>
                  <p className="text-muted-foreground mb-6">
                    Fill out the form below and we'll get back to you within 24 hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          placeholder="John Smith"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+1 (234) 567-890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleChange("company", e.target.value)}
                          placeholder="Your Company"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="serviceType">Project Type</Label>
                        <Select
                          value={formData.serviceType}
                          onValueChange={(value) => handleChange("serviceType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="industrial">Industrial</SelectItem>
                            <SelectItem value="infrastructure">Infrastructure</SelectItem>
                            <SelectItem value="renovation">Renovation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="budget">Estimated Budget</Label>
                        <Select
                          value={formData.budget}
                          onValueChange={(value) => handleChange("budget", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="under-10l">Under ₹10 Lakh</SelectItem>
                            <SelectItem value="10l-50l">₹10 Lakh - ₹50 Lakh</SelectItem>
                            <SelectItem value="50l-1cr">₹50 Lakh - ₹1 Crore</SelectItem>
                            <SelectItem value="1cr-5cr">₹1 Crore - ₹5 Crore</SelectItem>
                            <SelectItem value="over-5cr">Over ₹5 Crore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <Select
                          value={formData.timeline}
                          onValueChange={(value) => handleChange("timeline", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="immediate">Immediate</SelectItem>
                            <SelectItem value="1-3-months">1-3 Months</SelectItem>
                            <SelectItem value="3-6-months">3-6 Months</SelectItem>
                            <SelectItem value="6-12-months">6-12 Months</SelectItem>
                            <SelectItem value="planning">Just Planning</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Project Details *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        placeholder="Tell us about your project, requirements, and any specific needs..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full gradient-primary text-white"
                      disabled={submitInquiry.isPending}
                    >
                      {submitInquiry.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          Submit Inquiry
                          <Send className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] bg-muted">
        <iframe
          src={generateMapEmbedUrlFallback(cleanAddressForMap(contactContent.address))}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map showing location: ${contactContent.address}`}
        />
      </section>

      <Footer />
    </div>
  );
}
