import { pool } from '../config/database.js';

export const usuarioService = {
  async criarUsuario({ email, senha_hash, nome, telefone, tipo_usuario }) {
    const query = `
      INSERT INTO usuarios (email, senha_hash, nome, telefone, tipo_usuario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, nome, tipo_usuario, criado_em;
    `;
    const values = [email, senha_hash, nome, telefone, tipo_usuario];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async buscarPorEmail(email) {
    const query = `SELECT * FROM usuarios WHERE email = $1;`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async listarUsuarios() {
    const query = `SELECT id, email, nome, telefone, tipo_usuario, criado_em FROM usuarios;`;
    const result = await pool.query(query);
    return result.rows;
  }
};