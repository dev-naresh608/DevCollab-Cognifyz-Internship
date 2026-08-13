import { pool } from "../../configs/db.config.js";

const create = async ({ userId, organizationId, name, slug }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify authenticated user is owner of the organization
    const orgCheckQuery = `
      SELECT id FROM organization_members
      WHERE organization_id = $1
        AND user_id = $2
        AND is_owner = true
    `;
    const orgCheckRes = await client.query(orgCheckQuery, [organizationId, userId]);

    if (orgCheckRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // 2. Insert workspace
    const workspaceQuery = `
      INSERT INTO workspaces (organization_id, name, slug)
      VALUES ($1, $2, $3)
      RETURNING id, organization_id, name, slug, is_active, created_at, updated_at
    `;
    const wsRes = await client.query(workspaceQuery, [organizationId, name, slug]);
    const workspace = wsRes.rows[0];

    // 3. Create a default workspace role named "Admin"
    const roleQuery = `
      INSERT INTO roles (workspace_id, name, description)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const roleRes = await client.query(roleQuery, [
      workspace.id,
      "Admin",
      "Workspace Administrator",
    ]);
    const adminRoleId = roleRes.rows[0].id;

    // 4. Assign all available system permissions to the Admin role
    const assignPermsQuery = `
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT $1, id FROM permissions
    `;
    await client.query(assignPermsQuery, [adminRoleId]);

    // 5. Add creator to workspace_members with role_id set to Admin role
    const memberQuery = `
      INSERT INTO workspace_members (workspace_id, user_id, role_id)
      VALUES ($1, $2, $3)
    `;
    await client.query(memberQuery, [workspace.id, userId, adminRoleId]);

    // 6. COMMIT transaction
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
  const query = `
    SELECT
      w.id,
      w.organization_id,
      w.name,
      w.slug,
      w.is_active,
      w.created_at,
      w.updated_at
    FROM workspaces w
    INNER JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.organization_id = $1
      AND wm.user_id = $2
      AND w.is_active = true
    ORDER BY w.created_at DESC
  `;

  const { rows } = await pool.query(query, [organizationId, userId]);
  return rows;
};

const findById = async ({ userId, workspaceId }) => {
  const query = `
    SELECT
      w.id,
      w.organization_id,
      w.name,
      w.slug,
      w.is_active,
      w.created_at,
      w.updated_at
    FROM workspaces w
    INNER JOIN workspace_members wm ON wm.workspace_id = w.id
    WHERE w.id = $1
      AND wm.user_id = $2
      AND w.is_active = true
  `;

  const { rows } = await pool.query(query, [workspaceId, userId]);
  return rows[0] || null;
};

const updateById = async ({ userId, workspaceId, name, slug }) => {
  const query = `
    UPDATE workspaces
    SET
      name = COALESCE($1, name),
      slug = COALESCE($2, slug),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND is_active = true
    RETURNING
      id,
      organization_id,
      name,
      slug,
      is_active,
      created_at,
      updated_at
  `;

  const { rows } = await pool.query(query, [
    name ?? null,
    slug ?? null,
    workspaceId,
  ]);

  return rows[0] || null;
};

const deleteById = async ({ userId, workspaceId }) => {
  const query = `
    UPDATE workspaces
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_active = true
    RETURNING
      id,
      organization_id,
      name,
      slug,
      is_active,
      created_at,
      updated_at
  `;

  const { rows } = await pool.query(query, [workspaceId]);
  return rows[0] || null;
};

const getInactive = async ({ userId, organizationId }) => {
  const query = `
    SELECT
      w.id,
      w.organization_id,
      w.name,
      w.slug,
      w.is_active,
      w.created_at,
      w.updated_at
    FROM workspaces w
    INNER JOIN organization_members om ON om.organization_id = w.organization_id
    WHERE w.organization_id = $1
      AND om.user_id = $2
      AND w.is_active = false
    ORDER BY w.updated_at DESC
  `;

  const { rows } = await pool.query(query, [organizationId, userId]);
  return rows;
};

const restoreById = async ({ userId, workspaceId }) => {
  const query = `
    UPDATE workspaces
    SET is_active = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND is_active = false
    RETURNING
      id,
      organization_id,
      name,
      slug,
      is_active,
      created_at,
      updated_at
  `;

  const { rows } = await pool.query(query, [workspaceId]);
  return rows[0] || null;
};

const getMyAccess = async ({ userId, workspaceId }) => {
  const query = `
    SELECT
      wm.user_id,
      wm.workspace_id,
      r.id AS role_id,
      r.name AS role_name,
      r.description AS role_description,
      p.name AS permission_name
    FROM workspace_members wm
    INNER JOIN roles r ON r.id = wm.role_id
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    WHERE wm.workspace_id = $1
      AND wm.user_id = $2
  `;

  const { rows } = await pool.query(query, [workspaceId, userId]);

  if (rows.length === 0) {
    return null;
  }

  const permissions = rows
    .map((r) => r.permission_name)
    .filter((p) => p !== null);

  return {
    userId: rows[0].user_id,
    workspaceId: rows[0].workspace_id,
    role: {
      id: rows[0].role_id,
      name: rows[0].role_name,
      description: rows[0].role_description,
    },
    permissions: Array.from(new Set(permissions)),
  };
};

export const workspaceRepository = {
  create,
  getAll,
  findById,
  updateById,
  deleteById,
  getInactive,
  restoreById,
  getMyAccess,
};
