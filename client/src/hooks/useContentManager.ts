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
      headline: "BUILDING VISIONS. ELEVATING STANDARDS.",
      subheadline: "Leading construction company delivering excellence in residential, commercial, and industrial projects.",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
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
      title: "About Blueladder Infrastructure",
      description: "With over 18 years of experience, Blueladder Infrastructure has established itself as a leading construction company, delivering high-quality projects across residential, commercial, industrial, and infrastructure sectors.",
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

    return {
      address: contactData.address || "G-20, Canal Walk Shoppers, B/s Palanpur Bus Station, Palanpur Canal Road, Surat, Gujarat 395009.",
      phone1: contactData.phone1 || "+91 7778849470",
      phone2: contactData.phone2 || "+91 9033861812",
      email1: contactData.email1 || "blueladderinfraa@gmail.com",
      email2: contactData.email2 || "",
      hours: contactData.hours || "Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed"
    };
  };

  const getTeamContent = () => {
    const teamData = getContent("team", "content", {});

    // Build team array from individual team member fields
    const teamCount = parseInt(teamData.team_count || "2");
    const team = [];

    const defaultTeam = [
      { name: "Manthan Kevadia", role: "Co-Founder & Director", image: "/uploads/images/1-3GiZDbcZYDD0dVbjiy2xo.jpg" },
      { name: "Ravi Gorasiya", role: "Co-Founder & Director", image: "/uploads/images/1-rHI3rUA-KkQYI_lgw5FJi.jpg" },
    ];

    for (let i = 0; i < teamCount; i++) {
      const defaultMember = defaultTeam[i] || { name: "", role: "", image: "" };
      const member = {
        name: teamData[`team_${i}_name`] || defaultMember.name,
        role: teamData[`team_${i}_role`] || defaultMember.role,
        image: teamData[`team_${i}_image`] || defaultMember.image,
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

    // Default pricing in INR per sq ft
    const defaultPricing = {
      residential: { basic: 900, standard: 1050, premium: 1150, luxury: 1250 },
      commercial: { basic: 1000, standard: 1200, premium: 1400, luxury: 1600 },
      industrial: { basic: 800, standard: 1000, premium: 1200, luxury: 1400 },
      infrastructure: { basic: 1100, standard: 1300, premium: 1500, luxury: 1800 },
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
