import { z } from "zod";

export const bootstrapAdminSchema = z.object({
  headers: z.object({
    "x-platform-bootstrap-secret": z
      .string({ required_error: "X-Platform-Bootstrap-Secret header is required." })
      .min(1, "X-Platform-Bootstrap-Secret header cannot be empty."),
  }).passthrough(),

  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(50, "First name cannot exceed 50 characters."),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .max(50, "Last name cannot exceed 50 characters."),

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
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password cannot exceed 100 characters."),
  }),
});

export const createPlatformAdminOrgSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Organization name must be at least 2 characters.")
      .max(100, "Organization name cannot exceed 100 characters."),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "Organization slug must be at least 2 characters.")
      .max(120, "Organization slug cannot exceed 120 characters.")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Organization slug can only contain lowercase letters, numbers, and hyphens.",
      ),

    owner: z.object({
      firstName: z
        .string()
        .trim()
        .min(2, "First name must be at least 2 characters.")
        .max(50, "First name cannot exceed 50 characters."),

      lastName: z
        .string()
        .trim()
        .min(2, "Last name must be at least 2 characters.")
        .max(50, "Last name cannot exceed 50 characters."),

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
        .min(8, "Password must be at least 8 characters.")
        .max(100, "Password cannot exceed 100 characters."),
    }),
  }),
});
