import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import { pool } from "../src/configs/db.config.js";
import { env } from "../src/configs/env.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetAndSeedDatabase() {
  console.log("--------------------------------------------------");
  console.log("Starting Development Database Reset & Seeding...");
  console.log("--------------------------------------------------");

  // 1. Safety Guard Check
  if (env.NODE_ENV === "production") {
    console.error("❌ ERROR: Database reset cannot be executed in production environment!");
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    // 2. Drop existing tables in cascading order
    console.log("🔥 Dropping existing database schema...");
    const dropTablesQuery = `
      DROP TABLE IF EXISTS platform_admins, role_permissions, roles, workspace_members, workspaces, organization_members, organizations, permissions, users CASCADE;
    `;
    await client.query(dropTablesQuery);
    console.log("✅ Existing database schema dropped.");

    // 3. Read and execute all SQL migration files in sequence
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = [
      "001_create_users.sql",
      "002_create_organization.sql",
      "003_create_organization_members.sql",
      "004_create_workspaces.sql",
      "005_create_workspace_members.sql",
      "006_create_roles.sql",
      "007_create_permissions.sql",
      "008_create_role_permissions.sql",
      "009_seed_permissions.sql",
      "010_add_role_id_to_workspace_members.sql",
      "011_create_platform_admins.sql",
    ];

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      if (fs.existsSync(filePath)) {
        console.log(`🚀 Executing migration: ${file}...`);
        const sql = fs.readFileSync(filePath, "utf8");
        await client.query(sql);
      } else {
        console.warn(`⚠️ Warning: Migration file ${file} not found.`);
      }
    }
    console.log("✅ All migrations executed successfully.");

    // 4. Seed Initial Development Organization & Owner Account
    console.log("🌱 Seeding initial development organization & owner account...");

    // 4a. Create Development Organization Owner User (org1admin@gmail.com)
    const passwordHash = await bcrypt.hash("password123", 12);
    const createUserQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        username,
        email,
        password_hash,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, first_name, last_name, username, email
    `;
    const userValues = [
      "Organization",
      "Admin",
      "org1admin",
      "org1admin@gmail.com",
      passwordHash,
    ];
    const userRes = await client.query(createUserQuery, userValues);
    const orgOwner = userRes.rows[0];

    // 4b. Create Development Organization (Organization 1)
    const createOrgQuery = `
      INSERT INTO organizations (
        name,
        slug,
        is_active
      )
      VALUES ($1, $2, true)
      RETURNING id, name, slug
    `;
    const orgRes = await client.query(createOrgQuery, [
      "Organization 1",
      "organization-1",
    ]);
    const organization = orgRes.rows[0];

    // 4c. Add Creator as Organization Owner in organization_members
    const createOrgMemberQuery = `
      INSERT INTO organization_members (
        organization_id,
        user_id,
        is_owner
      )
      VALUES ($1, $2, true)
      RETURNING id, organization_id, user_id, is_owner
    `;
    await client.query(createOrgMemberQuery, [organization.id, orgOwner.id]);

    console.log("--------------------------------------------------");
    console.log("🎉 DEVELOPMENT DATABASE RESET & SEED COMPLETE!");
    console.log("--------------------------------------------------");
    console.log("Organization Name: ", organization.name);
    console.log("Organization Slug: ", organization.slug);
    console.log("Owner Email:       ", orgOwner.email);
    console.log("Owner Password:    ", "password123");
    console.log("Owner Role:        ", "Organization Owner (is_owner = true)");
    console.log("--------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR resetting and seeding database:", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

resetAndSeedDatabase();
