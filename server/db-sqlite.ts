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

  // Seed data if database is empty
  const projectCount = sqlite.prepare("SELECT COUNT(*) as cnt FROM projects").get() as any;
  if (projectCount?.cnt === 0) {
    console.log("[Database] Empty database detected - seeding with Blueladder data...");
    seedDatabase(sqlite);
  }
}

function seedDatabase(sqlite: InstanceType<typeof Database>) {
  // ===== ADMIN USER =====
  sqlite.exec(`
    INSERT OR IGNORE INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
    VALUES ('admin-local-dev', 'Admin User', 'admin@blueladder.com', 'local', 'admin', 1767705908, 1767705908, 1767705908);
  `);

  // ===== PROJECTS =====
  sqlite.exec(`
    INSERT INTO projects (id, title, slug, description, location, clientName, clientId, status, category, featured, startDate, endDate, budget, sqftBuilt, progress, beforeImage, afterImage, coverImage, createdAt, updatedAt) VALUES
    (1, 'Pranav Buiness Point', 'Luxury Commercial complex', 'A premium Commercial development featuring modern large space of offices', 'Surat, Gujarat', '', '', 'ongoing', 'commercial', 1, NULL, NULL, '2500000', '25000', 65, '', '', '/uploads/images/1-CZYnIRHBrXdy9LwVelt18.jpg', 1767705908, 1767705908),
    (2, 'Residential', 'Luxury Smart Bungalow', '"Precision in every curve. From the first digital stroke to the final brick, we build exactly what we dream."', 'Surat', '', '', 'completed', 'residential', 1, NULL, NULL, '5000000', '50000', 100, '', '', '/uploads/images/1-jwwBNy02bDaaGXFymjm29.jpg', 1767705908, 1767705908),
    (3, 'Industrial', 'Textile Machinery', 'Modern warehouse and distribution center with automated systems.', 'Industrial Zone', '', '', 'ongoing', 'industrial', 0, NULL, NULL, '3500000', '75000', 0, '', '', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', 1767705908, 1767705908),
    (5, 'Sanctum Palacio', 'Abhishek Builders', '2BHK and 3BHK Fully Residential Projects, Which total Square Feet Area is 5 lakh.', 'Pal-Palanpur Gauravpath Road', '', '', 'ongoing', 'residential', 1, NULL, NULL, NULL, NULL, 0, '', '', '/uploads/images/1-_FBtgc0PoRV0qWhfK1Wz6.jpg', 1768219603, 1768219603),
    (6, 'Sayan Textile Park- Industrial ', 'Light Manufacturing Unit', '"We don''t just build walls; we craft identities."', 'Icchapur, Surat', '', '', 'completed', 'industrial', 0, NULL, NULL, NULL, NULL, 0, '', '', '/uploads/images/1-yOUbmZkzk74rYmgugaVhe.jpg', 1768220102, 1768220102),
    (7, 'Bansri Laxuria', 'The Residential Project', '', 'Surat', '', '', 'completed', 'residential', 0, NULL, NULL, NULL, NULL, 0, '', '', '/uploads/images/1--ZUq9HLnMJHJ8KL7Ec6qw.jpg', 1772709070, 1772709070);
  `);

  // ===== PROJECT IMAGES =====
  sqlite.exec(`
    INSERT INTO projectImages (id, projectId, imageUrl, caption, sortOrder, createdAt) VALUES
    (1, 5, '/uploads/images/1-FKqJz4moeZji3kUTU5A-p.jpg', '', 0, 1768238725),
    (2, 5, '/uploads/images/1-wVWTa7NUpT42Gj9hZPsoP.jpg', '', 1, 1768238725),
    (3, 5, '/uploads/images/1-D9z0X9gRmGPWOh3Fo7USp.jpg', '', 2, 1768238725),
    (4, 5, '/uploads/images/1-noVA-MulRgA_q9-SHwHSd.jpg', '', 3, 1768238725),
    (5, 5, '/uploads/images/1-qsnssk_xwj_gjirjozrDM.jpg', '', 4, 1768238725),
    (6, 1, '/uploads/images/1-br2bjWa8xagtScKgtTUp2.jpg', '', 0, 1772692278),
    (7, 2, '/uploads/images/1-Dt7k7UyXU90XvTxuPW6PO.jpg', '', 0, 1772692779),
    (8, 6, '/uploads/images/1-yOUbmZkzk74rYmgugaVhe.jpg', '', 0, 1772705798),
    (9, 1, '/uploads/images/1-CZYnIRHBrXdy9LwVelt18.jpg', '', 0, 1772705850),
    (10, 1, '/uploads/images/1-esBjwQrfQS14N9E_joKxq.jpg', '', 1, 1772705850),
    (11, 2, '/uploads/images/1-jwwBNy02bDaaGXFymjm29.jpg', '', 0, 1772705900),
    (12, 2, '/uploads/images/1-DJb1O3HhvGLjBxPCpKQhJ.jpg', '', 1, 1772705900),
    (13, 7, '/uploads/images/1--ZUq9HLnMJHJ8KL7Ec6qw.jpg', '', 0, 1772709071),
    (14, 7, '/uploads/images/1-RyGLlVC7H-8IYnW7d4vXS.jpg', '', 1, 1772709071),
    (15, 7, '/uploads/images/1-rrEDWAtOVPJn3dYohyD_U.jpg', '', 2, 1772709071);
  `);

  // ===== SERVICES =====
  sqlite.exec(`
    INSERT INTO services (id, title, slug, shortDescription, fullDescription, icon, image, category, features, isActive, sortOrder, createdAt, updatedAt) VALUES
    (1, 'Residential Construction', 'residential-construction', 'Custom homes and residential developments', 'We specialize in building custom homes, residential complexes, and housing developments with attention to detail and quality craftsmanship.', 'Home', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop', 'residential', '["Custom Design","Quality Materials","Timely Delivery","Warranty Support"]', 1, 1, 1767705908, 1767705908),
    (2, 'Commercial Construction', 'commercial-construction', 'Office buildings and commercial spaces', 'From office towers to retail spaces, we deliver commercial construction projects that meet modern business needs.', 'Building', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop', 'commercial', '["Modern Design","Smart Building Tech","Energy Efficient","Code Compliance"]', 1, 2, 1767705908, 1767705908),
    (3, 'Industrial Construction', 'industrial-construction', 'Warehouses and manufacturing facilities', 'Specialized in industrial construction including warehouses, manufacturing plants, and distribution centers.', 'Factory', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop', 'industrial', '["Heavy Duty Construction","Safety Standards","Automated Systems","Scalable Design"]', 1, 3, 1767705908, 1767705908),
    (4, 'Infrastructure Development', 'infrastructure-development', 'Roads, bridges, and public works', 'Large-scale infrastructure projects including roads, bridges, utilities, and public facilities.', 'Road', 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&h=500&fit=crop', 'infrastructure', '["Public Works","Utility Systems","Transportation","Environmental Compliance"]', 1, 4, 1767705908, 1767705908);
  `);

  // ===== TESTIMONIALS =====
  sqlite.exec(`
    INSERT INTO testimonials (id, clientName, clientTitle, clientCompany, clientImage, content, rating, projectId, featured, isActive, createdAt) VALUES
    (1, 'John Smith', 'CEO', 'Smith Enterprises', '', 'Blueladder delivered our office building on time and within budget. Exceptional quality and professionalism.', 5, NULL, 1, 1, 1767705908),
    (2, 'Sarah Johnson', 'Property Developer', 'Johnson Properties', '', 'Outstanding work on our residential complex. The attention to detail and customer service was remarkable.', 5, NULL, 1, 1, 1767705908);
  `);

  // ===== SITE CONTENT (contact, team, branding, hero, pricing) =====
  sqlite.exec(`
    INSERT INTO siteContent (id, section, key, value, type, updatedAt) VALUES
    (1, 'hero', 'title', 'Building Excellence, Delivering Dreams', 'text', 1767705908),
    (2, 'hero', 'subtitle', 'Premier construction company with 18+ years of experience in residential, commercial, and industrial projects.', 'text', 1767705908),
    (3, 'about', 'title', 'About Blueladder Infrastructure', 'text', 1767705908),
    (4, 'about', 'description', 'With over 18 years of experience, Blueladder Infrastructure has established itself as a leading construction company, delivering high-quality projects across residential, commercial, industrial, and infrastructure sectors.', 'text', 1767705908);
  `);

  sqlite.exec(`
    INSERT INTO siteContent (id, section, key, value, type, updatedAt) VALUES
    (5, 'hero', 'content', '{"headline":"BUILDING VISIONS. ELEVATING STANDARDS.","subheadline":"Leading construction company delivering excellence in residential, commercial, and industrial projects.","image":"https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80","cta":"Get a Quote"}', 'json', 1767790757);
  `);

  sqlite.exec(`
    INSERT INTO siteContent (id, section, key, value, type, updatedAt) VALUES
    (6, 'branding', 'content', '{"logo":"/uploads/images/1--PB1IffJ_-CPFNkO8u4-6.jpg"}', 'json', 1768043622);
  `);

  sqlite.exec(`
    INSERT INTO siteContent (id, section, key, value, type, updatedAt) VALUES
    (7, 'contact', 'content', '{"address":"G-20, Canal Walk Shoppers, B/s Palanpur Bus Station, Palanpur Canal Road, Surat, Gujarat 395009.","phone1":"+91 7778849470","phone2":"+91 9033861812","email1":"blueladderinfraa@gmail.com","hours":"Monday - Saturday: 9:00 AM - 6:00 PM\nSunday: Closed"}', 'json', 1768044305);
  `);

  sqlite.exec(`
    INSERT INTO siteContent (id, section, key, value, type, updatedAt) VALUES
    (8, 'services', 'content', '{"service_0_image":"/uploads/images/1-Ow9Tcp-KFIFnh0TKhIqo1.HEIC","service_2_image":"/uploads/images/1-jBZ38VmIN1aHqYaikmSbv.HEIC"}', 'json', 1768044620);
  `);

  sqlite.exec(`
    INSERT INTO siteContent (id, section, key, value, type, updatedAt) VALUES
    (9, 'team', 'content', '{"team_count":"2","team_0_name":"Manthan Kevadia","team_0_role":"CEO","team_0_image":"/uploads/images/1-3GiZDbcZYDD0dVbjiy2xo.jpg","team_1_name":"Ravi Gorasiya","team_1_role":"Founder","team_1_image":"/uploads/images/1-rHI3rUA-KkQYI_lgw5FJi.jpg"}', 'json', 1768049422);
  `);

  sqlite.exec(`
    INSERT INTO siteContent (id, section, key, value, type, updatedAt) VALUES
    (10, 'pricing', 'content', '{"residential_basic":"900","residential_standard":"1050","residential_premium":"1150","residential_luxury":"1250"}', 'json', 1772710668);
  `);

  console.log("[Database] Seed data restored successfully - 6 projects, 15 images, 4 services, 2 testimonials, contact info, team, pricing");
}

export async function getDb() {
  if (!_db) {
    try {
      // Use persistent volume path in production, local file in development
      const dbPath = process.env.DATABASE_PATH || './local.db';
      console.log(`[Database] Using database at: ${dbPath}`);
      let sqlite: InstanceType<typeof Database>;
      try {
        sqlite = new Database(dbPath);
      } catch (dbError) {
        // If volume path fails (e.g. /data not mounted), fall back to local
        console.warn(`[Database] Failed to open ${dbPath}, falling back to ./local.db:`, dbError);
        sqlite = new Database('./local.db');
      }
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