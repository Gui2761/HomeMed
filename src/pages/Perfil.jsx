import { useState } from 'react';
import './Perfil.css';
import { Link } from 'react-router-dom';

export default function Perfil() {
  const [abaAtiva, setAbaAtiva] = useState('pessoal');

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          <strong>HomeMed</strong>
        </div>
        <div className="nav-links">
            <Link to="/home">Início</Link>
            <Link to="/consultas">Consultas</Link>
            <Link to="/mensagens">Mensagens</Link>
            <Link to="/perfil" className="active">Perfil</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></button>
          <button className="avatar-btn img-avatar">img</button>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL DO PERFIL */}
      <div className="profile-layout">
        
        {/* COLUNA ESQUERDA: Card de Usuário e Estatísticas */}
        <div className="profile-sidebar">
          <div className="user-card-main">
            <div className="avatar-container">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200" alt="Ricardo Santos" />
            </div>
            <h2>Ricardo Santos</h2>
            <div className="user-location">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>São Paulo, SP</span>
            </div>

            <div className="profile-buttons">
              <button className="btn-edit-profile">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Editar Perfil
              </button>
              <Link to="/" className="btn-logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Sair da conta
              </Link>
            </div>
          </div>

          <div className="stats-box">
            <div className="stat-item">
              <strong>12</strong>
              <span>CONSULTAS REALIZADAS</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <strong>3</strong>
              <span>ESPECIALISTAS SALVOS</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Abas e Conteúdo Dinâmico */}
        <div className="profile-content-area">
          <div className="profile-tabs">
            <button 
              className={abaAtiva === 'pessoal' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('pessoal')}
            >
              Informações Pessoais
            </button>
            <button 
              className={abaAtiva === 'historico' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('historico')}
            >
              Histórico de Consultas
            </button>
            <button 
              className={abaAtiva === 'config' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('config')}
            >
              Configurações
            </button>
          </div>

          <div className="tab-pane-content">
            {abaAtiva === 'pessoal' && (
              <div className="form-grid-mock">
                <h3>Dados Cadastrais</h3>
                <p>Gerencie suas informações de contato e endereço para os atendimentos domiciliares.</p>
                {/* Aqui você pode preencher com os inputs dos dados do usuário futuramente */}
                <div className="mock-box-info">
                  <div><strong>E-mail:</strong> ricardo.santos@email.com</div>
                  <div><strong>Telefone:</strong> (11) 98765-4321</div>
                  <div><strong>Endereço Principal:</strong> Av. Paulista, 1000 - Bela Vista, São Paulo - SP</div>
                </div>
              </div>
            )}

            {abaAtiva === 'historico' && (
              <div className="form-grid-mock">
                <h3>Histórico de Atendimentos</h3>
                <p>Veja a listagem de todas as consultas e visitas domiciliares finalizadas.</p>
                <div className="mock-box-info">
                  <p>Nenhuma consulta pendente. Você realizou 12 consultas no total.</p>
                </div>
              </div>
            )}

            {abaAtiva === 'config' && (
              <div className="form-grid-mock">
                <h3>Configurações do Aplicativo</h3>
                <p>Ajuste suas preferências de notificação e segurança da conta.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed
        </div>
        <div className="footer-links">
          <span>© 2024 Todos os direitos reservados.</span>
          <a href="#">Privacidade</a>
          <a href="#">Termos de Uso</a>
          <a href="#">Ajuda</a>
        </div>
      </footer>
    </div>
  );
}