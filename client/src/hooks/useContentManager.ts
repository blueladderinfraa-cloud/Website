import { trpc } from "@/lib/trpc";

/**
 * Hook for managing site content from the admin panel
 * Provides easy access to content with fallbacks and handles cache invalidation
 */
export function useContentManager() {
  const { data: allContent, refetch } = trpc.siteContent.get.useQuery();

  // Helper to get content by section and key with fallback
  const getContent = (section: string, key: string, fallback: any = null) => {
    if (!allContent) return fallback;
    
    const content = allContent.find(
      (item) => item.section === section && item.key === key
    );
    
    if (!content?.value) return fallback;
    
    try {
      // Try to parse as JSON first
      return JSON.parse(content.value);
    } catch {
      // If not JSON, return as string
      return content.value;
    }
  };

  // Force refresh content from server
  const refreshContent = async () => {
    await refetch();
  };

  // Specific content getters with typed fallbacks
  const getHeroContent = () => {
    const heroData = getContent("hero", "content", {
      headline: "Building Your Vision, Constructing Your Future",
      subheadline: "From concept to completion, we deliver exceptional construction services with unwavering commitment to quality, safety, and customer satisfaction.",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=1080&fit=crop",
      cta: "Get a Quote"
    });
    
    // Ensure image URL is valid
    if (!heroData.image || heroData.image.trim() === '') {
      heroData.image = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&h=1080&fit=crop";
    }
    
    return heroData;
  };

  const getAboutContent = () => {
    return getContent("about", "content", {
      title: "About Blueladder Infra",
      description: "We are a leading construction company committed to delivering excellence in every project. With over 18 years of experience, we have built a reputation for quality workmanship, timely delivery, and customer satisfaction.",
      vision: "To be the most trusted and innovative construction company, recognized for delivering exceptional quality, sustainable practices, and transformative projects that enhance communities and improve lives.",
      mission: "To deliver construction excellence through quality workmanship, innovative solutions, and unwavering commitment to customer satisfaction. We build not just structures, but lasting relationships and thriving communities.",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop"
    });
  };

  const getServicesContent = () => {
    const servicesData = getContent("services", "content", {});
    
    // Build services array from individual service fields
    const services = [];
    const serviceCategories = ["Residential", "Commercial", "Industrial", "Infrastructure"];
    
    for (let i = 0; i < 4; i++) {
      const service = {
        title: servicesData[`service_${i}_title`] || `${serviceCategories[i]} Construction`,
        description: servicesData[`service_${i}_desc`] || "",
        image: servicesData[`service_${i}_image`] || "",
        category: serviceCategories[i].toLowerCase()
      };
      
      services.push(service);
    }
    
    return {
      services_title: servicesData.services_title || "Our Services",
      services_description: servicesData.services_description || "Comprehensive construction services tailored to meet your specific needs, from residential homes to large-scale infrastructure projects.",
      services: services
    };
  };

  const getTestimonialsContent = () => {
    return getContent("testimonials", "content", {
      testimonials_title: "What Our Clients Say",
      testimonials_description: "Hear from our satisfied clients about their experience working with us."
    });
  };

  const getContactContent = () => {
    const contactData = getContent("contact", "content", {});
    
    // Handle both old format (with contact_ prefix) and new format (without prefix)
    return {
      address: contactData.address || contactData.contact_address || "123 Construction Ave, Building District, New York, NY 10001",
      phone1: contactData.phone1 || contactData.contact_phone1 || "+1 (234) 567-890",
      phone2: contactData.phone2 || contactData.contact_phone2 || "",
      email1: contactData.email1 || contactData.contact_email1 || "info@blueladderinfra.com",
      email2: contactData.email2 || contactData.contact_email2 || "",
      hours: contactData.hours || contactData.contact_hours || "Monday - Friday: 8:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed"
    };
  };

  const getTeamContent = () => {
    const teamData = getContent("team", "content", {});
    
    // Build team array from individual team member fields
    const teamCount = parseInt(teamData.team_count || "4");
    const team = [];
    
    for (let i = 0; i < teamCount; i++) {
      const member = {
        name: teamData[`team_${i}_name`] || (i === 0 ? "Robert Johnson" : i === 1 ? "Sarah Williams" : i === 2 ? "Michael Chen" : i === 3 ? "Emily Davis" : "Team Member"),
        role: teamData[`team_${i}_role`] || (i === 0 ? "CEO & Founder" : i === 1 ? "Chief Operations Officer" : i === 2 ? "Chief Engineer" : i === 3 ? "Project Director" : "Position"),
        image: teamData[`team_${i}_image`] || (i === 0 ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop" : 
                                                i === 1 ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop" : 
                                                i === 2 ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop" : 
                                                i === 3 ? "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop" : 
                                                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop")
      };
      
      // Only add team members that have a name
      if (member.name && member.name.trim() !== "") {
        team.push(member);
      }
    }
    
    return {
      title: teamData.team_title || "Meet Our Leadership",
      description: teamData.team_description || "Our experienced leadership team brings decades of combined expertise in construction and project management.",
      team: team
    };
  };

  const getPricingContent = () => {
    const pricingData = getContent("pricing", "content", {});
    
    // Default pricing structure (single price per level)
    const defaultPricing = {
      residential: {
        basic: 125,
        standard: 200,
        premium: 325,
        luxury: 500,
      },
      commercial: {
        basic: 150,
        standard: 240,
        premium: 375,
        luxury: 575,
      },
      industrial: {
        basic: 100,
        standard: 160,
        premium: 275,
        luxury: 425,
      },
      infrastructure: {
        basic: 200,
        standard: 325,
        premium: 500,
        luxury: 750,
      },
    };
    
    // Build pricing structure from admin data or use defaults
    const pricing: any = {};
    
    ['residential', 'commercial', 'industrial', 'infrastructure'].forEach(type => {
      pricing[type] = {};
      ['basic', 'standard', 'premium', 'luxury'].forEach(level => {
        pricing[type][level] = parseInt(pricingData[`${type}_${level}`]) || defaultPricing[type as keyof typeof defaultPricing][level as keyof typeof defaultPricing.residential];
      });
    });
    
    return pricing;
  };

  return {
    getContent,
    getHeroContent,
    getAboutContent,
    getServicesContent,
    getTestimonialsContent,
    getContactContent,
    getTeamContent,
    getPricingContent,
    refreshContent,
    isLoading: !allContent,
  };
}