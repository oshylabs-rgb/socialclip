import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  varchar,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  url: text("url"),
  brandData: jsonb("brand_data"),
  status: varchar("status", { length: 32 }).default("idle").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scenes = pgTable("scenes", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  orderIndex: integer("order_index").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  script: text("script").notNull(),
  duration: integer("duration").notNull(),
  visualDescription: text("visual_description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedAssets = pgTable("generated_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  format: varchar("format", { length: 32 }).notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  previewUrl: text("preview_url"),
  downloadUrl: text("download_url"),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const renderJobs = pgTable("render_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => generatedAssets.id, { onDelete: "cascade" })
    .notNull(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  status: varchar("status", { length: 32 }).default("queued").notNull(),
  progress: integer("progress").default(0),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
