import { z } from "zod";
import { DifficultyLevel } from "../models/Destination.model";
import { PackageStatus } from "../models/Package.model";

const itinerarySchema = z.object({
  day: z.number().min(1, "Day must be at least 1"),
  title: z.string().min(3, "Title is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  accommodation: z.string().optional(),
  meals: z.string().optional(),
  distance: z.number().optional(),
});

const costSchema = z.object({
  transport: z.number().min(0).default(0),
  accommodation: z.number().min(0).default(0),
  meals: z.number().min(0).default(0),
  guide: z.number().min(0).default(0),
  permits: z.number().min(0).default(0),
  other: z.number().min(0).default(0),
});

export const createPackageSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .trim(),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .trim(),

  destination: z
    .string()
    .min(1, "Destination ID is required"),

  duration: z
    .number()
    .min(1, "Duration must be at least 1 day"),

  groupSize: z
    .object({
      min: z.number().min(1).default(1),
      max: z.number().min(1).default(12),
    })
    .optional()
    .default({ min: 1, max: 12 }),

  difficulty: z.enum(
    Object.values(DifficultyLevel) as [string, ...string[]]
  ),

  price: z.number().min(0, "Price must be positive"),

  costBreakdown: costSchema,

  itinerary: z
    .array(itinerarySchema)
    .min(1, "At least one day itinerary is required"),

  includes: z.array(z.string()).optional().default([]),

  excludes: z.array(z.string()).optional().default([]),

  status: z
    .enum(
      Object.values(PackageStatus) as [string, ...string[]]
    )
    .optional()
    .default(PackageStatus.DRAFT),

  isFeatured: z.boolean().optional().default(false),

  isBestSeller: z.boolean().optional().default(false),

  ecoScore: z
    .number()
    .min(0)
    .max(5)
    .optional()
    .default(0),
});

export const updatePackageSchema =
  createPackageSchema.partial();

// ── Zod v4 compatible query schema ───────────────────
export const packageQuerySchema = z.object({
  destination: z.string().optional(),

  difficulty: z
    .enum(
      Object.values(DifficultyLevel) as [string, ...string[]]
    )
    .optional(),

  minPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  maxPrice: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  duration: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),

  search: z.string().optional(),

  isFeatured: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  isBestSeller: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type PackageQuery = z.infer<typeof packageQuerySchema>;