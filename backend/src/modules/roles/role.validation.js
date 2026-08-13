import { z } from "zod";

const workspaceIdSchema = z.string().uuid("Invalid workspace ID.");
const roleIdSchema = z.string().uuid("Invalid role ID.");

const roleNameSchema = z
  .string()
  .trim()
  .min(1, "Role name is required.")
  .max(50, "Role name cannot exceed 50 characters.");

const roleDescriptionSchema = z
  .string()
  .trim()
  .max(255, "Description cannot exceed 255 characters.")
  .nullable()
  .optional();

export const createRoleSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
  }),
  body: z.object({
    name: roleNameSchema,
    description: roleDescriptionSchema,
  }),
});

export const getRolesSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
  }),
});

export const getRoleByIdSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
    roleId: roleIdSchema,
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
    roleId: roleIdSchema,
  }),
  body: z
    .object({
      name: roleNameSchema.optional(),
      description: roleDescriptionSchema,
    })
    .refine(
      (data) => data.name !== undefined || data.description !== undefined,
      {
        message: "At least one field (name or description) is required for update.",
      },
    ),
});

export const deleteRoleSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
    roleId: roleIdSchema,
  }),
});

export const getRolePermissionsSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
    roleId: roleIdSchema,
  }),
});

export const updateRolePermissionsSchema = z.object({
  params: z.object({
    workspaceId: workspaceIdSchema,
    roleId: roleIdSchema,
  }),
  body: z.object({
    permissionIds: z
      .array(z.string().uuid("Invalid permission ID."))
      .min(0, "permissionIds must be an array."),
  }),
});
