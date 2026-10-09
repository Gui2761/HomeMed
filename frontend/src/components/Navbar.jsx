import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      if (rawUser) {
        setUsuario(JSON.parse(rawUser));
      }
    } catch (e) {
      console.warn('Erro ao carregar usuário da sessão:', e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@HomeMed:token');
    localStorage.removeItem('@HomeMed:usuario');
    navigate('/');
  };

  const tipo = usuario?.tipo_usuario || 'paciente';

  return (
    <nav className="navbar">
      <Link to="/home" className="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
        <strong>HomeMed</strong>
      </Link>

      <div className="nav-links">
        <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>
          Início
        </Link>

        {tipo === 'paciente' && (
          <Link to="/consultas" className={location.pathname === '/consultas' ? 'active' : ''}>
            Minhas Consultas
          </Link>
        )}

        {tipo === 'profissional' && (
          <>
            <Link to="/consultas" className={location.pathname === '/consultas' ? 'active' : ''}>
              Minha Agenda de Visitas
            </Link>
            <Link to="/credenciamento" className={location.pathname === '/credenciamento' ? 'active' : ''}>
              Meu Credenciamento
            </Link>
          </>
        )}

        {tipo === 'admin' && (
          <>
            <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
              Auditoria de Especialistas
            </Link>
            <Link to="/consultas" className={location.pathname === '/consultas' ? 'active' : ''}>
              Todas as Consultas
            </Link>
          </>
        )}

        <Link to="/mensagens" className={location.pathname === '/mensagens' ? 'active' : ''}>
          Mensagens
        </Link>

        <Link to="/perfil" className={location.pathname === '/perfil' ? 'active' : ''}>
          Meu Perfil
        </Link>
      </div>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
            {usuario?.nome || 'Usuário'}
          </span>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            textTransform: 'uppercase',
            color: tipo === 'admin' ? '#b91c1c' : tipo === 'profissional' ? '#0369a1' : '#15803d' 
          }}>
            {tipo === 'admin' ? '🛡️ Administrador' : tipo === 'profissional' ? '👨‍⚕️ Especialista' : '👤 Paciente'}
          </span>
        </div>

        <button 
          onClick={handleLogout}
          title="Sair da Conta"
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            cursor: 'pointer'
          }}
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
