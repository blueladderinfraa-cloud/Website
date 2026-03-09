import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database functions
vi.mock("./db-sqlite", () => ({
  getAllInquiries: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      company: "Test Corp",
      serviceType: "residential",
      message: "I need a new home built",
      status: "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  createInquiry: vi.fn().mockResolvedValue(1),
  updateInquiryStatus: vi.fn().mockResolvedValue(undefined),
  deleteInquiry: vi.fn().mockResolvedValue(undefined),
}));

// Mock the notification function
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

describe("inquiries router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create inquiry (public)", () => {
    it("should create a new inquiry successfully", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiries.create({
        name: "Jane Smith",
        email: "jane@example.com",
        message: "I want to build a commercial building",
        serviceType: "commercial",
      });

      expect(result).toEqual({ id: 1 });
    });

    it("should require name and email", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.inquiries.create({
          name: "",
          email: "invalid",
          message: "Test",
        })
      ).rejects.toThrow();
    });
  });

  describe("list inquiries (admin only)", () => {
    it("should return inquiries for admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiries.list();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("John Doe");
    });

    it("should reject non-admin users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.inquiries.list()).rejects.toThrow();
    });
  });

  describe("update inquiry status (admin only)", () => {
    it("should update status for admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiries.updateStatus({
        id: 1,
        status: "contacted",
      });

      expect(result).toEqual({ success: true });
    });
  });

  describe("delete inquiry (admin only)", () => {
    it("should delete inquiry for admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.inquiries.delete({ id: 1 });

      expect(result).toEqual({ success: true });
    });
  });
});
