import { pool } from "../../configs/db.config.js";

const create = async ({ userId, name, slug }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const organizationQuery = `
      INSERT INTO organizations (name, slug)
      VALUES ($1, $2)
      RETURNING id, name, slug, is_active, created_at, updated_at
    `;

    const { rows } = await client.query(organizationQuery, [name, slug]);

    const organization = rows[0];

    const memberQuery = `
      INSERT INTO organization_members
        (organization_id, user_id, is_owner)
      VALUES ($1, $2, $3)
    `;

    await client.query(memberQuery, [organization.id, userId, true]);

    await client.query("COMMIT");

    return organization || null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAll = async (userId) => {
  const query = `
    SELECT
      o.id,
      o.name,
      o.slug,
      o.is_active,
      o.created_at,
      o.updated_at
    FROM organizations o
    INNER JOIN organization_members om
      ON om.organization_id = o.id
    WHERE om.user_id = $1
      AND o.is_active = true
    ORDER BY o.created_at DESC
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
};

const findById = async ({ userId, organizationId }) => {
  const query = `
    SELECT 
        o.id,
        o.name,
        o.slug,
        o.is_active,
        o.created_at,
        o.updated_at
    FROM    
        organizations o
        INNER JOIN 
        organization_members om
    ON 
        om.organization_id = o.id
    WHERE 
        om.user_id = $1 AND o.id = $2
        AND o.is_active = true
                `;

  const { rows } = await pool.query(query, [userId, organizationId]);

  return rows[0] || null;
};

const updateById = async ({ userId, organizationId, name, slug, isActive }) => {
  const query = `
    UPDATE organizations o
    SET
      name = COALESCE($1, o.name),
      slug = COALESCE($2, o.slug),
      is_active = COALESCE($3, o.is_active),
      updated_at = CURRENT_TIMESTAMP
    FROM organization_members om
    WHERE
      om.organization_id = o.id
      AND om.user_id = $4
      AND om.is_owner = true
      AND o.id = $5
    RETURNING
      o.id,
      o.name,
      o.slug,
      o.is_active,
      o.created_at,
      o.updated_at
  `;

  const { rows } = await pool.query(query, [
    name ?? null,
    slug ?? null,
    isActive ?? null,
    userId,
    organizationId,
  ]);

  return rows[0] || null;
};

const deleteById = async ({ userId, organizationId }) => {
  const query = `
    UPDATE organizations o
    SET is_active = false
    FROM organization_members om
    WHERE
      om.is_owner = true
      AND om.organization_id = o.id
      AND om.user_id = $1
      AND o.id = $2
    RETURNING
      o.id,
      o.name,
      o.slug,
      o.is_active,
      o.created_at,
      o.updated_at
  `;

  const { rows } = await pool.query(query, [userId, organizationId]);

  return rows[0] || null;
};

const getInactiveOrganizations = async (userId) => {
  const query = `
    SELECT
      o.id,
      o.name,
      o.slug,
      o.is_active,
      o.created_at,
      o.updated_at
    FROM organizations o
    INNER JOIN organization_members om
      ON om.organization_id = o.id
    WHERE
      om.user_id = $1
      AND om.is_owner = true
      AND o.is_active = false
    ORDER BY o.updated_at DESC
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
};

const restoreById = async ({ userId, organizationId }) => {
  const query = `
    UPDATE organizations o
    SET
      is_active = true,
      updated_at = CURRENT_TIMESTAMP
    FROM organization_members om
    WHERE
      om.organization_id = o.id
      AND om.user_id = $1
      AND om.is_owner = true
      AND o.id = $2
      AND o.is_active = false
    RETURNING
      o.id,
      o.name,
      o.slug,
      o.is_active,
      o.created_at,
      o.updated_at
  `;

  const { rows } = await pool.query(query, [userId, organizationId]);

  return rows[0] || null;
};

export const organizationRepository = {
  create,
  getAll,
  findById,
  updateById,
  deleteById,
  getInactiveOrganizations,
  restoreById,
};
