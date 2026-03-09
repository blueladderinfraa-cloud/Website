import { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  Building2,
  Send,
} from "lucide-react";

export default function TenderDetail() {
  const { id } = useParams<{ id: string }>();
  const tenderId = parseInt(id || "0");
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [applicationData, setApplicationData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    proposedBudget: "",
    proposedTimeline: "",
    proposal: "",
  });

  const { data: tender, isLoading } = trpc.tenders.getById.useQuery({ id: tenderId }, { enabled: !!tenderId });

  const submitApplication = trpc.tenders.submitApplication.useMutation({
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
      tenderId,
      ...applicationData,
    });
  };

  const handleChange = (field: string, value: string) => {
    setApplicationData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
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

  if (!tender) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Tender Not Found</h1>
            <Link href="/subcontractor">
              <Button variant="outline">Back to Tenders</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
                  Application Submitted!
                </h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your interest in this tender. Our team will review your 
                  proposal and contact you within 5 business days.
                </p>
                <Link href="/subcontractor">
                  <Button variant="outline">Back to Tenders</Button>
                </Link>
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
          <Link href="/subcontractor">
            <Button variant="ghost" className="text-white/80 hover:text-white mb-6 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenders
            </Button>
          </Link>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/90 text-white">
                Open
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                {tender.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {tender.title}
            </h1>
            
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-secondary/30">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle>Tender Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {tender.description}
                    </p>
                  </div>

                  {tender.requirements && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Requirements</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {tender.requirements}
                      </p>
                    </div>
                  )}

                  
                </CardContent>
              </Card>

              {/* Application Form */}
              {showApplicationForm && (
                <Card className="border-0 shadow-elegant">
                  <CardHeader>
                    <CardTitle>Submit Your Proposal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            value={applicationData.companyName}
                            onChange={(e) => handleChange("companyName", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Contact Person *</Label>
                          <Input
                            id="contactName"
                            value={applicationData.contactName}
                            onChange={(e) => handleChange("contactName", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={applicationData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={applicationData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="proposedBudget">Proposed Budget</Label>
                          <Input
                            id="proposedBudget"
                            value={applicationData.proposedBudget}
                            onChange={(e) => handleChange("proposedBudget", e.target.value)}
                            placeholder="$50,000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proposedTimeline">Proposed Timeline</Label>
                          <Input
                            id="proposedTimeline"
                            value={applicationData.proposedTimeline}
                            onChange={(e) => handleChange("proposedTimeline", e.target.value)}
                            placeholder="3 months"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="proposal">Your Proposal *</Label>
                        <Textarea
                          id="proposal"
                          value={applicationData.proposal}
                          onChange={(e) => handleChange("proposal", e.target.value)}
                          placeholder="Describe your approach, relevant experience, and why you're the best fit for this project..."
                          rows={6}
                          required
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowApplicationForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="gradient-primary text-white"
                          disabled={submitApplication.isPending}
                        >
                          {submitApplication.isPending ? "Submitting..." : "Submit Proposal"}
                          <Send className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-foreground mb-4">Tender Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Category</div>
                        <div className="font-medium text-foreground">{tender.category}</div>
                      </div>
                    </div>

                    {tender.budget && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Estimated Budget</div>
                          <div className="font-medium text-foreground">{tender.budget}</div>
                        </div>
                      </div>
                    )}

                    {tender.deadline && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-muted-foreground">Submission Deadline</div>
                          <div className="font-medium text-foreground">
                            {new Date(tender.deadline).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-muted-foreground">Posted</div>
                        <div className="font-medium text-foreground">
                          {new Date(tender.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!showApplicationForm && (
                <Card className="border-0 shadow-elegant gradient-primary text-white">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Interested in This Tender?</h3>
                    <p className="text-white/80 text-sm mb-4">
                      Submit your proposal to be considered for this project.
                    </p>
                    <Button
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full gradient-accent text-accent-foreground font-semibold"
                    >
                      Apply Now
                      <FileText className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
