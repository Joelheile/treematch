// Production-grade validation utilities
import { z } from "zod";

// Referral code validation schema
export const referralCodeSchema = z
  .string()
  .min(8, "Referral code must be at least 8 characters")
  .max(50, "Referral code must be at most 50 characters")
  .regex(/^[A-Z0-9]+$/, "Referral code must contain only uppercase letters and numbers")
  .transform(code => code.toUpperCase().trim());

// Validate referral code safely
export function validateReferralCode(code: unknown): string | null {
  try {
    if (!code || typeof code !== 'string') return null;
    return referralCodeSchema.parse(code);
  } catch {
    return null;
  }
}

// UUID validation
export const uuidSchema = z.string().uuid();

export function validateUUID(id: unknown): string | null {
  try {
    if (!id || typeof id !== 'string') return null;
    return uuidSchema.parse(id);
  } catch {
    return null;
  }
}

// Safe URL parameter extraction
export function getSafeSearchParam(params: { [key: string]: string | string[] | undefined }, key: string): string | null {
  const value = params[key];
  if (!value || Array.isArray(value)) return null;
  return typeof value === 'string' ? value.trim() : null;
}