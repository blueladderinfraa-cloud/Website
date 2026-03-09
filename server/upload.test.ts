import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ 
    key: "images/1-test123.jpg", 
    url: "https://storage.example.com/images/1-test123.jpg" 
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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

function createUnauthContext(): TrpcContext {
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

describe("upload.image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads an image successfully for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a simple base64 encoded 1x1 pixel PNG
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.upload.image({
      base64,
      filename: "test.png",
      contentType: "image/png",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("fileKey");
    expect(result.url).toContain("https://");
  });

  it("rejects non-image content types", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const base64 = "SGVsbG8gV29ybGQ="; // "Hello World" in base64

    await expect(
      caller.upload.image({
        base64,
        filename: "test.txt",
        contentType: "text/plain",
      })
    ).rejects.toThrow("Invalid file type");
  });

  it("requires authentication", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    await expect(
      caller.upload.image({
        base64,
        filename: "test.png",
        contentType: "image/png",
      })
    ).rejects.toThrow();
  });
});

describe("upload.getPresignedUrl", () => {
  it("generates a presigned URL for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.upload.getPresignedUrl({
      filename: "document.pdf",
      contentType: "application/pdf",
    });

    expect(result).toHaveProperty("fileKey");
    expect(result).toHaveProperty("uploadUrl");
    expect(result.fileKey).toContain("uploads/");
    expect(result.fileKey).toContain("document.pdf");
  });

  it("uses custom folder when specified", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.upload.getPresignedUrl({
      filename: "contract.pdf",
      contentType: "application/pdf",
      folder: "contracts",
    });

    expect(result.fileKey).toContain("contracts/");
  });
});
