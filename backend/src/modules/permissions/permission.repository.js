import { pool } from "../../configs/db.config.js";

const getAllPermissions = async () => {
  const query = `
    SELECT id, name, description, created_at
    FROM permissions
    ORDER BY name ASC
  `;

  const { rows } = await pool.query(query);
  return rows;
};

export const permissionRepository = {
  getAllPermissions,
};
