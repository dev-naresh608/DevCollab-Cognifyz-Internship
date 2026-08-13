import { pool } from "../../configs/db.config.js";

const createAndAddMember = async ({
  workspaceId,
  firstName,
  lastName,
  username,
  email,
  passwordHash,
  roleId,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify workspace exists & get parent organization_id
    const wsQuery = `SELECT organization_id FROM workspaces WHERE id = $1`;
    const wsRes = await client.query(wsQuery, [workspaceId]);
    if (wsRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return { success: false, code: "WORKSPACE_NOT_FOUND", message: "Workspace not found." };
    }
    const organizationId = wsRes.rows[0].organization_id;

    // 2. Verify selected role belongs to the workspace
    const roleQuery = `SELECT id FROM roles WHERE id = $1 AND workspace_id = $2`;
    const roleRes = await client.query(roleQuery, [roleId, workspaceId]);
    if (roleRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        code: "INVALID_ROLE",
        message: "Role does not exist or does not belong to this workspace.",
      };
    }

    // 3. Verify email or username is not already registered
    const dupCheckQuery = `SELECT id FROM users WHERE email = $1 OR username = $2`;
    const dupCheckRes = await client.query(dupCheckQuery, [email, username]);
    if (dupCheckRes.rows.length > 0) {
      await client.query("ROLLBACK");
      return {
        success: false,
        code: "DUPLICATE_USER",
        message: "A user with this email address or username already exists.",
      };
    }

    // 4. Create user in users table
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
      firstName,
      lastName,
      username,
      email,
      passwordHash,
    ]);
    const user = userRes.rows[0];

    // 5. Create organization membership (is_owner = false)
    const createOrgMemberQuery = `
      INSERT INTO organization_members (organization_id, user_id, is_owner)
      VALUES ($1, $2, false)
    `;
    await client.query(createOrgMemberQuery, [organizationId, user.id]);

    // 6. Create workspace membership with role_id
    const createWsMemberQuery = `
      INSERT INTO workspace_members (workspace_id, user_id, role_id)
      VALUES ($1, $2, $3)
      RETURNING id, workspace_id, user_id, role_id, joined_at
    `;
    const wsMemberRes = await client.query(createWsMemberQuery, [
      workspaceId,
      user.id,
      roleId,
    ]);
    const member = wsMemberRes.rows[0];

    await client.query("COMMIT");

    return {
      success: true,
      member: {
        ...member,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const addExistingMemberByEmail = async ({ workspaceId, email, roleId }) => {
  // 1. Verify workspace exists & get parent organization_id
  const wsQuery = `SELECT organization_id FROM workspaces WHERE id = $1`;
  const wsRes = await pool.query(wsQuery, [workspaceId]);
  if (wsRes.rows.length === 0) {
    return { success: false, code: "WORKSPACE_NOT_FOUND", message: "Workspace not found." };
  }
  const organizationId = wsRes.rows[0].organization_id;

  // 2. Verify selected role belongs to the workspace
  const roleQuery = `SELECT id FROM roles WHERE id = $1 AND workspace_id = $2`;
  const roleRes = await pool.query(roleQuery, [roleId, workspaceId]);
  if (roleRes.rows.length === 0) {
    return {
      success: false,
      code: "INVALID_ROLE",
      message: "Role does not exist or does not belong to this workspace.",
    };
  }

  // 3. Find user by email
  const userQuery = `SELECT id, first_name, last_name, username, email FROM users WHERE email = $1 AND is_active = true`;
  const userRes = await pool.query(userQuery, [email]);
  if (userRes.rows.length === 0) {
    return {
      success: false,
      code: "USER_NOT_FOUND",
      message: "No active user found with this email address.",
    };
  }
  const user = userRes.rows[0];

  // 4. Verify user belongs to parent organization
  const orgMemberQuery = `
    SELECT id FROM organization_members
    WHERE organization_id = $1 AND user_id = $2
  `;
  const orgMemberRes = await pool.query(orgMemberQuery, [organizationId, user.id]);
  if (orgMemberRes.rows.length === 0) {
    return {
      success: false,
      code: "NOT_ORG_MEMBER",
      message: "User does not belong to this organization.",
    };
  }

  // 5. Verify user is not already in workspace
  const existingWsMember = await pool.query(
    `SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
    [workspaceId, user.id]
  );
  if (existingWsMember.rows.length > 0) {
    return {
      success: false,
      code: "ALREADY_MEMBER",
      message: "User is already a member of this workspace.",
    };
  }

  // 6. Insert workspace_members
  const insertQuery = `
    INSERT INTO workspace_members (workspace_id, user_id, role_id)
    VALUES ($1, $2, $3)
    RETURNING id, workspace_id, user_id, role_id, joined_at
  `;
  const { rows } = await pool.query(insertQuery, [workspaceId, user.id, roleId]);

  return {
    success: true,
    member: {
      ...rows[0],
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
    },
  };
};

const getMembers = async (workspaceId) => {
  const query = `
    SELECT
      wm.id,
      wm.workspace_id,
      wm.user_id,
      wm.role_id,
      wm.joined_at,
      u.first_name,
      u.last_name,
      u.username,
      u.email,
      r.name as role_name,
      r.description as role_description,
      CASE WHEN om.is_owner IS TRUE THEN true ELSE false END AS is_owner
    FROM workspace_members wm
    INNER JOIN users u ON u.id = wm.user_id
    LEFT JOIN roles r ON r.id = wm.role_id
    LEFT JOIN workspaces w ON w.id = wm.workspace_id
    LEFT JOIN organization_members om ON om.organization_id = w.organization_id AND om.user_id = wm.user_id
    WHERE wm.workspace_id = $1
    ORDER BY wm.joined_at ASC
  `;

  const { rows } = await pool.query(query, [workspaceId]);
  return rows;
};

const updateMemberRole = async ({ workspaceId, userId, roleId }) => {
  // Check if target user is Organization Owner
  const orgOwnerCheck = await pool.query(
    `SELECT om.is_owner
     FROM organization_members om
     INNER JOIN workspaces w ON w.organization_id = om.organization_id
     WHERE w.id = $1 AND om.user_id = $2`,
    [workspaceId, userId]
  );

  if (orgOwnerCheck.rows.length > 0 && orgOwnerCheck.rows[0].is_owner) {
    return {
      success: false,
      code: "PROTECTED_MEMBER",
      message: "The Organization Owner role is system-protected and cannot be modified.",
    };
  }

  // Verify role belongs to the workspace
  const roleQuery = `SELECT id FROM roles WHERE id = $1 AND workspace_id = $2`;
  const roleRes = await pool.query(roleQuery, [roleId, workspaceId]);
  if (roleRes.rows.length === 0) {
    return {
      success: false,
      code: "INVALID_ROLE",
      message: "Role does not exist or does not belong to this workspace.",
    };
  }

  const query = `
    UPDATE workspace_members
    SET role_id = $1
    WHERE workspace_id = $2 AND user_id = $3
    RETURNING id, workspace_id, user_id, role_id, joined_at
  `;

  const { rows } = await pool.query(query, [roleId, workspaceId, userId]);

  if (rows.length === 0) {
    return {
      success: false,
      code: "MEMBER_NOT_FOUND",
      message: "Member not found in this workspace.",
    };
  }

  return { success: true, member: rows[0] };
};

const removeMember = async ({ workspaceId, userId }) => {
  // Check if target user is Organization Owner
  const orgOwnerCheck = await pool.query(
    `SELECT om.is_owner
     FROM organization_members om
     INNER JOIN workspaces w ON w.organization_id = om.organization_id
     WHERE w.id = $1 AND om.user_id = $2`,
    [workspaceId, userId]
  );

  if (orgOwnerCheck.rows.length > 0 && orgOwnerCheck.rows[0].is_owner) {
    return {
      success: false,
      code: "PROTECTED_MEMBER",
      message: "The Organization Owner cannot be removed from workspace members.",
    };
  }

  const query = `
    DELETE FROM workspace_members
    WHERE workspace_id = $1 AND user_id = $2
    RETURNING id, workspace_id, user_id
  `;

  const { rows } = await pool.query(query, [workspaceId, userId]);

  if (rows.length === 0) {
    return {
      success: false,
      code: "MEMBER_NOT_FOUND",
      message: "Member not found in this workspace.",
    };
  }

  return { success: true, member: rows[0] };
};

export const workspaceMemberRepository = {
  createAndAddMember,
  addExistingMemberByEmail,
  getMembers,
  updateMemberRole,
  removeMember,
};
