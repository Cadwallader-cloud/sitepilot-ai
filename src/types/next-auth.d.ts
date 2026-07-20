import type { PlanEntitlements, PlanId } from "@/lib/billing/types";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin?: boolean;
      planId?: PlanId;
      entitlements?: PlanEntitlements;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin?: boolean;
    planId?: PlanId;
    entitlements?: PlanEntitlements;
    planCheckedAt?: number;
  }
}
