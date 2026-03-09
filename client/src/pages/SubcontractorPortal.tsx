import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  Upload,
  CheckCircle,
  Clock,
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
} from "lucide-react";

export default function SubcontractorPortal() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("tenders");
  const [applicationForm, setApplicationForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    specializations: [] as string[],
    yearsExperience: "",
    licenseNumber: "",
    portfolioUrl: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: tenders, isLoading: tendersLoading } = trpc.tenders.list.useQuery();

  const submitApplication = trpc.subcontractors.submit.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Application submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit application. Please try again.");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate({
      ...applicationForm,
      yearsExperience: applicationForm.yearsExperience ? parseInt(applicationForm.yearsExperience) : undefined,
    });
  };

  const handleChange = (field: string, value: string | string[]) => {
    setApplicationForm((prev) => ({ ...prev, [field]: value }));
  };

  const specializationOptions = [
    "Electrical",
    "Plumbing",
    "HVAC",
    "Roofing",
    "Concrete",
    "Steel Work",
    "Carpentry",
    "Painting",
    "Landscaping",
    "Demolition",
    "Excavation",
    "Masonry",
  ];

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
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Subcontractor Portal</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-2 mb-6">
              Partner With Us
            </h1>
            <p className="text-lg text-white/80">
              Join our network of trusted subcontractors. Browse open tenders, 
              submit applications, and grow your business with Blueladder Infra.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white shadow-elegant">
              <TabsTrigger value="tenders" className="gap-2">
                <Briefcase className="w-4 h-4" />
                Open Tenders
              </TabsTrigger>
              <TabsTrigger value="apply" className="gap-2">
                <FileText className="w-4 h-4" />
                Apply as Subcontractor
              </TabsTrigger>
            </TabsList>

            {/* Open Tenders Tab */}
            <TabsContent value="tenders">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-foreground">Open Tenders</h2>
                </div>

                {tendersLoading ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="border-0 shadow-elegant">
                        <CardContent className="p-6">
                          <div className="h-32 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : tenders && tenders.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {tenders.map((tender: any) => (
                      <Card key={tender.id} className="border-0 shadow-elegant hover-lift">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg text-foreground mb-1">
                                {tender.title}
                              </h3>
                              <span className="text-primary text-sm font-medium">
                                {tender.category}
                              </span>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Open
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                            {tender.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                            {tender.location && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                {tender.location}
                              </div>
                            )}
                            {tender.deadline && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(tender.deadline).toLocaleDateString()}
                              </div>
                            )}
                            {tender.budget && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="w-4 h-4" />
                                Budget: {tender.budget}
                              </div>
                            )}
                          </div>
                          
                          <Link href={`/subcontractor/tender/${tender.id}`}>
                            <Button className="w-full gradient-primary text-white">
                              View Details & Apply
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-elegant">
                    <CardContent className="p-12 text-center">
                      <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No Open Tenders
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        There are currently no open tenders. Check back later or register 
                        as a subcontractor to be notified of new opportunities.
                      </p>
                      <Button onClick={() => setActiveTab("apply")} variant="outline">
                        Register as Subcontractor
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Apply Tab */}
            <TabsContent value="apply">
              {isSubmitted ? (
                <Card className="border-0 shadow-elegant-lg max-w-2xl mx-auto">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">
                      Application Submitted!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Thank you for your interest in partnering with Blueladder Infra. 
                      Our team will review your application and contact you within 5 business days.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline">
                      Submit Another Application
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-elegant-lg max-w-3xl mx-auto">
                  <CardHeader>
                    <CardTitle>Subcontractor Registration</CardTitle>
                    <p className="text-muted-foreground">
                      Fill out the form below to register as a subcontractor and gain access to tender opportunities.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            value={applicationForm.companyName}
                            onChange={(e) => handleChange("companyName", e.target.value)}
                            placeholder="Your Company LLC"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Contact Person *</Label>
                          <Input
                            id="contactName"
                            value={applicationForm.contactName}
                            onChange={(e) => handleChange("contactName", e.target.value)}
                            placeholder="John Smith"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={applicationForm.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="contact@company.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={applicationForm.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="+1 (234) 567-890"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Input
                          id="address"
                          value={applicationForm.address}
                          onChange={(e) => handleChange("address", e.target.value)}
                          placeholder="123 Business St, City, State 12345"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Specializations</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {specializationOptions.map((spec) => (
                            <label
                              key={spec}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                applicationForm.specializations.includes(spec)
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={applicationForm.specializations.includes(spec)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleChange("specializations", [...applicationForm.specializations, spec]);
                                  } else {
                                    handleChange("specializations", applicationForm.specializations.filter((s) => s !== spec));
                                  }
                                }}
                                className="sr-only"
                              />
                              <span className="text-sm">{spec}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <Input
                            id="yearsExperience"
                            type="number"
                            value={applicationForm.yearsExperience}
                            onChange={(e) => handleChange("yearsExperience", e.target.value)}
                            placeholder="10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <Input
                            id="licenseNumber"
                            value={applicationForm.licenseNumber}
                            onChange={(e) => handleChange("licenseNumber", e.target.value)}
                            placeholder="LIC-123456"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio/Website URL</Label>
                        <Input
                          id="portfolioUrl"
                          type="url"
                          value={applicationForm.portfolioUrl}
                          onChange={(e) => handleChange("portfolioUrl", e.target.value)}
                          placeholder="https://yourcompany.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Information</Label>
                        <Textarea
                          id="notes"
                          value={applicationForm.notes}
                          onChange={(e) => handleChange("notes", e.target.value)}
                          placeholder="Tell us about your company, past projects, certifications, etc."
                          rows={4}
                        />
                      </div>

                      <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                        <p>
                          <strong>Note:</strong> After submitting this form, our team will review your 
                          application. You may be asked to provide additional documentation such as 
                          licenses, insurance certificates, and references.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full gradient-primary text-white"
                        disabled={submitApplication.isPending}
                      >
                        {submitApplication.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
