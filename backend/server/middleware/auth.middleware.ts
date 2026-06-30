import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage.js";
import type { AdminPermission } from "../../shared/schema.js";
import { getJwtSecret } from "../utils/secrets.js";

type PermissionKey = keyof Omit<AdminPermission, 'id' | 'userId' | 'grantedBy' | 'updatedAt'>;

function extractJwtAuth(req: Request): { userId: string; userRole: string } | null {
  if (req.session?.userId) {
    return { userId: req.session.userId, userRole: req.session.userRole || "" };
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, getJwtSecret()) as any;
      if (decoded.userId && decoded.role) {
        if (req.session) {
          req.session.userId = decoded.userId;
          req.session.userRole = decoded.role;
        }
        return { userId: decoded.userId, userRole: decoded.role };
      }
    } catch (err) {}
  }

  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = extractJwtAuth(req);
  if (!auth) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = extractJwtAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if (!allowedRoles.includes(auth.userRole)) {
      return res.status(403).json({ 
        error: "Access denied. Insufficient permissions." 
      });
    }
    
    next();
  };
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = extractJwtAuth(req);
  if (!auth || auth.userRole !== "super_admin") {
    return res.status(403).json({ 
      error: "Super Admin access only. This action requires Super Admin privileges." 
    });
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = extractJwtAuth(req);
  if (!auth) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  if (auth.userRole !== "admin" && auth.userRole !== "super_admin") {
    return res.status(403).json({ 
      error: "Admin access required. Please contact support if you need access." 
    });
  }
  
  next();
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  const staffRoles = ["admin", "super_admin", "employee", "support", "marketing", "accountant"];
  const auth = extractJwtAuth(req);
  
  if (!auth || !staffRoles.includes(auth.userRole)) {
    return res.status(403).json({ 
      error: "Staff access required." 
    });
  }
  
  next();
}

export function requireAgent(req: Request, res: Response, next: NextFunction) {
  const auth = extractJwtAuth(req);
  if (!auth || auth.userRole !== "agent") {
    return res.status(403).json({ 
      error: "Agent access required." 
    });
  }
  next();
}

export function requireAgentOrAdmin(req: Request, res: Response, next: NextFunction) {
  const allowedRoles = ["agent", "admin", "super_admin"];
  const auth = extractJwtAuth(req);
  
  if (!auth || !allowedRoles.includes(auth.userRole)) {
    return res.status(403).json({ 
      error: "Agent or Admin access required." 
    });
  }
  
  next();
}

export function requireFranchiseAccess(req: Request, res: Response, next: NextFunction) {
  const allowedRoles = [
    "super_admin", "admin", 
    "zone_franchise", "state_franchise", "district_franchise", "city_franchise"
  ];
  const auth = extractJwtAuth(req);
  
  if (!auth || !allowedRoles.includes(auth.userRole)) {
    return res.status(403).json({ 
      error: "Franchise access required." 
    });
  }
  
  next();
}

export function requirePermission(permission: PermissionKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = extractJwtAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    if (auth.userRole === "super_admin") {
      return next();
    }
    
    if (auth.userRole !== "admin") {
      return res.status(403).json({ 
        error: "Access denied. You don't have permission for this action." 
      });
    }
    
    const permissions = await storage.getAdminPermissions(auth.userId);
    
    if (!permissions || permissions[permission] !== true) {
      return res.status(403).json({ 
        error: `Access denied. Missing permission: ${permission}` 
      });
    }
    
    next();
  };
}

export async function isSuperAdminOnly(req: Request, res: Response): Promise<boolean> {
  const auth = extractJwtAuth(req);
  if (!auth || auth.userRole !== "super_admin") {
    res.status(403).json({ 
      error: "Super Admin access only. This action requires Super Admin privileges." 
    });
    return false;
  }
  return true;
}

export async function hasPermission(
  req: Request, 
  res: Response, 
  permission: PermissionKey
): Promise<boolean> {
  const auth = extractJwtAuth(req);
  if (!auth) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  
  if (auth.userRole === "super_admin") {
    return true;
  }
  
  if (auth.userRole !== "admin") {
    res.status(403).json({ 
      error: `Access denied. You don't have permission for this action.` 
    });
    return false;
  }
  
  const permissions = await storage.getAdminPermissions(auth.userId);
  
  if (!permissions || permissions[permission] !== true) {
    res.status(403).json({ 
      error: `Access denied. Missing permission: ${permission}` 
    });
    return false;
  }
  
  return true;
}
