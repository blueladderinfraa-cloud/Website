import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  // Apply Vite's middleware, but it should respect the API routes already registered
  app.use(vite.middlewares);
  
  // Catch-all handler for client-side routing (SPA) - MUST be last
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // ABSOLUTELY DO NOT handle API routes here
    if (url.startsWith('/api/')) {
      console.log(`[Vite] ERROR: API route ${url} reached Vite handler - this should not happen!`);
      return next(); // Pass to next handler (which should be 404)
    }

    // Also skip admin routes - they should be handled by OAuth middleware
    if (url === '/admin' || url === '/admin-login' || url === '/admin-access' || url === '/go-admin') {
      console.log(`[Vite] ERROR: Admin route ${url} reached Vite handler - this should not happen!`);
      return next();
    }

    console.log(`[Vite] Serving SPA for route: ${url}`);

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist (but skip API routes)
  app.use("*", (req, res, next) => {
    // Skip API routes - let them be handled by Express routes
    if (req.originalUrl.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
