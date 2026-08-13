import { z } from "zod";

const workspaceIdSchema = z.string().uuid("Invalid workspace ID.");
const userIdSchema = z.string().uuid("Invalid user ID.");
const roleIdSchema = z.string().uuid("Invalid role ID.");

export const addWorkspaceMemberSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
  }),
  body: z.discriminatedUnion("isExisting", [
    // Create new member mode
    z.object({
      isExisting: z.literal(false).optional().default(false),
      firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
      lastName: z.string().trim().min(2, "Last name must be at least 2 characters."),
      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
      email: z.string().trim().toLowerCase().email("Valid email required."),
      password: z.string().min(8, "Password must be at least 8 characters."),
      roleId: roleIdSchema,
    }),
    // Add existing org member mode
    z.object({
      isExisting: z.literal(true),
      email: z.string().trim().toLowerCase().email("Valid email required."),
      roleId: roleIdSchema,
    }),
  ]).or(
    z.object({
      firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
      lastName: z.string().trim().min(2, "Last name must be at least 2 characters."),
      username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters.")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
      email: z.string().trim().toLowerCase().email("Valid email required."),
      password: z.string().min(8, "Password must be at least 8 characters."),
      roleId: roleIdSchema,
    })
  ).or(
    z.object({
      email: z.string().trim().toLowerCase().email("Valid email required."),
      roleId: roleIdSchema,
    })
  ),
});

export const getWorkspaceMembersSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
  }),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
    userId: userIdSchema,
  }),
  body: z.object({
    roleId: roleIdSchema,
  }),
});

export const removeWorkspaceMemberSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
    userId: userIdSchema,
  }),
});
