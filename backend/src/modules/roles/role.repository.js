import { pool } from "../../configs/db.config.js";

const create = async ({ workspaceId, name, description }) => {
  const query = `
    INSERT INTO roles (workspace_id, name, description)
    VALUES ($1, $2, $3)
    RETURNING id, workspace_id, name, description, created_at, updated_at
  `;

  const { rows } = await pool.query(query, [
    workspaceId,
    name,
    description ?? null,
  ]);

  return rows[0];
};

const getAll = async (workspaceId) => {
  const query = `
    SELECT id, workspace_id, name, description, created_at, updated_at
    FROM roles
    WHERE workspace_id = $1
    ORDER BY created_at ASC
  `;

  const { rows } = await pool.query(query, [workspaceId]);
  return rows;
};

const findById = async ({ workspaceId, roleId }) => {
  const query = `
    SELECT id, workspace_id, name, description, created_at, updated_at
    FROM roles
    WHERE id = $1 AND workspace_id = $2
  `;

  const { rows } = await pool.query(query, [roleId, workspaceId]);
  return rows[0] || null;
};

const update = async ({ workspaceId, roleId, name, description }) => {
  const query = `
    UPDATE roles
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3 AND workspace_id = $4
    RETURNING id, workspace_id, name, description, created_at, updated_at
  `;

  const { rows } = await pool.query(query, [
    name ?? null,
    description !== undefined ? description : null,
    roleId,
    workspaceId,
  ]);

  return rows[0] || null;
};

const deleteRole = async ({ workspaceId, roleId }) => {
  const query = `
    DELETE FROM roles
    WHERE id = $1 AND workspace_id = $2
    RETURNING id, workspace_id, name
  `;

  const { rows } = await pool.query(query, [roleId, workspaceId]);
  return rows[0] || null;
};

const getRolePermissions = async ({ workspaceId, roleId }) => {
  const query = `
    SELECT p.id, p.name, p.description, p.created_at
    FROM permissions p
    INNER JOIN role_permissions rp ON rp.permission_id = p.id
    INNER JOIN roles r ON r.id = rp.role_id
    WHERE r.id = $1 AND r.workspace_id = $2
    ORDER BY p.name ASC
  `;

  const { rows } = await pool.query(query, [roleId, workspaceId]);
  return rows;
};

const updateRolePermissions = async ({ workspaceId, roleId, permissionIds }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Verify role exists in the target workspace
    const roleCheck = await client.query(
      `SELECT id FROM roles WHERE id = $1 AND workspace_id = $2`,
      [roleId, workspaceId],
    );

    if (roleCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, code: "ROLE_NOT_FOUND", message: "Role not found in this workspace." };
    }

    // Verify all permission IDs exist in system
    if (permissionIds.length > 0) {
      const permCheck = await client.query(
        `SELECT id FROM permissions WHERE id = ANY($1::uuid[])`,
        [permissionIds],
      );

      if (permCheck.rows.length !== permissionIds.length) {
        await client.query("ROLLBACK");
        return { success: false, code: "INVALID_PERMISSIONS", message: "One or more permission IDs are invalid." };
      }
    }

    // Clear existing permissions for this role
    await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);

    // Insert new permissions atomically
    if (permissionIds.length > 0) {
      const insertQuery = `
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT $1, unnest($2::uuid[])
      `;
      await client.query(insertQuery, [roleId, permissionIds]);
    }

    await client.query("COMMIT");

    // Fetch and return assigned permissions
    const { rows: updatedPermissions } = await client.query(
      `
      SELECT p.id, p.name, p.description, p.created_at
      FROM permissions p
      INNER JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = $1
      ORDER BY p.name ASC
      `,
      [roleId],
    );

    return { success: true, permissions: updatedPermissions };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const roleRepository = {
  create,
  getAll,
  findById,
  update,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
};
