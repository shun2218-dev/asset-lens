import { passkey } from "@better-auth/passkey";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { SECURITY_CONFIG } from "@/lib/constants";
import { sendOtpEmail } from "@/lib/email";

export const auth = betterAuth({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : process.env.BETTER_AUTH_URL,
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
});
