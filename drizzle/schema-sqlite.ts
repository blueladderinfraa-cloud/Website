import { integer, sqliteTable, text, real, blob } from "drizzle-orm/sqlite-core";

// Core user table with roles
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin", "client", "subcontractor"] }).default("user").notNull(),
  company: text("company"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Projects table
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  location: text("location"),
  clientName: text("clientName"),
  clientId: integer("clientId"),
  status: text("status", { enum: ["upcoming", "ongoing", "completed"] }).default("upcoming").notNull(),
  category: text("category", { enum: ["residential", "commercial", "industrial", "infrastructure"] }).default("residential").notNull(),
  featured: integer("featured", { mode: "boolean" }).default(false),
  startDate: integer("startDate", { mode: "timestamp" }),
  endDate: integer("endDate", { mode: "timestamp" }),
  budget: text("budget"),
  sqftBuilt: integer("sqftBuilt"),
  progress: integer("progress").default(0),
  beforeImage: text("beforeImage"),
  afterImage: text("afterImage"),
  coverImage: text("coverImage"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Project images gallery
export const projectImages = sqliteTable("projectImages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  caption: text("caption"),
  sortOrder: integer("sortOrder").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ProjectImage = typeof projectImages.$inferSelect;
export type InsertProjectImage = typeof projectImages.$inferInsert;

// Project timeline phases
export const projectPhases = sqliteTable("projectPhases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status", { enum: ["pending", "in_progress", "completed"] }).default("pending").notNull(),
  sortOrder: integer("sortOrder").default(0),
  startDate: integer("startDate", { mode: "timestamp" }),
  endDate: integer("endDate", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ProjectPhase = typeof projectPhases.$inferSelect;
export type InsertProjectPhase = typeof projectPhases.$inferInsert;

// Daily logs for projects
export const dailyLogs = sqliteTable("dailyLogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  images: text("images"), // JSON string array
  authorId: integer("authorId"),
  authorName: text("authorName"),
  logDate: integer("logDate", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = typeof dailyLogs.$inferInsert;

// Client documents
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("projectId").notNull(),
  clientId: integer("clientId"),
  name: text("name").notNull(),
  type: text("type", { enum: ["contract", "blueprint", "invoice", "other"] }).default("other").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey"),
  fileSize: integer("fileSize"),
  uploadedBy: integer("uploadedBy"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// Quote requests / Inquiries
export const inquiries = sqliteTable("inquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  serviceType: text("serviceType", { enum: ["residential", "commercial", "industrial", "infrastructure", "general"] }).default("general"),
  message: text("message"),
  area: integer("area"),
  constructionType: text("constructionType", { enum: ["standard", "premium", "luxury"] }),
  estimatedBudget: text("estimatedBudget"),
  status: text("status", { enum: ["new", "contacted", "quoted", "converted", "closed"] }).default("new").notNull(),
  source: text("source").default("website"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

// Testimonials
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("clientName").notNull(),
  clientTitle: text("clientTitle"),
  clientCompany: text("clientCompany"),
  clientImage: text("clientImage"),
  content: text("content").notNull(),
  rating: integer("rating").default(5),
  projectId: integer("projectId"),
  featured: integer("featured", { mode: "boolean" }).default(false),
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// Services
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("shortDescription"),
  fullDescription: text("fullDescription"),
  icon: text("icon"),
  image: text("image"),
  category: text("category", { enum: ["residential", "commercial", "industrial", "infrastructure"] }).notNull(),
  features: text("features"), // JSON string array
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  sortOrder: integer("sortOrder").default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Site content (CMS)
export const siteContent = sqliteTable("siteContent", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  section: text("section").notNull(),
  key: text("key").notNull(),
  value: text("value"),
  type: text("type", { enum: ["text", "html", "image", "json"] }).default("text").notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

// Site statistics
export const siteStats = sqliteTable("siteStats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: integer("value").default(0),
  label: text("label"),
  suffix: text("suffix"),
  sortOrder: integer("sortOrder").default(0),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type SiteStat = typeof siteStats.$inferSelect;
export type InsertSiteStat = typeof siteStats.$inferInsert;

// Subcontractor applications
export const subcontractorApplications = sqliteTable("subcontractorApplications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId"),
  companyName: text("companyName").notNull(),
  contactName: text("contactName").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  specializations: text("specializations"), // JSON string array
  yearsExperience: integer("yearsExperience"),
  licenseNumber: text("licenseNumber"),
  licenseFileUrl: text("licenseFileUrl"),
  licenseFileKey: text("licenseFileKey"),
  insuranceFileUrl: text("insuranceFileUrl"),
  insuranceFileKey: text("insuranceFileKey"),
  portfolioUrl: text("portfolioUrl"),
  notes: text("notes"),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type SubcontractorApplication = typeof subcontractorApplications.$inferSelect;
export type InsertSubcontractorApplication = typeof subcontractorApplications.$inferInsert;

// Tenders
export const tenders = sqliteTable("tenders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("projectId"),
  category: text("category", { enum: ["residential", "commercial", "industrial", "infrastructure"] }).notNull(),
  budget: text("budget"),
  deadline: integer("deadline", { mode: "timestamp" }),
  requirements: text("requirements"),
  status: text("status", { enum: ["open", "closed", "awarded"] }).default("open").notNull(),
  isActive: integer("isActive", { mode: "boolean" }).default(true),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = typeof tenders.$inferInsert;

// Tender applications
export const tenderApplications = sqliteTable("tenderApplications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tenderId: integer("tenderId").notNull(),
  subcontractorId: integer("subcontractorId"),
  companyName: text("companyName").notNull(),
  contactName: text("contactName").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  proposedBudget: text("proposedBudget"),
  proposalDetails: text("proposalDetails"),
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: text("attachmentKey"),
  status: text("status", { enum: ["submitted", "under_review", "shortlisted", "awarded", "rejected"] }).default("submitted").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type TenderApplication = typeof tenderApplications.$inferSelect;
export type InsertTenderApplication = typeof tenderApplications.$inferInsert;

// Client project assignments
export const clientProjects = sqliteTable("clientProjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientId: integer("clientId").notNull(),
  projectId: integer("projectId").notNull(),
  accessLevel: text("accessLevel", { enum: ["view", "full"] }).default("view").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = typeof clientProjects.$inferInsert;