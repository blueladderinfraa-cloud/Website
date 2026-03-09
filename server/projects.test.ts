import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions with all required exports
vi.mock("./db-sqlite", () => ({
  getAllProjects: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Test Project",
      slug: "test-project",
      description: "A test project",
      status: "completed",
      category: "residential",
      coverImage: "https://example.com/image.jpg",
      isFeatured: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getProjectBySlug: vi.fn().mockResolvedValue({
    id: 1,
    title: "Test Project",
    slug: "test-project",
    description: "A test project",
    status: "completed",
    category: "residential",
    coverImage: "https://example.com/image.jpg",
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  getProjectImages: vi.fn().mockResolvedValue([]),
  getProjectPhases: vi.fn().mockResolvedValue([]),
  getFeaturedProjects: vi.fn().mockResolvedValue([
    {
      id: 1,
      title: "Featured Project",
      slug: "featured-project",
      status: "completed",
      category: "commercial",
    },
  ]),
  createProject: vi.fn().mockResolvedValue(1),
  updateProject: vi.fn().mockResolvedValue(undefined),
  deleteProject: vi.fn().mockResolvedValue(undefined),
  getAllInquiries: vi.fn().mockResolvedValue([]),
  createInquiry: vi.fn().mockResolvedValue(1),
  updateInquiryStatus: vi.fn().mockResolvedValue(undefined),
  deleteInquiry: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("projects router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list projects (public)", () => {
    it("should return projects list", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.list();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Test Project");
    });

    it("should filter by status", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.list({ status: "completed" });

      expect(result).toBeDefined();
    });

    it("should filter by category", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.list({ category: "residential" });

      expect(result).toBeDefined();
    });
  });

  describe("get project by slug (public)", () => {
    it("should return project details", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.getBySlug({ slug: "test-project" });

      expect(result).toBeDefined();
      expect(result?.title).toBe("Test Project");
    });
  });

  describe("featured projects (public)", () => {
    it("should return featured projects", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.featured();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Featured Project");
    });
  });

  describe("create project (admin only)", () => {
    it("should create project for admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.projects.create({
        title: "New Project",
        slug: "new-project",
        category: "commercial",
      });

      expect(result).toEqual({ id: 1 });
    });

    it("should reject non-admin users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.projects.create({
          title: "New Project",
          slug: "new-project",
          category: "commercial",
        })
      ).rejects.toThrow();
    });
  });
});
