import { z } from "zod";

export const registerSchema = z
  .object({
    body: z.object({
      fullName: z
        .string()
        .trim()
        .min(3, "Full name must be at least 3 characters.")
        .max(50, "Full name cannot exceed 50 characters."),

      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .max(30, "Username cannot exceed 30 characters.")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "Username can only contain letters, numbers, and underscores.",
        ),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please enter a valid email address."),

      password: z
        .string()
        .min(2, "Password must be at least 2 characters.")
        .max(100, "Password cannot exceed 100 characters."),

      confirmPassword: z.string(),

      terms: z.literal("on"),
    }),
  })
  .refine((data) => data.body.password === data.body.confirmPassword, {
    path: ["body", "confirmPassword"],
    message: "Passwords do not match.",
  });

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address."),

    password: z
      .string()
      .min(2, "Password must be at least 2 characters.")
      .max(100, "Password cannot exceed 100 characters."),
  }),
});
