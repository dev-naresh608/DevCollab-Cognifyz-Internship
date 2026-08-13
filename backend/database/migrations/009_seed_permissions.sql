-- 009_seed_permissions.sql

INSERT INTO permissions (name, description)
VALUES

    -- Workspace
    (
        'workspace:read',
        'View workspace information and resources'
    ),
    (
        'workspace:update',
        'Update workspace settings and details'
    ),
    (
        'workspace:delete',
        'Deactivate workspace'
    ),
    (
        'workspace:restore',
        'Restore a deactivated workspace'
    ),

    -- Workspace Members
    (
        'member:read',
        'View workspace members'
    ),
    (
        'member:invite',
        'Invite users to the workspace'
    ),
    (
        'member:update',
        'Update workspace member details or roles'
    ),
    (
        'member:remove',
        'Remove members from the workspace'
    ),

    -- Roles
    (
        'role:read',
        'View workspace roles'
    ),
    (
        'role:create',
        'Create workspace roles'
    ),
    (
        'role:update',
        'Update workspace roles and permissions'
    ),
    (
        'role:delete',
        'Delete workspace roles'
    )

ON CONFLICT (name) DO NOTHING;