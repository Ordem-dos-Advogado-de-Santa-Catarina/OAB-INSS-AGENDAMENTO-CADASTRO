import "dotenv/config";
process.env.TZ = "America/Sao_Paulo";
import express from "express";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import {} from "./oauth.js";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { cronService } from "../services/cronService.js";
import { emailWorker } from "../services/emailWorker.js";
import { serveStatic, setupVite } from "./vite.js";
import { seedEmailTemplates } from "../db.js";
import { getDb, getUserForm } from "../db.js";
import { formAttachments } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { sdk } from "./sdk.js";

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
  // Inicializa templates de e-mail padrão se necessário
  await seedEmailTemplates().catch(err => console.error("[EmailSeed] Error:", err));

  const app = express();
  
  // CONFIGURAÇÃO CRUCIAL PARA HTTPS/PROXY REVERSO
  app.set("trust proxy", 1); 
  app.use(helmet({ contentSecurityPolicy: false }));

  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback desativado por segurança (não utilizado em produção)
  // registerOAuthRoutes(app);

  // Uploads are private; only the authenticated endpoint below may serve them.
  const uploadsDir = path.join(process.cwd(), "server/uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const db = await getDb();
      const attachmentId = Number(req.params.id);
      if (!db || !Number.isSafeInteger(attachmentId)) return res.status(404).end();
      const [attachment] = await db.select().from(formAttachments).where(eq(formAttachments.id, attachmentId)).limit(1);
      if (!attachment) return res.status(404).end();
      const form = await getUserForm(attachment.formId);
      if (!form || (form.userId !== user.id && user.role !== "admin")) return res.status(403).end();
      const relative = attachment.fileUrl.replace(/^\/+/, "");
      const absolute = path.resolve(process.cwd(), "server", relative);
      if (!absolute.startsWith(path.resolve(uploadsDir) + path.sep) || !fs.existsSync(absolute)) return res.status(404).end();
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`);
      res.setHeader("X-Content-Type-Options", "nosniff");
      return res.sendFile(absolute);
    } catch {
      return res.status(401).end();
    }
  });

  // Serve public documents
  const docsDir = path.join(process.cwd(), "client/public/documents");
  if (fs.existsSync(docsDir)) {
    app.use("/documents", express.static(docsDir));
  }

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
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
    
    // Inicia a verificação periódica do cron (a cada 1 minuto)
    const runCron = () => {
      cronService.checkAndRun().catch(err => console.error("[Cron] Error:", err));
    };
    runCron(); // Executa imediatamente no início
    setInterval(runCron, 60 * 1000);
    
    // Inicia o worker de processamento de e-mails (a cada 30 segundos)
    emailWorker.start(30);
  });
}

startServer().catch(console.error);
