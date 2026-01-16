import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  trustedOrigins: ['http://localhost:3000'],

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    async verify({ email, password }) {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.password) return null;
      if (!user.emailVerified) {
        throw new Error("EMAIL_NOT_VERIFIED");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;


      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },

    async hashPassword(password) {
      return bcrypt.hash(password, 10);
    },
  },

  emailVerification: {
    async send({ user, url }) {
      await sendMail({
        to: user.email,
        subject: "Verify your email",
        html: `
        <p>Click below to verify your email</p>
        <a href="${url}">Verify Email</a>
      `,
      });
    },
  },

  passwordReset: {
    async send({ user, url }) {
      await sendMail({
        to: user.email,
        subject: "Reset your password",
        html: `
        <p>Reset your password</p>
        <a href="${url}">Reset Password</a>
      `,
      });
    },
  },

  /* ---------------- SOCIAL PROVIDERS (CORRECT) ---------------- */
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account consent",
      accessType: "offline",
    },

    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  callbacks: {
    session({ session, user }) {
      session.user.role = user.role;
      return session;
    },
  },
});