-- 010_add_role_id_to_workspace_members.sql

ALTER TABLE workspace_members
ADD COLUMN IF NOT EXISTS role_id UUID
REFERENCES roles(id)
ON DELETE RESTRICT;

-- Add performance indexes if not already covered by existing unique constraints

-- organization_members(user_id, organization_id)
CREATE INDEX IF NOT EXISTS idx_organization_members_user_org
ON organization_members(user_id, organization_id);

-- workspace_members(user_id, workspace_id)
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_ws
ON workspace_members(user_id, workspace_id);

-- workspace_members(role_id)
CREATE INDEX IF NOT EXISTS idx_workspace_members_role_id
ON workspace_members(role_id);

-- roles(workspace_id)
CREATE INDEX IF NOT EXISTS idx_roles_workspace_id
ON roles(workspace_id);

-- role_permissions(permission_id, role_id)
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_role
ON role_permissions(permission_id, role_id);
