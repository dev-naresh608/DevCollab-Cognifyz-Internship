import { pool } from "../configs/db.config.js";

export const authorizePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthenticated.",
        });
      }

      // Extract workspaceId from route params (supports :workspaceId or :id)
      const workspaceId = req.params.workspaceId || req.params.id;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Workspace ID is required in request parameters.",
        });
      }

      // Verify workspace exists
      const workspaceCheck = await pool.query(
        `SELECT id, is_active FROM workspaces WHERE id = $1`,
        [workspaceId],
      );

      if (workspaceCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Workspace not found.",
        });
      }

      const workspace = workspaceCheck.rows[0];

      // Inactive workspaces block normal operations unless the operation is workspace:restore
      if (!workspace.is_active && requiredPermission !== "workspace:restore") {
        return res.status(404).json({
          success: false,
          message: "Workspace not found or is currently inactive.",
        });
      }

      // Check if user is a member of the workspace with an assigned role and the required permission
      const query = `
        SELECT 1
        FROM workspace_members wm
        INNER JOIN roles r ON r.id = wm.role_id
        INNER JOIN role_permissions rp ON rp.role_id = r.id
        INNER JOIN permissions p ON p.id = rp.permission_id
        WHERE wm.workspace_id = $1
          AND wm.user_id = $2
          AND r.workspace_id = $1
          AND p.name = $3
      `;

      const { rows } = await pool.query(query, [
        workspaceId,
        userId,
        requiredPermission,
      ]);

      if (rows.length === 0) {
        // Check if user is a workspace member to distinguish 403 Forbidden
        const memberCheck = await pool.query(
          `SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`,
          [workspaceId, userId],
        );

        if (memberCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: "Access denied. You are not a member of this workspace.",
          });
        }

        return res.status(403).json({
          success: false,
          message: `Access denied. Missing required permission: '${requiredPermission}'.`,
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error during permission authorization.",
      });
    }
  };
};
