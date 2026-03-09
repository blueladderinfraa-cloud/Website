import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

// Core user table with roles
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "client", "subcontractor"]).default("user").notNull(),
  company: varchar("company", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Projects table
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  clientName: varchar("clientName", { length: 255 }),
  clientId: int("clientId"),
  status: mysqlEnum("status", ["upcoming", "ongoing", "completed"]).default("upcoming").notNull(),
  category: mysqlEnum("category", ["residential", "commercial", "industrial", "infrastructure"]).default("residential").notNull(),
  featured: boolean("featured").default(false),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  sqftBuilt: int("sqftBuilt"),
  progress: int("progress").default(0),
  beforeImage: text("beforeImage"),
  afterImage: text("afterImage"),
  coverImage: text("coverImage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Project images gallery
export const projectImages = mysqlTable("projectImages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  caption: varchar("caption", { length: 255 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectImage = typeof projectImages.$inferSelect;
export type InsertProjectImage = typeof projectImages.$inferInsert;

// Project timeline phases
export const projectPhases = mysqlTable("projectPhases", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  sortOrder: int("sortOrder").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectPhase = typeof projectPhases.$inferSelect;
export type InsertProjectPhase = typeof projectPhases.$inferInsert;

// Daily logs for projects
export const dailyLogs = mysqlTable("dailyLogs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  images: json("images").$type<string[]>(),
  authorId: int("authorId"),
  authorName: varchar("authorName", { length: 255 }),
  logDate: timestamp("logDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertDailyLog = typeof dailyLogs.$inferInsert;

// Client documents
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  clientId: int("clientId"),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["contract", "blueprint", "invoice", "other"]).default("other").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }),
  fileSize: int("fileSize"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// Quote requests / Inquiries
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  company: varchar("company", { length: 255 }),
  serviceType: mysqlEnum("serviceType", ["residential", "commercial", "industrial", "infrastructure", "general"]).default("general"),
  message: text("message"),
  area: int("area"),
  constructionType: mysqlEnum("constructionType", ["standard", "premium", "luxury"]),
  estimatedBudget: decimal("estimatedBudget", { precision: 15, scale: 2 }),
  status: mysqlEnum("status", ["new", "contacted", "quoted", "converted", "closed"]).default("new").notNull(),
  source: varchar("source", { length: 100 }).default("website"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

// Testimonials
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientTitle: varchar("clientTitle", { length: 255 }),
  clientCompany: varchar("clientCompany", { length: 255 }),
  clientImage: text("clientImage"),
  content: text("content").notNull(),
  rating: int("rating").default(5),
  projectId: int("projectId"),
  featured: boolean("featured").default(false),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// Services
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  shortDescription: text("shortDescription"),
  fullDescription: text("fullDescription"),
  icon: varchar("icon", { length: 100 }),
  image: text("image"),
  category: mysqlEnum("category", ["residential", "commercial", "industrial", "infrastructure"]).notNull(),
  features: json("features").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// Site content (CMS)
export const siteContent = mysqlTable("siteContent", {
  id: int("id").autoincrement().primaryKey(),
  section: varchar("section", { length: 100 }).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  type: mysqlEnum("type", ["text", "html", "image", "json"]).default("text").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteContent = typeof siteContent.$inferSelect;
export type InsertSiteContent = typeof siteContent.$inferInsert;

// Site statistics
export const siteStats = mysqlTable("siteStats", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: int("value").default(0),
  label: varchar("label", { length: 255 }),
  suffix: varchar("suffix", { length: 50 }),
  sortOrder: int("sortOrder").default(0),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteStat = typeof siteStats.$inferSelect;
export type InsertSiteStat = typeof siteStats.$inferInsert;

// Subcontractor applications
export const subcontractorApplications = mysqlTable("subcontractorApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  address: text("address"),
  specializations: json("specializations").$type<string[]>(),
  yearsExperience: int("yearsExperience"),
  licenseNumber: varchar("licenseNumber", { length: 100 }),
  licenseFileUrl: text("licenseFileUrl"),
  licenseFileKey: varchar("licenseFileKey", { length: 500 }),
  insuranceFileUrl: text("insuranceFileUrl"),
  insuranceFileKey: varchar("insuranceFileKey", { length: 500 }),
  portfolioUrl: text("portfolioUrl"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubcontractorApplication = typeof subcontractorApplications.$inferSelect;
export type InsertSubcontractorApplication = typeof subcontractorApplications.$inferInsert;

// Tenders
export const tenders = mysqlTable("tenders", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  projectId: int("projectId"),
  category: mysqlEnum("category", ["residential", "commercial", "industrial", "infrastructure"]).notNull(),
  budget: decimal("budget", { precision: 15, scale: 2 }),
  deadline: timestamp("deadline"),
  requirements: text("requirements"),
  status: mysqlEnum("status", ["open", "closed", "awarded"]).default("open").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = typeof tenders.$inferInsert;

// Tender applications
export const tenderApplications = mysqlTable("tenderApplications", {
  id: int("id").autoincrement().primaryKey(),
  tenderId: int("tenderId").notNull(),
  subcontractorId: int("subcontractorId"),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  proposedBudget: decimal("proposedBudget", { precision: 15, scale: 2 }),
  proposalDetails: text("proposalDetails"),
  attachmentUrl: text("attachmentUrl"),
  attachmentKey: varchar("attachmentKey", { length: 500 }),
  status: mysqlEnum("status", ["submitted", "under_review", "shortlisted", "awarded", "rejected"]).default("submitted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TenderApplication = typeof tenderApplications.$inferSelect;
export type InsertTenderApplication = typeof tenderApplications.$inferInsert;

// Client project assignments
export const clientProjects = mysqlTable("clientProjects", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  projectId: int("projectId").notNull(),
  accessLevel: mysqlEnum("accessLevel", ["view", "full"]).default("view").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = typeof clientProjects.$inferInsert;
