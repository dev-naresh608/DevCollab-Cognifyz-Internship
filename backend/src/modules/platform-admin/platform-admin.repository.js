import bcrypt from "bcrypt";
import { pool } from "../../configs/db.config.js";

const getAdminCount = async () => {
  const query = `SELECT COUNT(*) AS count FROM platform_admins`;
  const { rows } = await pool.query(query);
  return parseInt(rows[0].count, 10);
};

const isPlatformAdmin = async (userId) => {
  const query = `SELECT id FROM platform_admins WHERE user_id = $1`;
  const { rows } = await pool.query(query, [userId]);
  return rows.length > 0;
};

const bootstrapFirstAdmin = async ({
  firstName,
  lastName,
  username,
  email,
  passwordHash,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Double-check inside transaction that no platform admin exists
    const checkQuery = `SELECT COUNT(*) AS count FROM platform_admins`;
    const checkRes = await client.query(checkQuery);
    const adminCount = parseInt(checkRes.rows[0].count, 10);

    if (adminCount > 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        code: "ADMIN_EXISTS",
        message: "Platform admin setup has already been completed.",
      };
    }

    // 2. Insert user into users table
    const userQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        username,
        email,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, username, email, is_active, created_at, updated_at
    `;

    const userValues = [firstName, lastName, username, email, passwordHash];
    const userRes = await client.query(userQuery, userValues);
    const user = userRes.rows[0];

    // 3. Insert into platform_admins table
    const adminQuery = `
      INSERT INTO platform_admins (user_id)
      VALUES ($1)
      RETURNING id, user_id, created_at
    `;
    const adminRes = await client.query(adminQuery, [user.id]);
    const platformAdmin = adminRes.rows[0];

    await client.query("COMMIT");

    return {
      success: true,
      user,
      platformAdmin,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const createOrganizationAndOwner = async ({ name, slug, owner }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify slug is unique
    const slugCheck = await client.query(
      `SELECT id FROM organizations WHERE slug = $1`,
      [slug]
    );
    if (slugCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        code: "DUPLICATE_SLUG",
        message: "An organization with this slug already exists.",
      };
    }

    // 2. Verify owner email & username are unique
    const userCheck = await client.query(
      `SELECT id FROM users WHERE email = $1 OR username = $2`,
      [owner.email, owner.username]
    );
    if (userCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        code: "DUPLICATE_USER",
        message: "A user with this email address or username already exists.",
      };
    }

    // 3. Hash owner password
    const passwordHash = await bcrypt.hash(owner.password, 12);

    // 4. Create owner user
    const createUserQuery = `
      INSERT INTO users (
        first_name,
        last_name,
        username,
        email,
        password_hash
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, first_name, last_name, username, email, is_active, created_at
    `;
    const userRes = await client.query(createUserQuery, [
      owner.firstName,
      owner.lastName,
      owner.username,
      owner.email,
      passwordHash,
    ]);
    const ownerUser = userRes.rows[0];

    // 5. Create organization
    const createOrgQuery = `
      INSERT INTO organizations (name, slug, is_active)
      VALUES ($1, $2, true)
      RETURNING id, name, slug, is_active, created_at
    `;
    const orgRes = await client.query(createOrgQuery, [name, slug]);
    const organization = orgRes.rows[0];

    // 6. Create organization membership (is_owner = true)
    const createOrgMemberQuery = `
      INSERT INTO organization_members (organization_id, user_id, is_owner)
      VALUES ($1, $2, true)
    `;
    await client.query(createOrgMemberQuery, [organization.id, ownerUser.id]);

    await client.query("COMMIT");

    return {
      success: true,
      organization,
      owner: ownerUser,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAllUsers = async () => {
  const query = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.username,
      u.email,
      u.is_active,
      u.created_at,
      CASE WHEN pa.id IS NOT NULL THEN true ELSE false END AS is_platform_admin
    FROM users u
    LEFT JOIN platform_admins pa ON pa.user_id = u.id
    ORDER BY u.created_at DESC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

const getAllOrganizations = async () => {
  const query = `
    SELECT
      o.id,
      o.name,
      o.slug,
      o.is_active,
      o.created_at,
      COUNT(DISTINCT om.id) AS member_count,
      COUNT(DISTINCT w.id) AS workspace_count
    FROM organizations o
    LEFT JOIN organization_members om ON om.organization_id = o.id
    LEFT JOIN workspaces w ON w.organization_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

export const platformAdminRepository = {
  getAdminCount,
  isPlatformAdmin,
  bootstrapFirstAdmin,
  createOrganizationAndOwner,
  getAllUsers,
  getAllOrganizations,
};
