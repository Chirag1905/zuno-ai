import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },

  emailAndPassword: {
    enabled: true,
    async verify({ email, password }) {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) return null;

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
  },
  trustedOrigins: ['http://localhost:3001'],

});