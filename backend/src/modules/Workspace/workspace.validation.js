import { z } from "zod";

const workspaceNameSchema = z
  .string()
  .trim()
  .min(2, "Workspace name must be at least 2 characters.")
  .max(100, "Workspace name cannot exceed 100 characters.");

const workspaceSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Workspace slug must be at least 2 characters.")
  .max(120, "Workspace slug cannot exceed 120 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Workspace slug can only contain lowercase letters, numbers, and hyphens.",
  );

const workspaceIdSchema = z
  .string()
  .uuid("Invalid workspace ID.");

const organizationIdSchema = z
  .string()
  .uuid("Invalid organization ID.");

export const createWorkspaceSchema = z.object({
  body: z.object({
    organizationId: organizationIdSchema,
    name: workspaceNameSchema,
    slug: workspaceSlugSchema,
  }),
});

export const getWorkspacesSchema = z.object({
  query: z.object({
    organizationId: organizationIdSchema,
  }),
});

export const getWorkspaceByIdSchema = z.object({
  params: z.object({
    id: workspaceIdSchema,
  }),
});

export const updateWorkspaceByIdSchema = z.object({
  params: z.object({
    id: workspaceIdSchema,
  }),

  body: z
    .object({
      name: workspaceNameSchema.optional(),
      slug: workspaceSlugSchema.optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.slug !== undefined,
      {
        message: "At least one field is required for update.",
      },
    ),
});

export const deleteWorkspaceByIdSchema = z.object({
  params: z.object({
    id: workspaceIdSchema,
  }),
});

export const getInactiveWorkspacesSchema = z.object({
  query: z.object({
    organizationId: organizationIdSchema,
  }),
});

export const restoreWorkspaceSchema = z.object({
  params: z.object({
    id: workspaceIdSchema,
  }),
});