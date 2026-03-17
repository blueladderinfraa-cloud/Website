import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "./_core/notification";
import * as db from "./db-sqlite";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// In-memory OTP store

// Admin procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Client procedure
const clientProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'client' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Client access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ PROJECTS ============
  projects: router({
    list: publicProcedure
      .input(z.object({ status: z.string().optional(), category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getAllProjects(input?.status, input?.category);
      }),
    
    featured: publicProcedure.query(async () => {
      return db.getFeaturedProjects();
    }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const project = await db.getProjectBySlug(input.slug);
        if (!project) throw new TRPCError({ code: 'NOT_FOUND' });
        const images = await db.getProjectImages(project.id);
        const phases = await db.getProjectPhases(project.id);
        return { ...project, images, phases };
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const project = await db.getProjectById(input.id);
        if (!project) throw new TRPCError({ code: 'NOT_FOUND' });
        const images = await db.getProjectImages(project.id);
        const phases = await db.getProjectPhases(project.id);
        return { ...project, images, phases };
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        location: z.string().optional(),
        clientName: z.string().optional(),
        clientId: z.number().optional(),
        status: z.enum(["upcoming", "ongoing", "completed"]).default("upcoming"),
        category: z.enum(["residential", "commercial", "industrial", "infrastructure"]),
        featured: z.boolean().default(false),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        budget: z.string().optional(),
        sqftBuilt: z.number().optional(),
        progress: z.number().default(0),
        beforeImage: z.string().optional(),
        afterImage: z.string().optional(),
        coverImage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProject(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        clientName: z.string().optional(),
        clientId: z.number().optional(),
        status: z.enum(["upcoming", "ongoing", "completed"]).optional(),
        category: z.enum(["residential", "commercial", "industrial", "infrastructure"]).optional(),
        featured: z.boolean().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        budget: z.string().optional(),
        sqftBuilt: z.number().optional(),
        progress: z.number().optional(),
        beforeImage: z.string().optional(),
        afterImage: z.string().optional(),
        coverImage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProject(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProject(input.id);
        return { success: true };
      }),
    
    // Project images
    addImage: adminProcedure
      .input(z.object({
        projectId: z.number(),
        imageUrl: z.string(),
        caption: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await db.addProjectImage(input);
        return { id };
      }),
    
    deleteImage: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProjectImage(input.id);
        return { success: true };
      }),
    
    // Project phases
    addPhase: adminProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
        sortOrder: z.number().default(0),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createProjectPhase(input);
        return { id };
      }),
    
    updatePhase: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["pending", "in_progress", "completed"]).optional(),
        sortOrder: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProjectPhase(id, data);
        return { success: true };
      }),
    
    deletePhase: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProjectPhase(input.id);
        return { success: true };
      }),
  }),

  // ============ CLIENT PORTAL ============
  clientPortal: router({
    myProjects: clientProcedure.query(async ({ ctx }) => {
      return db.getClientProjects(ctx.user.id);
    }),
    
    projectDetails: clientProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const clientProjects = await db.getClientProjects(ctx.user.id);
        const hasAccess = clientProjects.some(p => p.id === input.projectId) || ctx.user.role === 'admin';
        if (!hasAccess) throw new TRPCError({ code: 'FORBIDDEN' });
        
        const project = await db.getProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: 'NOT_FOUND' });
        
        const phases = await db.getProjectPhases(input.projectId);
        const logs = await db.getProjectDailyLogs(input.projectId);
        const documents = await db.getProjectDocuments(input.projectId);
        
        return { project, phases, logs, documents };
      }),
    
    getDailyLogs: clientProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const clientProjects = await db.getClientProjects(ctx.user.id);
        const hasAccess = clientProjects.some(p => p.id === input.projectId) || ctx.user.role === 'admin';
        if (!hasAccess) throw new TRPCError({ code: 'FORBIDDEN' });
        return db.getProjectDailyLogs(input.projectId);
      }),
    
    getDocuments: clientProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const clientProjects = await db.getClientProjects(ctx.user.id);
        const hasAccess = clientProjects.some(p => p.id === input.projectId) || ctx.user.role === 'admin';
        if (!hasAccess) throw new TRPCError({ code: 'FORBIDDEN' });
        return db.getProjectDocuments(input.projectId);
      }),
  }),

  // ============ DAILY LOGS ============
  dailyLogs: router({
    create: adminProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string(),
        content: z.string().optional(),
        images: z.array(z.string()).optional(),
        authorName: z.string().optional(),
        logDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createDailyLog({
          ...input,
          images: input.images ? JSON.stringify(input.images) : undefined,
          authorId: ctx.user.id,
          authorName: input.authorName || ctx.user.name || 'Site Manager',
        });
        return { id };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDailyLog(input.id);
        return { success: true };
      }),
  }),

  // ============ DOCUMENTS ============
  documents: router({
    upload: adminProcedure
      .input(z.object({
        projectId: z.number(),
        clientId: z.number().optional(),
        name: z.string(),
        type: z.enum(["contract", "blueprint", "invoice", "other"]),
        fileUrl: z.string(),
        fileKey: z.string().optional(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await db.createDocument({
          ...input,
          uploadedBy: ctx.user.id,
        });
        return { id };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteDocument(input.id);
        return { success: true };
      }),
  }),

  // ============ INQUIRIES / QUOTES ============
  inquiries: router({
    list: adminProcedure.query(async () => {
      return db.getAllInquiries();
    }),
    
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        company: z.string().optional(),
        serviceType: z.enum(["residential", "commercial", "industrial", "infrastructure", "general"]).optional(),
        message: z.string().optional(),
        area: z.number().optional(),
        constructionType: z.enum(["standard", "premium", "luxury"]).optional(),
        estimatedBudget: z.string().optional(),
        source: z.string().default("website"),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createInquiry(input);

        // Send notification to owner (non-blocking - don't fail the inquiry if notification fails)
        try {
          await notifyOwner({
            title: "New Quote Request",
            content: `New inquiry from ${input.name} (${input.email}).\nService: ${input.serviceType || 'General'}\nMessage: ${input.message || 'No message provided'}`,
          });
        } catch (err) {
          console.error("[Inquiry] Notification failed (inquiry still saved):", err);
        }

        return { id };
      }),
    
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "quoted", "converted", "closed"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateInquiryStatus(input.id, input.status);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInquiry(input.id);
        return { success: true };
      }),
  }),

  // ============ TESTIMONIALS ============
  testimonials: router({
    list: publicProcedure.query(async () => {
      return db.getActiveTestimonials();
    }),
    
    featured: publicProcedure.query(async () => {
      return db.getFeaturedTestimonials();
    }),
    
    all: adminProcedure.query(async () => {
      return db.getAllTestimonials();
    }),
    
    create: adminProcedure
      .input(z.object({
        clientName: z.string(),
        clientTitle: z.string().optional(),
        clientCompany: z.string().optional(),
        clientImage: z.string().optional(),
        content: z.string(),
        rating: z.number().min(1).max(5).default(5),
        projectId: z.number().optional(),
        featured: z.boolean().default(false),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createTestimonial(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        clientName: z.string().optional(),
        clientTitle: z.string().optional(),
        clientCompany: z.string().optional(),
        clientImage: z.string().optional(),
        content: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        projectId: z.number().optional(),
        featured: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTestimonial(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTestimonial(input.id);
        return { success: true };
      }),
  }),

  // ============ SERVICES ============
  services: router({
    list: publicProcedure.query(async () => {
      return db.getActiveServices();
    }),
    
    all: adminProcedure.query(async () => {
      return db.getAllServices();
    }),
    
    byCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => {
        return db.getServicesByCategory(input.category);
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const service = await db.getServiceBySlug(input.slug);
        if (!service) throw new TRPCError({ code: 'NOT_FOUND' });
        return service;
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        shortDescription: z.string().optional(),
        fullDescription: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        category: z.enum(["residential", "commercial", "industrial", "infrastructure"]),
        features: z.array(z.string()).optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createService({
          ...input,
          features: input.features ? JSON.stringify(input.features) : undefined,
        });
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        shortDescription: z.string().optional(),
        fullDescription: z.string().optional(),
        icon: z.string().optional(),
        image: z.string().optional(),
        category: z.enum(["residential", "commercial", "industrial", "infrastructure"]).optional(),
        features: z.array(z.string()).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData = {
          ...data,
          ...(data.features !== undefined ? { features: JSON.stringify(data.features) } : {}),
        };
        await db.updateService(id, updateData);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteService(input.id);
        return { success: true };
      }),
  }),

  // ============ SITE CONTENT ============
  siteContent: router({
    get: publicProcedure
      .input(z.object({ section: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getSiteContent(input?.section);
      }),
    
    getByKey: publicProcedure
      .input(z.object({ section: z.string(), key: z.string() }))
      .query(async ({ input }) => {
        return db.getSiteContentByKey(input.section, input.key);
      }),
    
    upsert: adminProcedure
      .input(z.object({
        section: z.string(),
        key: z.string(),
        value: z.string().optional(),
        type: z.enum(["text", "html", "image", "json"]).default("text"),
      }))
      .mutation(async ({ input }) => {
        const id = await db.upsertSiteContent(input);
        return { id };
      }),
  }),

  // ============ SITE STATS ============
  siteStats: router({
    list: publicProcedure.query(async () => {
      return db.getSiteStats();
    }),
    
    upsert: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.number(),
        label: z.string().optional(),
        suffix: z.string().optional(),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await db.upsertSiteStat(input);
        return { success: true };
      }),
  }),

  // ============ SUBCONTRACTOR APPLICATIONS ============
  subcontractors: router({
    list: adminProcedure.query(async () => {
      return db.getAllSubcontractorApplications();
    }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const app = await db.getSubcontractorApplicationById(input.id);
        if (!app) throw new TRPCError({ code: 'NOT_FOUND' });
        return app;
      }),
    
    submit: publicProcedure
      .input(z.object({
        companyName: z.string(),
        contactName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        address: z.string().optional(),
        specializations: z.array(z.string()).optional(),
        yearsExperience: z.number().optional(),
        licenseNumber: z.string().optional(),
        licenseFileUrl: z.string().optional(),
        licenseFileKey: z.string().optional(),
        insuranceFileUrl: z.string().optional(),
        insuranceFileKey: z.string().optional(),
        portfolioUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createSubcontractorApplication({
          ...input,
          specializations: input.specializations ? JSON.stringify(input.specializations) : undefined,
        });
        
        try {
          await notifyOwner({
            title: "New Subcontractor Application",
            content: `New application from ${input.companyName} (${input.contactName}).\nEmail: ${input.email}\nPhone: ${input.phone}\nSpecializations: ${input.specializations?.join(', ') || 'Not specified'}`,
          });
        } catch (err) {
          console.error("[Subcontractor] Notification failed:", err);
        }

        return { id };
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateSubcontractorApplicationStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============ TENDERS ============
  tenders: router({
    list: publicProcedure.query(async () => {
      return db.getActiveTenders();
    }),
    
    all: adminProcedure.query(async () => {
      return db.getAllTenders();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const tender = await db.getTenderById(input.id);
        if (!tender) throw new TRPCError({ code: 'NOT_FOUND' });
        return tender;
      }),
    
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        projectId: z.number().optional(),
        category: z.enum(["residential", "commercial", "industrial", "infrastructure"]),
        budget: z.string().optional(),
        deadline: z.date().optional(),
        requirements: z.string().optional(),
        status: z.enum(["open", "closed", "awarded"]).default("open"),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        const id = await db.createTender(input);
        return { id };
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        projectId: z.number().optional(),
        category: z.enum(["residential", "commercial", "industrial", "infrastructure"]).optional(),
        budget: z.string().optional(),
        deadline: z.date().optional(),
        requirements: z.string().optional(),
        status: z.enum(["open", "closed", "awarded"]).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateTender(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTender(input.id);
        return { success: true };
      }),
    
    // Tender applications
    applications: adminProcedure
      .input(z.object({ tenderId: z.number() }))
      .query(async ({ input }) => {
        return db.getTenderApplications(input.tenderId);
      }),
    
    allApplications: adminProcedure.query(async () => {
      return db.getAllTenderApplications();
    }),
    
    submitApplication: publicProcedure
      .input(z.object({
        tenderId: z.number(),
        companyName: z.string(),
        contactName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        proposedBudget: z.string().optional(),
        proposalDetails: z.string().optional(),
        attachmentUrl: z.string().optional(),
        attachmentKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const tender = await db.getTenderById(input.tenderId);
        if (!tender || tender.status !== 'open') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tender is not open for applications' });
        }
        
        const id = await db.createTenderApplication(input);
        
        try {
          await notifyOwner({
            title: "New Tender Application",
            content: `New application for tender "${tender.title}" from ${input.companyName}.\nContact: ${input.contactName} (${input.email})`,
          });
        } catch (err) {
          console.error("[Tender] Notification failed:", err);
        }

        return { id };
      }),
    
    updateApplicationStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["submitted", "under_review", "shortlisted", "awarded", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateTenderApplicationStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============ USERS MANAGEMENT ============
  users: router({
    list: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    
    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "client", "subcontractor"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
    assignToProject: adminProcedure
      .input(z.object({
        clientId: z.number(),
        projectId: z.number(),
        accessLevel: z.enum(["view", "full"]).default("view"),
      }))
      .mutation(async ({ input }) => {
        await db.assignClientToProject(input.clientId, input.projectId, input.accessLevel);
        return { success: true };
      }),
    
    removeFromProject: adminProcedure
      .input(z.object({
        clientId: z.number(),
        projectId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.removeClientFromProject(input.clientId, input.projectId);
        return { success: true };
      }),
  }),

  // ============ ADMIN SETTINGS ============
  adminSettings: router({
    getProfile: adminProcedure.query(async ({ ctx }) => {
      return { name: ctx.user.name, email: ctx.user.email, phone: ctx.user.phone };
    }),

    updateProfile: adminProcedure
      .input(z.object({ name: z.string().min(1), email: z.string().min(1), phone: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertUser({ openId: ctx.user.openId, name: input.name, email: input.email, phone: input.phone || null });
        return { success: true };
      }),

    changePassword: adminProcedure
      .input(z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(6) }))
      .mutation(async ({ ctx, input }) => {
        // Verify current password first
        const settings = await db.getSiteContent('admin_settings');
        const storedHash = settings?.find((s: any) => s.key === 'password_hash')?.value;

        const adminEmail = process.env.ADMIN_EMAIL || "blueladderinfraa@gmail.com";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

        // Check current password against DB hash or env var
        let currentValid = false;
        if (storedHash) {
          currentValid = Buffer.from(input.currentPassword).toString('base64') === storedHash;
        } else {
          currentValid = input.currentPassword === adminPassword;
        }

        if (!currentValid) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: "Current password is incorrect" });
        }

        // Store new password hash
        const newHash = Buffer.from(input.newPassword).toString('base64');
        await db.upsertSiteContent({ section: 'admin_settings', key: 'password_hash', value: newHash, type: 'text' });

        return { success: true };
      }),
  }),

  // ============ DASHBOARD ============
  dashboard: router({
    stats: adminProcedure.query(async () => {
      return db.getDashboardStats();
    }),
  }),

  // ============ FILE UPLOAD ============
  upload: router({
    getPresignedUrl: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
        folder: z.string().default("uploads"),
      }))
      .mutation(async ({ input, ctx }) => {
        const fileKey = `${input.folder}/${ctx.user.id}-${nanoid()}-${input.filename}`;
        return { fileKey, uploadUrl: `/api/upload/${fileKey}` };
      }),
    
    image: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        contentType: z.string(),
        folder: z.string().default("images"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate content type
        if (!input.contentType.startsWith("image/")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid file type. Only images are allowed." });
        }
        
        // Generate unique file key
        const ext = input.filename.split(".").pop() || "jpg";
        const fileKey = `${input.folder}/${ctx.user.id}-${nanoid()}.${ext}`;
        
        // Convert base64 to buffer
        const buffer = Buffer.from(input.base64, "base64");
        
        // Validate file size (max 5MB)
        if (buffer.length > 5 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "File size must be less than 5MB" });
        }
        
        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.contentType);
        
        return { url, fileKey };
      }),
  }),

  // ============ COST ESTIMATOR ============
  estimator: router({
    calculate: publicProcedure
      .input(z.object({
        area: z.number().min(100).max(100000),
        constructionType: z.enum(["standard", "premium", "luxury"]),
      }))
      .query(({ input }) => {
        // Base rates per sq ft (in currency units)
        const rates = {
          standard: { min: 1200, max: 1800 },
          premium: { min: 2000, max: 3000 },
          luxury: { min: 3500, max: 5500 },
        };
        
        const rate = rates[input.constructionType];
        const minCost = input.area * rate.min;
        const maxCost = input.area * rate.max;
        
        // Material breakdown percentages
        const breakdown = {
          foundation: 0.12,
          structure: 0.25,
          roofing: 0.08,
          electrical: 0.10,
          plumbing: 0.08,
          finishing: 0.20,
          labor: 0.17,
        };
        
        const avgCost = (minCost + maxCost) / 2;
        const materials = Object.entries(breakdown).map(([name, percentage]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          percentage: Math.round(percentage * 100),
          estimatedCost: Math.round(avgCost * percentage),
        }));
        
        return {
          area: input.area,
          constructionType: input.constructionType,
          minCost: Math.round(minCost),
          maxCost: Math.round(maxCost),
          avgCost: Math.round(avgCost),
          materials,
          disclaimer: "This is an approximate estimate. Actual costs may vary based on location, materials, and specific requirements.",
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
