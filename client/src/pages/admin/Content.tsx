import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/admin/AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Save,
  Type,
  Home,
  Info,
  Wrench,
  Phone,
  RotateCcw,
  Users,
  RefreshCw,
} from "lucide-react";
import { ImageUploadWithGuidance } from "@/components/ImageUploadWithGuidance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminContent() {
  const [activeSection, setActiveSection] = useState("hero");
  const [content, setContent] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Default hero image URL
  const DEFAULT_HERO_IMAGE = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

  const { data: siteContent } = trpc.siteContent.get.useQuery();

  const utils = trpc.useUtils();

  const updateContent = trpc.siteContent.upsert.useMutation({
    onSuccess: async (data, variables) => {
      // Immediately update local state with the saved data
      let savedData;
      try {
        savedData = JSON.parse(variables.value || '{}');
      } catch {
        toast.error("Invalid data format");
        return;
      }
      const updatedContent = { ...content };
      
      // Update local state based on section
      if (variables.section === "contact") {
        // For contact section, update with contact_ prefix
        Object.keys(savedData).forEach(key => {
          const prefixedKey = key.startsWith('contact_') ? key : `contact_${key}`;
          updatedContent[prefixedKey] = savedData[key];
        });
      } else {
        // For other sections, update with section prefix
        Object.keys(savedData).forEach(key => {
          const prefixedKey = key.startsWith(`${variables.section}_`) ? key : `${variables.section}_${key}`;
          updatedContent[prefixedKey] = savedData[key];
        });
      }
      
      setContent(updatedContent);
      
      toast.success("Content saved successfully!");
      setIsSaving(false);
      
      // Invalidate and refetch the siteContent query to show latest data
      await utils.siteContent.get.invalidate();
      
      // Force refetch to ensure we get the latest data
      await utils.siteContent.get.refetch();
    },
    onError: (error) => {
      console.error("Save error:", error); // Debug log
      toast.error("Failed to save content");
      setIsSaving(false);
    },
  });

  const parsedContent = useMemo(() => {
    if (!siteContent || siteContent.length === 0) return null;

    const contentMap: Record<string, any> = {};

    siteContent.forEach((item: any) => {
      contentMap[item.key] = item.value;
    });

    const sectionsToProcess = [
      { key: 'hero_content', prefix: 'hero_' },
      { key: 'about_content', prefix: 'about_' },
      { key: 'contact_content', prefix: 'contact_' },
      { key: 'services_content', prefix: 'services_' },
      { key: 'testimonials_content', prefix: 'testimonials_' },
      { key: 'team_content', prefix: 'team_' },
      { key: 'branding_content', prefix: 'branding_' },
      { key: 'stats_content', prefix: 'stat_' },
      { key: 'pricing_content', prefix: 'pricing_' }
    ];

    sectionsToProcess.forEach(({ key, prefix }) => {
      if (contentMap[key]) {
        try {
          const sectionData = JSON.parse(contentMap[key]);
          Object.keys(sectionData).forEach(fieldKey => {
            if (sectionData[fieldKey] !== undefined && sectionData[fieldKey] !== null) {
              if (prefix === 'contact_' && !fieldKey.startsWith('contact_')) {
                contentMap[`contact_${fieldKey}`] = sectionData[fieldKey];
              } else if (prefix !== 'contact_' && !fieldKey.startsWith(prefix)) {
                contentMap[`${prefix}${fieldKey}`] = sectionData[fieldKey];
              } else {
                contentMap[fieldKey] = sectionData[fieldKey];
              }
            }
          });
        } catch (e) {
          console.error(`Error parsing ${key}:`, e);
        }
      }
    });

    return contentMap;
  }, [siteContent]);

  useEffect(() => {
    if (parsedContent) {
      setContent(parsedContent);
    }
  }, [parsedContent]);

  const handleSave = async (section: string, key: string, value: any) => {
    setIsSaving(true);
    
    try {
      // Optimistically update local state immediately
      const updatedContent = { ...content };
      
      if (section === "contact") {
        // For contact section, update with contact_ prefix
        Object.keys(value).forEach(fieldKey => {
          const prefixedKey = fieldKey.startsWith('contact_') ? fieldKey : `contact_${fieldKey}`;
          updatedContent[prefixedKey] = value[fieldKey];
        });
      } else {
        // For other sections, update with section prefix
        Object.keys(value).forEach(fieldKey => {
          const prefixedKey = fieldKey.startsWith(`${section}_`) ? fieldKey : `${section}_${fieldKey}`;
          updatedContent[prefixedKey] = value[fieldKey];
        });
      }
      
      setContent(updatedContent);
      
      // Save to server
      await updateContent.mutateAsync({ 
        section, 
        key, 
        value: JSON.stringify(value), 
        type: "json" 
      });
      
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save content");
      setIsSaving(false);
      
      // Revert optimistic update on error
      await utils.siteContent.get.refetch();
    }
  };

  const forceRefresh = async () => {
    await utils.siteContent.get.invalidate();
    await utils.siteContent.get.refetch();
    toast.success("Content refreshed!");
  };

  const updateField = (key: string, value: any) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleHeroReset = () => {
    // Reset hero image to default while preserving text content
    const currentContent = {
      headline: content.hero_headline || "Building Tomorrow's Infrastructure Today",
      subheadline: content.hero_subheadline || "Leading construction company delivering excellence in residential, commercial, and industrial projects.",
      cta: content.hero_cta || "Get a Quote",
      image: DEFAULT_HERO_IMAGE, // Reset to default image
    };
    
    // Update local state
    setContent((prev) => ({
      ...prev,
      hero_image: DEFAULT_HERO_IMAGE,
    }));
    
    // Save to backend
    setIsSaving(true);
    updateContent.mutate({ 
      section: "hero", 
      key: "content", 
      value: JSON.stringify(currentContent), 
      type: "json" 
    });
    
    toast.success("Hero section image reset to default successfully!");
  };

  const sections = [
    { id: "hero", label: "Hero Section", icon: Home },
    { id: "about", label: "About Us", icon: Info },
    { id: "services", label: "Services", icon: Wrench },
    { id: "team", label: "Team Members", icon: Users },
    { id: "testimonials", label: "Testimonials", icon: Type },
    { id: "stats", label: "Statistics", icon: Type },
    { id: "pricing", label: "Cost Estimator Pricing", icon: Type },
    { id: "contact", label: "Contact Info", icon: Phone },
    { id: "branding", label: "Branding", icon: Type },
  ];

  return (
    <AdminLayout currentPage="content" title="Content Editor" description="Edit website content, images, and text sections">
      {/* Debug and Refresh Controls */}
      <div className="mb-6 flex gap-2">
        <Button
          variant="outline"
          onClick={forceRefresh}
          className="admin-button-secondary"
          size="sm"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Force Refresh
        </Button>
      </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all admin-sidebar-item ${
                  activeSection === section.id ? "active" : ""
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Content Editor */}
          <div className="lg:col-span-3">
            {activeSection === "hero" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <div className="flex items-center justify-between">
                    <CardTitle className="admin-card-title">🏠 Hero Section</CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="admin-button-secondary">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset to Default Image
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="admin-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="admin-card-title">Reset Hero Image</AlertDialogTitle>
                          <AlertDialogDescription className="admin-page-description">
                            This will reset the hero background image to the default professional image. 
                            Your headline, subheadline, and CTA text will be preserved.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="admin-button-secondary">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleHeroReset} className="admin-button-primary">
                            Reset Image
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="space-y-2">
                    <Label className="admin-label">Headline</Label>
                    <Input
                      className="admin-input"
                      value={content.hero_headline || "Building Tomorrow's Infrastructure Today"}
                      onChange={(e) => updateField("hero_headline", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="admin-label">Subheadline</Label>
                    <Textarea
                      className="admin-textarea"
                      value={content.hero_subheadline || "Leading construction company delivering excellence in residential, commercial, and industrial projects."}
                      onChange={(e) => updateField("hero_subheadline", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <ImageUploadWithGuidance
                    section="hero"
                    label="Background Image"
                    value={content.hero_image || DEFAULT_HERO_IMAGE}
                    onChange={(url) => updateField("hero_image", url)}
                    placeholder="Upload hero background image"
                    showResponsivePreviews={true}
                  />
                  <div className="space-y-2">
                    <Label className="admin-label">CTA Button Text</Label>
                    <Input
                      className="admin-input"
                      value={content.hero_cta || "Get a Quote"}
                      onChange={(e) => updateField("hero_cta", e.target.value)}
                    />
                  </div>
                  
                  {/* Current Image Info */}
                  {content.hero_image === DEFAULT_HERO_IMAGE && (
                    <div className="admin-info rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">Using Default Image</p>
                          <p className="text-blue-700 mt-1">
                            You're currently using the default professional hero image. 
                            You can upload a custom image or continue using this one.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => {
                      const heroData = {
                        headline: content.hero_headline || "Building Tomorrow's Infrastructure Today",
                        subheadline: content.hero_subheadline || "Leading construction company delivering excellence in residential, commercial, and industrial projects.",
                        image: content.hero_image || DEFAULT_HERO_IMAGE,
                        cta: content.hero_cta || "Get a Quote",
                      };
                      
                      handleSave("hero", "content", heroData);
                    }}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "about" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">About Us Section</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.about_title || "About Blueladder Infra"}
                      onChange={(e) => updateField("about_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={content.about_description || "With over 20 years of experience..."}
                      onChange={(e) => updateField("about_description", e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vision Statement</Label>
                    <Textarea
                      value={content.about_vision || ""}
                      onChange={(e) => updateField("about_vision", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mission Statement</Label>
                    <Textarea
                      value={content.about_mission || ""}
                      onChange={(e) => updateField("about_mission", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <ImageUploadWithGuidance
                    section="about"
                    label="About Section Image"
                    value={content.about_image || ""}
                    onChange={(url) => updateField("about_image", url)}
                    placeholder="Upload about section image"
                  />
                  <Button
                    onClick={() => handleSave("about", "content", {
                      title: content.about_title,
                      description: content.about_description,
                      vision: content.about_vision,
                      mission: content.about_mission,
                      image: content.about_image,
                    })}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "services" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">Services Section</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.services_title || "Our Services"}
                      onChange={(e) => updateField("services_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea
                      value={content.services_description || "Comprehensive construction solutions..."}
                      onChange={(e) => updateField("services_description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-foreground mb-4">Service Cards</h4>
                    {["Residential", "Commercial", "Industrial", "Infrastructure"].map((service, index) => (
                      <div key={service} className="p-4 bg-secondary/50 rounded-lg mb-4">
                        <h5 className="font-medium text-foreground mb-3">{service} Construction</h5>
                        <div className="space-y-3">
                          <Input
                            placeholder="Service title"
                            value={content[`service_${index}_title`] || `${service} Construction`}
                            onChange={(e) => updateField(`service_${index}_title`, e.target.value)}
                          />
                          <Textarea
                            placeholder="Service description"
                            value={content[`service_${index}_desc`] || ""}
                            onChange={(e) => updateField(`service_${index}_desc`, e.target.value)}
                            rows={2}
                          />
                          <ImageUploadWithGuidance
                            section="services"
                            label="Service Image"
                            value={content[`service_${index}_image`] || ""}
                            onChange={(url) => updateField(`service_${index}_image`, url)}
                            placeholder="Upload service image"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => {
                      // Extract only services-related fields for saving
                      const servicesData: Record<string, any> = {
                        services_title: content.services_title,
                        services_description: content.services_description,
                      };
                      
                      // Add all service fields (4 services: Residential, Commercial, Industrial, Infrastructure)
                      for (let i = 0; i < 4; i++) {
                        servicesData[`service_${i}_title`] = content[`service_${i}_title`];
                        servicesData[`service_${i}_desc`] = content[`service_${i}_desc`];
                        servicesData[`service_${i}_image`] = content[`service_${i}_image`];
                      }
                      
                      handleSave("services", "content", servicesData);
                    }}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "team" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">Team Members Management</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="space-y-2">
                    <Label>Team Section Title</Label>
                    <Input
                      value={content.team_title || "Meet Our Leadership"}
                      onChange={(e) => updateField("team_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Section Description</Label>
                    <Textarea
                      value={content.team_description || "Our experienced leadership team brings decades of combined expertise in construction and project management."}
                      onChange={(e) => updateField("team_description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-foreground">Team Members</h4>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const teamCount = parseInt(content.team_count || "2");
                          const newCount = teamCount + 1;
                          updateField("team_count", newCount.toString());
                          // Initialize new team member with default values
                          updateField(`team_${teamCount}_name`, "New Team Member");
                          updateField(`team_${teamCount}_role`, "Position Title");
                          updateField(`team_${teamCount}_image`, "");
                        }}
                      >
                        Add Team Member
                      </Button>
                    </div>
                    
                    {Array.from({ length: parseInt(content.team_count || "2") }, (_, index) => (
                      <div key={index} className="p-4 bg-secondary/50 rounded-lg mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-foreground">Team Member {index + 1}</h5>
                          {parseInt(content.team_count || "2") > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const teamCount = parseInt(content.team_count || "2");
                                if (teamCount > 1) {
                                  // Remove this team member by shifting all subsequent members
                                  for (let i = index; i < teamCount - 1; i++) {
                                    updateField(`team_${i}_name`, content[`team_${i + 1}_name`] || "");
                                    updateField(`team_${i}_role`, content[`team_${i + 1}_role`] || "");
                                    updateField(`team_${i}_image`, content[`team_${i + 1}_image`] || "");
                                  }
                                  // Clear the last member
                                  updateField(`team_${teamCount - 1}_name`, "");
                                  updateField(`team_${teamCount - 1}_role`, "");
                                  updateField(`team_${teamCount - 1}_image`, "");
                                  // Update count
                                  updateField("team_count", (teamCount - 1).toString());
                                }
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Input
                            placeholder="Team member name"
                            value={content[`team_${index}_name`] || (index === 0 ? "Manthan Kevadia" : index === 1 ? "Ravi Gorasiya" : "")}
                            onChange={(e) => updateField(`team_${index}_name`, e.target.value)}
                          />
                          <Input
                            placeholder="Role/Position"
                            value={content[`team_${index}_role`] || (index === 0 ? "CEO" : index === 1 ? "Founder" : "")}
                            onChange={(e) => updateField(`team_${index}_role`, e.target.value)}
                          />
                          <ImageUploadWithGuidance
                            section="team"
                            label="Team Member Photo"
                            value={content[`team_${index}_image`] || ""}
                            onChange={(url) => updateField(`team_${index}_image`, url)}
                            placeholder="Upload team member photo"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => {
                      // Extract only team-related fields for saving
                      const teamData: Record<string, any> = {
                        team_title: content.team_title,
                        team_description: content.team_description,
                        team_count: content.team_count,
                      };
                      
                      // Add all team member fields
                      const teamCount = parseInt(content.team_count || "2");
                      for (let i = 0; i < teamCount; i++) {
                        teamData[`team_${i}_name`] = content[`team_${i}_name`];
                        teamData[`team_${i}_role`] = content[`team_${i}_role`];
                        teamData[`team_${i}_image`] = content[`team_${i}_image`];
                      }
                      
                      handleSave("team", "content", teamData);
                    }}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "testimonials" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">Testimonials Management</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.testimonials_title || "What Our Clients Say"}
                      onChange={(e) => updateField("testimonials_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Description</Label>
                    <Textarea
                      value={content.testimonials_description || "Hear from our satisfied clients about their experience working with us."}
                      onChange={(e) => updateField("testimonials_description", e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-foreground">Featured Testimonials</h4>
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Navigate to full testimonials management
                          window.location.href = '/admin/testimonials';
                        }}
                      >
                        Manage All Testimonials
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure which testimonials appear on the homepage. Use the "Manage All Testimonials" button for full CRUD operations.
                    </p>
                    
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="p-4 bg-secondary/50 rounded-lg mb-4">
                        <h5 className="font-medium text-foreground mb-3">Featured Testimonial {index}</h5>
                        <div className="space-y-3">
                          <Input
                            placeholder="Client name"
                            value={content[`testimonial_${index}_name`] || ""}
                            onChange={(e) => updateField(`testimonial_${index}_name`, e.target.value)}
                          />
                          <Input
                            placeholder="Client company/title"
                            value={content[`testimonial_${index}_company`] || ""}
                            onChange={(e) => updateField(`testimonial_${index}_company`, e.target.value)}
                          />
                          <Textarea
                            placeholder="Testimonial text"
                            value={content[`testimonial_${index}_text`] || ""}
                            onChange={(e) => updateField(`testimonial_${index}_text`, e.target.value)}
                            rows={3}
                          />
                          <ImageUploadWithGuidance
                            section="testimonials"
                            label="Client Photo"
                            value={content[`testimonial_${index}_image`] || ""}
                            onChange={(url) => updateField(`testimonial_${index}_image`, url)}
                            placeholder="Upload client photo"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`testimonial_${index}_featured`}
                              checked={content[`testimonial_${index}_featured`] || false}
                              onChange={(e) => updateField(`testimonial_${index}_featured`, e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor={`testimonial_${index}_featured`}>Show on homepage</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => {
                      // Extract only testimonials-related fields for saving
                      const testimonialsData: Record<string, any> = {
                        testimonials_title: content.testimonials_title,
                        testimonials_description: content.testimonials_description,
                      };
                      
                      // Add all testimonial fields (3 featured testimonials)
                      for (let i = 1; i <= 3; i++) {
                        testimonialsData[`testimonial_${i}_name`] = content[`testimonial_${i}_name`];
                        testimonialsData[`testimonial_${i}_company`] = content[`testimonial_${i}_company`];
                        testimonialsData[`testimonial_${i}_text`] = content[`testimonial_${i}_text`];
                        testimonialsData[`testimonial_${i}_image`] = content[`testimonial_${i}_image`];
                        testimonialsData[`testimonial_${i}_featured`] = content[`testimonial_${i}_featured`];
                      }
                      
                      handleSave("testimonials", "content", testimonialsData);
                    }}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "stats" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">Statistics Section</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Projects Completed</Label>
                      <Input
                        type="number"
                        value={content.stat_projects || "500"}
                        onChange={(e) => updateField("stat_projects", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Square Feet Built</Label>
                      <Input
                        type="number"
                        value={content.stat_sqft || "2000000"}
                        onChange={(e) => updateField("stat_sqft", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Happy Clients</Label>
                      <Input
                        type="number"
                        value={content.stat_clients || "350"}
                        onChange={(e) => updateField("stat_clients", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        value={content.stat_years || "20"}
                        onChange={(e) => updateField("stat_years", e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSave("stats", "content", {
                      projects: content.stat_projects,
                      sqft: content.stat_sqft,
                      clients: content.stat_clients,
                      years: content.stat_years,
                    })}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "pricing" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">💰 Cost Estimator Pricing</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="admin-info rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Pricing Configuration</p>
                        <p className="text-blue-700 mt-1">
                          Set the per square foot pricing ranges for different construction types and quality levels. 
                          These prices will be used in the Cost Estimator calculator on your website.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Residential Pricing */}
                  <div className="border rounded-lg p-4 bg-secondary/30">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">🏠 Residential Construction (₹/sq.ft.)</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="admin-label">Basic</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_residential_basic || "125"}
                          onChange={(e) => updateField("pricing_residential_basic", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Standard</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_residential_standard || "200"}
                          onChange={(e) => updateField("pricing_residential_standard", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Premium</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_residential_premium || "325"}
                          onChange={(e) => updateField("pricing_residential_premium", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Luxury</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_residential_luxury || "500"}
                          onChange={(e) => updateField("pricing_residential_luxury", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Commercial Pricing */}
                  <div className="border rounded-lg p-4 bg-secondary/30">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">🏢 Commercial Construction (₹/sq.ft.)</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="admin-label">Basic</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_commercial_basic || "150"}
                          onChange={(e) => updateField("pricing_commercial_basic", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Standard</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_commercial_standard || "240"}
                          onChange={(e) => updateField("pricing_commercial_standard", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Premium</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_commercial_premium || "375"}
                          onChange={(e) => updateField("pricing_commercial_premium", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Luxury</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_commercial_luxury || "575"}
                          onChange={(e) => updateField("pricing_commercial_luxury", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Industrial Pricing */}
                  <div className="border rounded-lg p-4 bg-secondary/30">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">🏭 Industrial Construction (₹/sq.ft.)</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="admin-label">Basic</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_industrial_basic || "100"}
                          onChange={(e) => updateField("pricing_industrial_basic", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Standard</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_industrial_standard || "160"}
                          onChange={(e) => updateField("pricing_industrial_standard", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Premium</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_industrial_premium || "275"}
                          onChange={(e) => updateField("pricing_industrial_premium", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Luxury</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_industrial_luxury || "425"}
                          onChange={(e) => updateField("pricing_industrial_luxury", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Infrastructure Pricing */}
                  <div className="border rounded-lg p-4 bg-secondary/30">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">🌉 Infrastructure Construction (₹/sq.ft.)</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="admin-label">Basic</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_infrastructure_basic || "200"}
                          onChange={(e) => updateField("pricing_infrastructure_basic", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Standard</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_infrastructure_standard || "325"}
                          onChange={(e) => updateField("pricing_infrastructure_standard", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Premium</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_infrastructure_premium || "500"}
                          onChange={(e) => updateField("pricing_infrastructure_premium", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="admin-label">Luxury</Label>
                        <Input
                          type="number"
                          className="admin-input"
                          value={content.pricing_infrastructure_luxury || "750"}
                          onChange={(e) => updateField("pricing_infrastructure_luxury", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => {
                      const pricingData: Record<string, any> = {};
                      
                      // Residential
                      ['basic', 'standard', 'premium', 'luxury'].forEach(level => {
                        pricingData[`residential_${level}`] = content[`pricing_residential_${level}`];
                      });
                      
                      // Commercial
                      ['basic', 'standard', 'premium', 'luxury'].forEach(level => {
                        pricingData[`commercial_${level}`] = content[`pricing_commercial_${level}`];
                      });
                      
                      // Industrial
                      ['basic', 'standard', 'premium', 'luxury'].forEach(level => {
                        pricingData[`industrial_${level}`] = content[`pricing_industrial_${level}`];
                      });
                      
                      // Infrastructure
                      ['basic', 'standard', 'premium', 'luxury'].forEach(level => {
                        pricingData[`infrastructure_${level}`] = content[`pricing_infrastructure_${level}`];
                      });
                      
                      handleSave("pricing", "content", pricingData);
                    }}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Pricing
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "contact" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="space-y-2">
                    <Label>Company Address</Label>
                    <Textarea
                      value={content.contact_address || ""}
                      onChange={(e) => updateField("contact_address", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone Number 1</Label>
                      <Input
                        value={content.contact_phone1 || ""}
                        onChange={(e) => updateField("contact_phone1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number 2</Label>
                      <Input
                        value={content.contact_phone2 || ""}
                        onChange={(e) => updateField("contact_phone2", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email 1</Label>
                      <Input
                        value={content.contact_email1 || "info@blueladderinfra.com"}
                        onChange={(e) => updateField("contact_email1", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email 2</Label>
                      <Input
                        value={content.contact_email2 || ""}
                        onChange={(e) => updateField("contact_email2", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Hours</Label>
                    <Textarea
                      value={content.contact_hours || "Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed"}
                      onChange={(e) => updateField("contact_hours", e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  {/* Map Preview */}
                  {content.contact_address && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-foreground mb-4">Map Preview</h4>
                      <div className="bg-secondary/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          This is how the map will appear on the Contact page based on your address:
                        </p>
                        <div className="h-48 rounded-lg overflow-hidden border">
                          <iframe
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(content.contact_address.replace(/\n/g, ', '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            title="Address Preview Map"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Tip: Make sure your address is complete and accurate for the best map results.
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      const contactData = {
                        address: content.contact_address,
                        phone1: content.contact_phone1,
                        phone2: content.contact_phone2,
                        email1: content.contact_email1,
                        email2: content.contact_email2,
                        hours: content.contact_hours,
                      };
                      
                      handleSave("contact", "content", contactData);
                    }}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "branding" && (
              <Card className="admin-card">
                <CardHeader className="admin-card-header">
                  <CardTitle className="admin-card-title">Branding & Logo Management</CardTitle>
                </CardHeader>
                <CardContent className="admin-card-content space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Branding Guidelines</p>
                        <p className="text-blue-700 mt-1">
                          Upload your company logo and favicon to maintain consistent brand identity across the website. 
                          When no custom logo is uploaded, the site will display the text-based logo as fallback.
                        </p>
                        <p className="text-blue-700 mt-2 font-medium">
                          💡 Transparency Tip: Upload PNG files with transparent backgrounds for seamless integration 
                          with both light and dark sections of your website.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <ImageUploadWithGuidance
                        section="logo"
                        label="Company Logo"
                        value={content.branding_logo || ""}
                        onChange={(url) => updateField("branding_logo", url)}
                        placeholder="Upload company logo for navbar and footer"
                        showResponsivePreviews={true}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This logo will appear next to your company name in the navbar and footer. Use PNG format with transparent background for best results.
                        The transparent background will be preserved for seamless integration. Avoid JPEG format as it doesn't support transparency.
                      </p>
                    </div>

                    <div>
                      <ImageUploadWithGuidance
                        section="favicon"
                        label="Favicon"
                        value={content.branding_favicon || ""}
                        onChange={(url) => updateField("branding_favicon", url)}
                        placeholder="Upload favicon for browser tab icon"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        This small icon appears in browser tabs and bookmarks. Use a simple, recognizable design.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Logo Alt Text</Label>
                      <Input
                        value={content.branding_logo_alt || "Blueladder Infra Company Logo"}
                        onChange={(e) => updateField("branding_logo_alt", e.target.value)}
                        placeholder="Descriptive text for accessibility"
                      />
                      <p className="text-xs text-muted-foreground">
                        This text is used by screen readers and when the logo fails to load.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Company Name (Text Fallback)</Label>
                      <Input
                        value={content.branding_company_name || "Blueladder Infra"}
                        onChange={(e) => updateField("branding_company_name", e.target.value)}
                        placeholder="Company name for text-based logo fallback"
                      />
                      <p className="text-xs text-muted-foreground">
                        This company name will always appear next to your logo in the navbar and footer. When no logo is uploaded, it displays with an icon.
                      </p>
                    </div>
                  </div>

                  {/* Logo Preview */}
                  {content.branding_logo && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Logo + Company Name Preview</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Navbar Context</p>
                          <div className="bg-white border rounded-lg p-4 flex items-center gap-3 logo-container">
                            <img
                              src={content.branding_logo}
                              alt={content.branding_logo_alt || "Company Logo"}
                              className="h-12 object-contain logo-transparent"
                              style={{ maxWidth: '160px' }}
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-xl leading-tight text-primary">
                                {(content.branding_company_name || "Blueladder Infra").split(' ')[0]}
                              </span>
                              <span className="text-sm leading-tight text-gray-600">
                                {(content.branding_company_name || "Blueladder Infra").split(' ')[1] || 'INFRA'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Footer Context</p>
                          <div className="bg-gray-900 border rounded-lg p-4 flex items-center gap-3 logo-container">
                            <img
                              src={content.branding_logo}
                              alt={content.branding_logo_alt || "Company Logo"}
                              className="h-10 object-contain logo-transparent"
                              style={{ maxWidth: '140px' }}
                            />
                            <div className="flex flex-col">
                              <span className="font-bold text-xl leading-tight text-white">
                                {(content.branding_company_name || "Blueladder Infra").split(' ')[0]}
                              </span>
                              <span className="text-sm leading-tight text-white/60">
                                {(content.branding_company_name || "Blueladder Infra").split(' ')[1] || 'INFRA'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Fallback Preview */}
                  {!content.branding_logo && content.branding_company_name && (
                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Text Logo Preview</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Navbar Context</p>
                          <div className="bg-white border rounded-lg p-4 flex items-center">
                            <span className="text-xl font-bold text-primary">
                              {content.branding_company_name}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Footer Context</p>
                          <div className="bg-gray-900 border rounded-lg p-4 flex items-center">
                            <span className="text-lg font-bold text-white">
                              {content.branding_company_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSave("branding", "content", {
                      logo: content.branding_logo,
                      favicon: content.branding_favicon,
                      logoAlt: content.branding_logo_alt,
                      companyName: content.branding_company_name,
                    })}
                    className="admin-button-primary"
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Branding
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
    </AdminLayout>
  );
}
