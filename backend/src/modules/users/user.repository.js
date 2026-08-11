import { pool } from "../../configs/db.config.js";

const createUser = async (payload) => {
  const { firstName, lastName, username, email, passwordHash } = payload;

  const query = `
    INSERT INTO users (
      first_name,
      last_name,
      username,
      email,
      password_hash
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, first_name, last_name, username, email, is_active, created_at, updated_at
  `;

  const values = [firstName, lastName, username, email, passwordHash];

  const { rows } = await pool.query(query, values);

  return rows[0];
};

const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const { rows } = await pool.query(query, [email]);

  return rows[0] || null;
};

const findUserById = async () => {};

const findUserByUsername = async () => {};

export const userRepository = {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
};
