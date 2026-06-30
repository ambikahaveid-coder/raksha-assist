import bcrypt from "bcryptjs";
import { storage } from "../storage.js";

export const CANONICAL_SUPERADMIN_EMAIL = "superadmin@rakshaassist.com";
const DEFAULT_SUPERADMIN_MOBILE = "9999900001";

export type SuperAdminConfig = {
  email: string;
  password: string;
  mobile: string;
};

export function getRequiredSuperAdminConfig(): SuperAdminConfig {
  const email = (process.env.SUPERADMIN_EMAIL || "").toLowerCase().trim();
  const password = process.env.SUPERADMIN_PASSWORD || "";
  const mobile = (process.env.SUPERADMIN_MOBILE || DEFAULT_SUPERADMIN_MOBILE).trim();

  if (process.env.NODE_ENV === "production") {
    if (!email) {
      throw new Error("FATAL: SUPERADMIN_EMAIL must be set in production");
    }
    if (!password) {
      throw new Error("FATAL: SUPERADMIN_PASSWORD must be set in production");
    }
  }

  const resolvedEmail = email || CANONICAL_SUPERADMIN_EMAIL;
  if (resolvedEmail !== CANONICAL_SUPERADMIN_EMAIL) {
    throw new Error(
      `FATAL: SUPERADMIN_EMAIL must be exactly ${CANONICAL_SUPERADMIN_EMAIL}`
    );
  }
  if (!password) {
    throw new Error("FATAL: SUPERADMIN_PASSWORD must be set");
  }

  return {
    email: resolvedEmail,
    password,
    mobile: mobile || DEFAULT_SUPERADMIN_MOBILE,
  };
}

export async function ensureCanonicalSuperAdmin(): Promise<void> {
  const config = getRequiredSuperAdminConfig();
  const canonicalUser = await storage.getUserByEmail(config.email);
  const allSuperAdmins = await storage.getUsersByRole("super_admin");
  const duplicateSuperAdmins = allSuperAdmins.filter(
    (user) => (user.email || "").toLowerCase().trim() !== config.email
  );

  for (const duplicate of duplicateSuperAdmins) {
    await storage.updateUser(duplicate.id, { role: "admin" });
    try {
      await storage.createAuditLog({
        userId: duplicate.id,
        action: "SUPERADMIN_DEMOTED",
        details: `Duplicate super admin identity demoted to admin during canonical auth cleanup: ${duplicate.email || duplicate.id}`,
      });
    } catch (auditErr) {
      console.warn("[SuperAdmin] Failed to audit duplicate demotion:", auditErr);
    }
  }

  if (!canonicalUser) {
    const passwordHash = await bcrypt.hash(config.password, 12);
    await storage.createUser({
      name: "Super Admin",
      mobile: config.mobile,
      email: config.email,
      passwordHash,
      role: "super_admin",
      emailVerified: true,
      employeeId: "SAD00001",
      isBlocked: false,
    });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (canonicalUser.role !== "super_admin") {
    updates.role = "super_admin";
  }
  if (canonicalUser.isBlocked) {
    updates.isBlocked = false;
  }
  if (!canonicalUser.passwordHash) {
    updates.passwordHash = await bcrypt.hash(config.password, 12);
  }
  if ((canonicalUser.email || "").toLowerCase().trim() !== config.email) {
    updates.email = config.email;
  }

  if (Object.keys(updates).length > 0) {
    await storage.updateUser(canonicalUser.id, updates);
  }
}
