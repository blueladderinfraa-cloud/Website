import { eq, desc, asc, and, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { 
  InsertUser, users, 
  projects, InsertProject, 
  projectImages, InsertProjectImage,
  projectPhases, InsertProjectPhase,
  dailyLogs, InsertDailyLog,
  documents, InsertDocument,
  inquiries, InsertInquiry,
  testimonials, InsertTestimonial,
  services, InsertService,
  siteContent, InsertSiteContent,
  siteStats, InsertSiteStat,
  subcontractorApplications, InsertSubcontractorApplication,
  tenders, InsertTender,
  tenderApplications, InsertTenderApplication,
  clientProjects
} from "../drizzle/schema-sqlite";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _initialized = false;

function initializeTables(sqlite: InstanceType<typeof Database>) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
      name TEXT,
      email TEXT,
      phone TEXT,
      loginMethod TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      company TEXT,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch()),
      lastSignedIn INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      location TEXT,
      clientName TEXT,
      clientId INTEGER,
      status TEXT NOT NULL DEFAULT 'upcoming',
      category TEXT NOT NULL DEFAULT 'residential',
      featured INTEGER DEFAULT 0,
      startDate INTEGER,
      endDate INTEGER,
      budget TEXT,
      sqftBuilt INTEGER,
      progress INTEGER DEFAULT 0,
      beforeImage TEXT,
      afterImage TEXT,
      coverImage TEXT,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS projectImages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      imageUrl TEXT NOT NULL,
      caption TEXT,
      sortOrder INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS projectPhases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      sortOrder INTEGER DEFAULT 0,
      startDate INTEGER,
      endDate INTEGER,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS dailyLogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      images TEXT,
      authorId INTEGER,
      authorName TEXT,
      logDate INTEGER NOT NULL DEFAULT (unixepoch()),
      createdAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      clientId INTEGER,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      fileUrl TEXT NOT NULL,
      fileKey TEXT,
      fileSize INTEGER,
      uploadedBy INTEGER,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      serviceType TEXT DEFAULT 'general',
      message TEXT,
      area INTEGER,
      constructionType TEXT,
      estimatedBudget TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      source TEXT DEFAULT 'website',
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientName TEXT NOT NULL,
      clientTitle TEXT,
      clientCompany TEXT,
      clientImage TEXT,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      projectId INTEGER,
      featured INTEGER DEFAULT 0,
      isActive INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      shortDescription TEXT,
      fullDescription TEXT,
      icon TEXT,
      image TEXT,
      category TEXT NOT NULL,
      features TEXT,
      isActive INTEGER DEFAULT 1,
      sortOrder INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS siteContent (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      type TEXT NOT NULL DEFAULT 'text',
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS siteStats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value INTEGER DEFAULT 0,
      label TEXT,
      suffix TEXT,
      sortOrder INTEGER DEFAULT 0,
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS subcontractorApplications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      companyName TEXT NOT NULL,
      contactName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      specializations TEXT,
      yearsExperience INTEGER,
      licenseNumber TEXT,
      licenseFileUrl TEXT,
      licenseFileKey TEXT,
      insuranceFileUrl TEXT,
      insuranceFileKey TEXT,
      portfolioUrl TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS tenders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      projectId INTEGER,
      category TEXT NOT NULL,
      budget TEXT,
      deadline INTEGER,
      requirements TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      isActive INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS tenderApplications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenderId INTEGER NOT NULL,
      subcontractorId INTEGER,
      companyName TEXT NOT NULL,
      contactName TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      proposedBudget TEXT,
      proposalDetails TEXT,
      attachmentUrl TEXT,
      attachmentKey TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
      updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE TABLE IF NOT EXISTS clientProjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientId INTEGER NOT NULL,
      projectId INTEGER NOT NULL,
      accessLevel TEXT NOT NULL DEFAULT 'view',
      createdAt INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);
  console.log("[Database] All tables initialized successfully");
}

export async function getDb() {
  if (!_db) {
    try {
      const sqlite = new Database('./local.db');
      if (!_initialized) {
        initializeTables(sqlite);
        _initialized = true;
      }
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "company"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "client" | "subcontractor") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============ PROJECT QUERIES ============
export async function getAllProjects(status?: string, category?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (status) conditions.push(eq(projects.status, status as any));
  if (category) conditions.push(eq(projects.category, category as any));
  
  if (conditions.length > 0) {
    return db.select().from(projects).where(and(...conditions)).orderBy(desc(projects.createdAt));
  }
  
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getFeaturedProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.featured, true)).orderBy(desc(projects.createdAt)).limit(6);
}

export async function getProjectBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(project).returning({ id: projects.id });
  return result[0].id;
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(eq(projects.id, id));
}

