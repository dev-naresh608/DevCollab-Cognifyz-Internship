import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password cannot exceed 100 characters."),
  }),
});