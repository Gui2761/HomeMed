import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [usuario, setUsuario] = useState(null);

  const syncUser = () => {
    try {
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      if (rawUser) {
        setUsuario(JSON.parse(rawUser));
      }
    } catch (e) {
      console.warn('Erro ao carregar usuário da sessão:', e);
    }
  };

  useEffect(() => {
    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('user-profile-updated', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('user-profile-updated', syncUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('@HomeMed:token');
    localStorage.removeItem('@HomeMed:usuario');
    navigate('/');
  };

  const tipo = usuario?.tipo_usuario || 'paciente';

  const avatarPadrao = tipo === 'profissional' 
    ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100'
    : tipo === 'admin'
    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100'
    : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100';

  return (
    <nav className="navbar">
      <Link to="/home" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '9px', textDecoration: 'none' }}>
        <img src="/favicon.svg" alt="HomeMed Logo" width="28" height="28" style={{ borderRadius: '7px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
        <strong style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7' }}>HomeMed</strong>
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
        <Link 
          to="/perfil" 
          title="Ver e editar meu perfil" 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
        >
          <img 
            src={usuario?.foto_url || avatarPadrao} 
            alt={usuario?.nome || 'Perfil'} 
            style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '2px solid #0284c7',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
            }} 
          />
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {usuario?.nome || 'Usuário'}
            </span>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: '700', 
              textTransform: 'uppercase',
              color: tipo === 'admin' ? '#b91c1c' : tipo === 'profissional' ? '#0369a1' : '#15803d' 
            }}>
              {tipo === 'admin' ? '🛡️ Administrador' : tipo === 'profissional' ? '👨‍⚕️ Especialista' : '👤 Paciente'}
            </span>
          </div>
        </Link>

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
