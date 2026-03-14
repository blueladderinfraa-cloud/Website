import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { parse as parseCookie } from "cookie";
import path from "path";
import * as db from "../db-sqlite";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  console.log("[OAuth] Registering /admin route...");
  // Direct admin route - bypasses client-side routing completely
  app.get("/admin", async (req: Request, res: Response) => {
    console.log("[OAuth] /admin route hit directly!");
    
    // Parse cookies manually
    const cookies = req.headers.cookie ? parseCookie(req.headers.cookie) : {};
    const sessionCookie = cookies[COOKIE_NAME];
    
    if (!sessionCookie) {
      console.log("[OAuth] No session cookie, redirecting to admin-access page");
      return res.redirect('/admin-access');
    }
    
    try {
      // Verify the session token
      const payload = await sdk.verifySession(sessionCookie);
      if (!payload) {
        console.log("[OAuth] Invalid session token");
        return res.redirect('/admin-access');
      }
      console.log("[OAuth] Valid session found for:", payload.openId);
      
      // Serve the main app (which will handle the /admin route client-side)
      const clientTemplate = process.env.NODE_ENV === "production"
        ? path.resolve(process.cwd(), "dist", "public", "index.html")
        : path.resolve(import.meta.dirname, "../..", "client", "index.html");
      res.sendFile(clientTemplate);
    } catch (error) {
      console.log("[OAuth] Invalid session, redirecting to admin-access page");
      res.redirect('/admin-access');
    }
  });

  console.log("[OAuth] Registering /go-admin route...");
  // Simple redirect page - uses meta refresh and immediate JS redirect
  app.get("/go-admin", (req: Request, res: Response) => {
    console.log("[OAuth] /go-admin route hit!");
    const redirectPagePath = process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), "dist", "public", "go-admin.html")
      : path.resolve(import.meta.dirname, "../..", "client", "public", "go-admin.html");
    console.log("[OAuth] Serving redirect page from:", redirectPagePath);
    res.sendFile(redirectPagePath);
  });

  console.log("[OAuth] Registering /admin-access route...");
  // Static admin access page - completely bypasses client-side routing
  app.get("/admin-access", (req: Request, res: Response) => {
    console.log("[OAuth] /admin-access route hit!");
    const accessPagePath = process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), "dist", "public", "admin-access.html")
      : path.resolve(import.meta.dirname, "../..", "client", "public", "admin-access.html");
    console.log("[OAuth] Serving access page from:", accessPagePath);
    res.sendFile(accessPagePath);
  });

  console.log("[OAuth] Registering /admin-login route...");
  // Admin login page - serves a professional login form
  app.get("/admin-login", (req: Request, res: Response) => {
    console.log("[OAuth] /admin-login route hit!");
    const loginPagePath = process.env.NODE_ENV === "production"
      ? path.resolve(process.cwd(), "dist", "public", "admin-login.html")
      : path.resolve(import.meta.dirname, "../..", "client", "admin-login.html");
    console.log("[OAuth] Serving login page from:", loginPagePath);
    res.sendFile(loginPagePath);
  });

  console.log("[OAuth] Registering /api/auth/admin-login route...");
  // Admin login with username/password
  app.post("/api/auth/admin-login", async (req: Request, res: Response) => {
    console.log("[OAuth] /api/auth/admin-login route hit!");
    
    // Allow admin login in both development and production for local setup
    const { username, password } = req.body;
    
    // Admin credentials - including production credentials for local testing
    const validCredentials: Record<string, string> = {
      admin: "admin123",
      administrator: "password123",
      blueladder: "admin2024",
      "kevadiamanthan@gmail.com": "Manthan3134"
    };

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    if (!validCredentials[username] || validCredentials[username] !== password) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    try {
      console.log("[OAuth] Valid credentials, looking for admin user...");
      // Get the admin user from database, or create if not exists
      let adminUser = await db.getUserByOpenId("admin-local-dev");

      if (!adminUser) {
        console.log("[OAuth] Admin user not found, creating...");
        await db.upsertUser({
          openId: "admin-local-dev",
          name: "Admin User",
          email: username,
          loginMethod: "admin-login",
          lastSignedIn: new Date(),
        });
        adminUser = await db.getUserByOpenId("admin-local-dev");
      }

      if (!adminUser) {
        console.log("[OAuth] Failed to create admin user");
        res.status(500).json({ error: "Failed to create admin user" });
        return;
      }

      // Ensure admin role is set
      if (adminUser.role !== "admin") {
        await db.upsertUser({ openId: "admin-local-dev", role: "admin" as any });
      }

      console.log("[OAuth] Admin user found, creating session...");
      // Create session token for admin user
      const sessionToken = await sdk.createSessionToken(adminUser.openId, {
        name: adminUser.name || "Admin User",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log("[OAuth] Session created successfully");
      res.json({ success: true, message: "Login successful" });
    } catch (error) {
      console.error("[Auth] Admin login failed", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  console.log("[OAuth] Registering /api/auth/dev-login route...");
  // Development login route - only for local development
  app.get("/api/auth/dev-login", async (req: Request, res: Response) => {
    console.log("[OAuth] /api/auth/dev-login route hit!");
    
    if (process.env.NODE_ENV !== "development") {
      console.log("[OAuth] Not in development mode, returning 404");
      res.status(404).json({ error: "Not found" });
      return;
    }

    try {
      console.log("[OAuth] Looking for admin user...");
      // Get the admin user from database
      const adminUser = await db.getUserByOpenId("admin-local-dev");
      
      if (!adminUser) {
        console.log("[OAuth] Admin user not found in database");
        res.status(404).json({ error: "Admin user not found" });
        return;
      }

      console.log("[OAuth] Admin user found, creating session...");
      // Create session token for admin user
      const sessionToken = await sdk.createSessionToken(adminUser.openId, {
        name: adminUser.name || "Admin User",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log("[OAuth] Session created, redirecting to /admin");
      // Redirect to admin panel
      res.redirect(302, "/admin");
    } catch (error) {
      console.error("[Auth] Dev login failed", error);
      res.status(500).json({ error: "Dev login failed" });
    }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