// ============ PROJECT IMAGES ============
export async function getProjectImages(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectImages).where(eq(projectImages.projectId, projectId)).orderBy(asc(projectImages.sortOrder));
}

export async function addProjectImage(image: InsertProjectImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectImages).values(image).returning({ id: projectImages.id });
  return result[0].id;
}

export async function deleteProjectImage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectImages).where(eq(projectImages.id, id));
}

// ============ PROJECT PHASES ============
export async function getProjectPhases(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectPhases).where(eq(projectPhases.projectId, projectId)).orderBy(asc(projectPhases.sortOrder));
}

export async function createProjectPhase(phase: InsertProjectPhase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projectPhases).values(phase).returning({ id: projectPhases.id });
  return result[0].id;
}

export async function updateProjectPhase(id: number, data: Partial<InsertProjectPhase>) {
  const db = await getDb();
  if (!db) return;
  await db.update(projectPhases).set(data).where(eq(projectPhases.id, id));
}

export async function deleteProjectPhase(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectPhases).where(eq(projectPhases.id, id));
}

// ============ DAILY LOGS ============
export async function getProjectDailyLogs(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dailyLogs).where(eq(dailyLogs.projectId, projectId)).orderBy(desc(dailyLogs.logDate));
}

export async function createDailyLog(log: InsertDailyLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dailyLogs).values(log).returning({ id: dailyLogs.id });
  return result[0].id;
}

export async function deleteDailyLog(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(dailyLogs).where(eq(dailyLogs.id, id));
}

// ============ DOCUMENTS ============
export async function getProjectDocuments(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.projectId, projectId)).orderBy(desc(documents.createdAt));
}

export async function getClientDocuments(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.clientId, clientId)).orderBy(desc(documents.createdAt));
}

export async function createDocument(doc: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(doc).returning({ id: documents.id });
  return result[0].id;
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documents).where(eq(documents.id, id));
}

// ============ INQUIRIES ============
export async function getAllInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
}

export async function getInquiryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createInquiry(inquiry: InsertInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(inquiries).values(inquiry).returning({ id: inquiries.id });
  return result[0].id;
}

export async function updateInquiryStatus(id: number, status: "new" | "contacted" | "quoted" | "converted" | "closed") {
  const db = await getDb();
  if (!db) return;
  await db.update(inquiries).set({ status }).where(eq(inquiries.id, id));
}

export async function deleteInquiry(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(inquiries).where(eq(inquiries.id, id));
}

// ============ TESTIMONIALS ============
export async function getAllTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
}

export async function getActiveTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(desc(testimonials.createdAt));
}

export async function getFeaturedTestimonials() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(testimonials).where(and(eq(testimonials.isActive, true), eq(testimonials.featured, true))).orderBy(desc(testimonials.createdAt));
}

export async function createTestimonial(testimonial: InsertTestimonial) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(testimonials).values(testimonial).returning({ id: testimonials.id });
  return result[0].id;
}

export async function updateTestimonial(id: number, data: Partial<InsertTestimonial>) {
  const db = await getDb();
  if (!db) return;
  await db.update(testimonials).set(data).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(testimonials).where(eq(testimonials.id, id));
}

// ============ SERVICES ============
// Helper function to parse service features
function parseServiceFeatures(service: any) {
  if (!service) return service;
  
  const parsed = { ...service };
  if (parsed.features && typeof parsed.features === 'string') {
    try {
      parsed.features = JSON.parse(parsed.features);
    } catch (e) {
      parsed.features = [];
    }
  }
  if (!Array.isArray(parsed.features)) {
    parsed.features = [];
  }
  return parsed;
}

export async function getAllServices() {
  const db = await getDb();
  if (!db) return [];
  const allServices = await db.select().from(services).orderBy(asc(services.sortOrder));
  return allServices.map(parseServiceFeatures);
}

export async function getActiveServices() {
  const db = await getDb();
  if (!db) return [];
  const activeServices = await db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder));
  return activeServices.map(parseServiceFeatures);
}

export async function getServiceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(services).where(eq(services.slug, slug)).limit(1);
  return result.length > 0 ? parseServiceFeatures(result[0]) : undefined;
}

export async function getServicesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  const categoryServices = await db.select().from(services).where(and(eq(services.category, category as any), eq(services.isActive, true))).orderBy(asc(services.sortOrder));
  return categoryServices.map(parseServiceFeatures);
}

export async function createService(service: InsertService) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(services).values(service).returning({ id: services.id });
  return result[0].id;
}

export async function updateService(id: number, data: Partial<InsertService>) {
  const db = await getDb();
  if (!db) return;
  await db.update(services).set(data).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(services).where(eq(services.id, id));
}

