import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const storagedToken = localStorage.getItem('@HomeMed:token');
    const storagedUser = localStorage.getItem('@HomeMed:usuario');

    if (storagedToken && storagedUser) {
      try {
        setToken(storagedToken);
        setUsuario(JSON.parse(storagedUser));
      } catch (err) {
        localStorage.removeItem('@HomeMed:token');
        localStorage.removeItem('@HomeMed:usuario');
      }
    }
    setCarregando(false);
  }, []);

  const login = async (credenciais) => {
    const resposta = await api.fazerLogin(credenciais);
    if (resposta.token && resposta.usuario) {
      setToken(resposta.token);
      setUsuario(resposta.usuario);
      localStorage.setItem('@HomeMed:token', resposta.token);
      localStorage.setItem('@HomeMed:usuario', JSON.stringify(resposta.usuario));
      return { sucesso: true };
    }
    return { sucesso: false, erro: resposta.error || 'Credenciais inválidas' };
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('@HomeMed:token');
    localStorage.removeItem('@HomeMed:usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, token, carregando, login, logout, estaAutenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
