import jwt from 'jsonwebtoken';

export const verificarAutenticacao = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
  }

  // O formato esperado do header é: "Bearer <token>"
  const [, token] = authHeader.split(' ');

  try {
    const jwtSecret = process.env.JWT_SECRET || 'homemed_default_jwt_secret_dev_key_2026';
    const decoded = jwt.verify(token, jwtSecret);
    
    // Injeta os dados do usuário na requisição para uso posterior
    req.usuarioId = decoded.id;
    req.tipoUsuario = decoded.tipo_usuario;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};