// ============ SITE CONTENT ============
export async function getSiteContent(section?: string) {
  const db = await getDb();
  if (!db) return [];
  if (section) {
    return db.select().from(siteContent).where(eq(siteContent.section, section));
  }
  return db.select().from(siteContent);
}

export async function getSiteContentByKey(section: string, key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteContent).where(and(eq(siteContent.section, section), eq(siteContent.key, key))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSiteContent(content: InsertSiteContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getSiteContentByKey(content.section, content.key);
  if (existing) {
    await db.update(siteContent).set({ value: content.value, type: content.type }).where(eq(siteContent.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(siteContent).values(content).returning({ id: siteContent.id });
    return result[0].id;
  }
}

// ============ SITE STATS ============
export async function getSiteStats() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteStats).orderBy(asc(siteStats.sortOrder));
}

export async function upsertSiteStat(stat: InsertSiteStat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(siteStats).values(stat).onConflictDoUpdate({
    target: siteStats.key,
    set: { value: stat.value, label: stat.label, suffix: stat.suffix, sortOrder: stat.sortOrder }
  });
}

// ============ SUBCONTRACTOR APPLICATIONS ============
export async function getAllSubcontractorApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subcontractorApplications).orderBy(desc(subcontractorApplications.createdAt));
}

export async function getSubcontractorApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subcontractorApplications).where(eq(subcontractorApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createSubcontractorApplication(application: InsertSubcontractorApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(subcontractorApplications).values(application).returning({ id: subcontractorApplications.id });
  return result[0].id;
}

export async function updateSubcontractorApplicationStatus(id: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return;
  await db.update(subcontractorApplications).set({ status }).where(eq(subcontractorApplications.id, id));
}

// ============ TENDERS ============
export async function getAllTenders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenders).orderBy(desc(tenders.createdAt));
}

export async function getActiveTenders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenders).where(and(eq(tenders.isActive, true), eq(tenders.status, "open"))).orderBy(desc(tenders.createdAt));
}

export async function getTenderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tenders).where(eq(tenders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTender(tender: InsertTender) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tenders).values(tender).returning({ id: tenders.id });
  return result[0].id;
}

export async function updateTender(id: number, data: Partial<InsertTender>) {
  const db = await getDb();
  if (!db) return;
  await db.update(tenders).set(data).where(eq(tenders.id, id));
}

export async function deleteTender(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(tenders).where(eq(tenders.id, id));
}

// ============ TENDER APPLICATIONS ============
export async function getTenderApplications(tenderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenderApplications).where(eq(tenderApplications.tenderId, tenderId)).orderBy(desc(tenderApplications.createdAt));
}

export async function getAllTenderApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenderApplications).orderBy(desc(tenderApplications.createdAt));
}

export async function createTenderApplication(application: InsertTenderApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tenderApplications).values(application).returning({ id: tenderApplications.id });
  return result[0].id;
}

export async function updateTenderApplicationStatus(id: number, status: "submitted" | "under_review" | "shortlisted" | "awarded" | "rejected") {
  const db = await getDb();
  if (!db) return;
  await db.update(tenderApplications).set({ status }).where(eq(tenderApplications.id, id));
}

// ============ CLIENT PROJECTS ============
export async function getClientProjects(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const clientProjectIds = await db.select().from(clientProjects).where(eq(clientProjects.clientId, clientId));
  if (clientProjectIds.length === 0) return [];
  
  const projectIds = clientProjectIds.map(cp => cp.projectId);
  return db.select().from(projects).where(inArray(projects.id, projectIds)).orderBy(desc(projects.createdAt));
}

export async function assignClientToProject(clientId: number, projectId: number, accessLevel: "view" | "full" = "view") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clientProjects).values({ clientId, projectId, accessLevel });
}

export async function removeClientFromProject(clientId: number, projectId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(clientProjects).where(and(eq(clientProjects.clientId, clientId), eq(clientProjects.projectId, projectId)));
}

// ============ DASHBOARD STATS ============
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalProjects: 0, activeProjects: 0, totalInquiries: 0, newInquiries: 0, totalClients: 0 };
  
  const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);
  const [activeProjectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, "ongoing"));
  const [inquiryCount] = await db.select({ count: sql<number>`count(*)` }).from(inquiries);
  const [newInquiryCount] = await db.select({ count: sql<number>`count(*)` }).from(inquiries).where(eq(inquiries.status, "new"));
  const [clientCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "client"));
  
  return {
    totalProjects: Number(projectCount?.count || 0),
    activeProjects: Number(activeProjectCount?.count || 0),
    totalInquiries: Number(inquiryCount?.count || 0),
    newInquiries: Number(newInquiryCount?.count || 0),
    totalClients: Number(clientCount?.count || 0)
  };
}