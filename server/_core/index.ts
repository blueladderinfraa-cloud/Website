import "dotenv/config";
import express from "express";
import { createServer } from "http";
import fs from "fs";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Serve uploaded files statically
  const uploadsPath = process.env.UPLOADS_PATH
    || (process.env.NODE_ENV === "production"
      ? path.join(process.cwd(), "dist", "public", "uploads")
      : path.join(process.cwd(), "client", "public", "uploads"));
  app.use("/uploads", express.static(uploadsPath));
  console.log("[Server] Serving uploads from:", uploadsPath);
  
  // Google Search Console verification - MUST be before any other routes
  app.get("/google102cab5db49cc2e0.html", (req, res) => {
    res.type("text/html").send("google-site-verification: google102cab5db49cc2e0.html");
  });

  // CRITICAL: Register ALL API routes BEFORE any other middleware
  console.log("[Server] Registering OAuth routes...");
  registerOAuthRoutes(app);
  
  console.log("[Server] Registering tRPC routes...");
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // Add a catch-all for unhandled API routes
  app.use('/api/*', (req, res, next) => {
    console.log(`[Server] Unhandled API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'API endpoint not found', path: req.originalUrl });
  });
  
  // Serve SEO files inline (avoids file path issues in production)
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain").send(`# Blueladder Infra - Construction Company
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-access
Disallow: /admin-login
Disallow: /go-admin
Disallow: /api/

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://www.blueladderinfra.in/sitemap.xml
`);
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.blueladderinfra.in/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://www.blueladderinfra.in/about</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.blueladderinfra.in/services</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://www.blueladderinfra.in/projects</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://www.blueladderinfra.in/contact</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
  <url><loc>https://www.blueladderinfra.in/cost-estimator</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>`);
  });

  app.get("/llms.txt", (req, res) => {
    res.type("text/plain").send(`# Blueladder Infra
> Leading construction company in Gujarat, India with 18+ years of experience.

## Services
- Residential Construction: Homes, apartments, villas
- Commercial Construction: Offices, retail spaces, malls
- Industrial Construction: Factories, warehouses
- Infrastructure Development: Roads, bridges

## Pages
- Home: https://www.blueladderinfra.in/
- About: https://www.blueladderinfra.in/about
- Services: https://www.blueladderinfra.in/services
- Projects: https://www.blueladderinfra.in/projects
- Cost Estimator: https://www.blueladderinfra.in/cost-estimator
- Contact: https://www.blueladderinfra.in/contact

## Contact
- Phone: +91 7778849470
- Location: Gujarat, India
`);
  });

  console.log("[Server] Setting up static/Vite serving...");
  // AFTER all API routes are registered, set up Vite/static serving
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
