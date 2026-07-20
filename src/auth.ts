import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/admin";

const PLAN_REFRESH_MS = 5 * 60 * 1000;

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID?.trim() &&
    process.env.AUTH_GOOGLE_SECRET?.trim(),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
          }),
        ]
      : []),
    Credentials({
      id: "email-otp",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const code =
          typeof credentials?.code === "string" ? credentials.code : "";
        if (!email || !code) return null;
        const { verifyEmailOtp } = await import("@/lib/email-otp");
        return verifyEmailOtp(email, code);
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name ?? token.name;
        token.planCheckedAt = 0; // force refresh on sign-in
      }
      const email =
        (typeof token.email === "string" && token.email) ||
        (typeof user?.email === "string" ? user.email : null);
      token.isAdmin = isAdminEmail(email);

      const checkedAt =
        typeof token.planCheckedAt === "number" ? token.planCheckedAt : 0;
      if (email && Date.now() - checkedAt > PLAN_REFRESH_MS) {
        try {
          const { BillingService } = await import("@/lib/billing");
          const billing = await BillingService.ensureSubscription(email);
          token.planId = billing.planId;
          token.entitlements = billing.entitlements;
          token.planCheckedAt = Date.now();
        } catch {
          token.planId = token.planId ?? "free";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (typeof token.email === "string") {
          session.user.email = token.email;
        }
        if (typeof token.name === "string") {
          session.user.name = token.name;
        }
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.planId = token.planId ?? "free";
        session.user.entitlements = token.entitlements;
      }
      return session;
    },
  },
  trustHost: true,
});

export function getAuthProvidersStatus() {
  return {
    google: googleConfigured,
    email: true,
  };
}
