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

    return organization;
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
    ORDER BY o.created_at DESC
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
};
const findById = async ({ userId, organizationId }) => {
  // TODO:
  // Get organization only if the user belongs to it
};

const updateById = async ({ userId, organizationId, name, slug }) => {
  // TODO:
  // Update organization only if user has permission
};

const deleteById = async ({ userId, organizationId }) => {
  // TODO:
  // Delete/deactivate organization only if user has permission
};

export const organizationRepository = {
  create,
  getAll,
  findById,
  updateById,
  deleteById,
};
