import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    RESEND_API_KEY: z.string().min(1),
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
    APP_BASE_URL: z.string().url(),
    SUPPORT_EMAIL: z.string().email().default("support@easybaby.io"),
    RESERVATION_PENDING_TTL_MIN: z.coerce.number().default(10),
    DEPOSIT_AUTH_DAYS: z.coerce.number().default(7),
  },
  client: {
    NEXT_PUBLIC_DEFAULT_CITY_SLUG: z.string().default("paris"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    APP_BASE_URL: process.env.APP_BASE_URL,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
    RESERVATION_PENDING_TTL_MIN: process.env.RESERVATION_PENDING_TTL_MIN,
    DEPOSIT_AUTH_DAYS: process.env.DEPOSIT_AUTH_DAYS,
    NEXT_PUBLIC_DEFAULT_CITY_SLUG: process.env.NEXT_PUBLIC_DEFAULT_CITY_SLUG,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
