import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { SECURITY_CONFIG } from "@/lib/constants";
import { sendOtpEmail } from "@/lib/mail";

export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.BETTER_AUTH_URL,
  trustedOrigins: ["http://localhost:3000"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    passkey(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type: _type }) {
        await sendOtpEmail(email, otp);
      },
      otpLength: SECURITY_CONFIG.otp.length,
      expiresIn: SECURITY_CONFIG.otp.expiresIn,
    }),
  ],
  rateLimit: {
    window: 60,
    max: 1000,
    customRules: {
      "/sign-up/email": { window: 60, max: 1000 },
      "/sign-in/email": { window: 60, max: 1000 },
    },
  },
});
