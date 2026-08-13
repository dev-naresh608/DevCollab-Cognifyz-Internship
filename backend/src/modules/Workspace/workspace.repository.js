import { pool } from "../../configs/db.config.js";

const create = async ({ userId, organizationId, name, slug }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const workspaceQuery = `
      INSERT INTO workspaces (
        organization_id,
        name,
        slug
      )
      SELECT
        om.organization_id,
        $2,
        $3
      FROM organization_members om
      WHERE
        om.organization_id = $1
        AND om.user_id = $4
        AND om.is_owner = true
      RETURNING
        id,
        organization_id,
        name,
        slug,
        is_active,
        created_at,
        updated_at
    `;

    const { rows } = await client.query(workspaceQuery, [
      organizationId,
      name,
      slug,
      userId,
    ]);

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const workspace = rows[0];

    const workspaceMemberQuery = `
      INSERT INTO workspace_members (
        workspace_id,
        user_id
      )
      VALUES ($1, $2)
    `;

    await client.query(workspaceMemberQuery, [workspace.id, userId]);

    await client.query("COMMIT");

    return workspace;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getAll = async ({ userId, organizationId }) => {
  // TODO:
  // Get active workspaces belonging to the organization
  // only if the user is a member of that organization.
};

const findById = async ({ userId, workspaceId }) => {
  // TODO:
  // Get the workspace only if:
  // 1. Workspace exists
  // 2. Workspace is active
  // 3. Workspace belongs to an organization
  // 4. User is a member of that organization
};

const updateById = async ({ userId, workspaceId, name, slug }) => {
  // TODO:
  // Update workspace only if:
  // 1. Workspace belongs to the organization
  // 2. User is the organization owner
};

const deleteById = async ({ userId, workspaceId }) => {
  // TODO:
  // Soft-delete workspace by setting is_active = false
  // Only organization owner can deactivate it.
};

const getInactive = async ({ userId, organizationId }) => {
  // TODO:
  // Get inactive workspaces for this organization
  // only if the user is the organization owner.
};

const restoreById = async ({ userId, workspaceId }) => {
  // TODO:
  // Restore workspace by setting is_active = true
  // only if the user is the organization owner.
};

export const workspaceRepository = {
  create,
  getAll,
  findById,
  updateById,
  deleteById,
  getInactive,
  restoreById,
};
