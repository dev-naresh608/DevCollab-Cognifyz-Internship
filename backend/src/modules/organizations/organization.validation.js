import { z } from "zod";

const uuidSchema = z.string().uuid("Invalid organization ID.");

const organizationNameSchema = z
  .string()
  .trim()
  .min(2, "Organization name must be at least 2 characters.")
  .max(100, "Organization name cannot exceed 100 characters.");

const organizationSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Organization slug must be at least 2 characters.")
  .max(120, "Organization slug cannot exceed 120 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug can only contain lowercase letters, numbers, and hyphens.",
  );

export const createOrganizationSchema = z.object({
  body: z.object({
    name: organizationNameSchema,
    slug: organizationSlugSchema,
  }),
});

export const getOrganizationsSchema = z.object({
  body: z.object({}).optional(),
});

export const getOrganizationByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const updateOrganizationByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),

  body: z
    .object({
      name: organizationNameSchema.optional(),
      slug: organizationSlugSchema.optional(),
    })
    .refine(
      (data) => data.name !== undefined || data.slug !== undefined,
      {
        message: "At least one field (name or slug) is required for update.",
      },
    ),
});

export const deleteOrganizationByIdSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

export const restoreOrganizationSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});