import { Express, Request, Response, NextFunction } from "express";

// Simple auth shim for Render deployment.
//
// - setupAuth: no-op (keeps same API as original project)
// - isAuthenticated: attaches a demo user to req.user if none present
//   Uses process.env.DEMO_USER_ID if provided.
export async function setupAuth(app: Express): Promise<void> {
  // no-op for Render - no external OIDC provider
  return;
}

export function isAuthenticated(req: any, _res: Response, next: NextFunction) {
  if (!req.user) {
    const demoId = process.env.DEMO_USER_ID || "demo-user";
    req.user = {
      claims: {
        sub: demoId
      },
      name: process.env.DEMO_USER_NAME || "Demo User",
      email: process.env.DEMO_USER_EMAIL || "demo@example.com"
    };
  }
  return next();
}
