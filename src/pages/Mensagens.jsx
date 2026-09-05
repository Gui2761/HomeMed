import './Mensagens.css';
import { Link } from 'react-router-dom';

export default function Mensagens() {
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
            <Link to="/mensagens" className="active">Mensagens</Link>
            <Link to="/perfil">Perfil</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></button>
          <Link to="/perfil" className="avatar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></Link>
        </div>
      </nav>

      {/* CHAT LAYOUT 3 COLUNAS */}
      <div className="chat-layout">
        
        {/* COLUNA 1: Lista de Conversas */}
        <div className="chat-sidebar">
          <h3>Mensagens</h3>
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Buscar conversas" />
          </div>

          <div className="conversation-list">
            <div className="convo-item active">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100" alt="Dra. Juliana" />
              <div className="convo-info">
                <div className="convo-header">
                  <h4>Dra. Juliana Silva</h4>
                  <span className="time">10:42 AM</span>
                </div>
                <p>Olá! Recebi seu pedido. Qu...</p>
              </div>
              <span className="badge-unread">1</span>
            </div>

            <div className="convo-item">
              <div className="avatar-placeholder">CM</div>
              <div className="convo-info">
                <div className="convo-header">
                  <h4>Dr. Carlos Mendes</h4>
                  <span className="time">Ontem</span>
                </div>
                <p>A receita foi enviada para o seu...</p>
              </div>
            </div>

            <div className="convo-item">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100" alt="Dr. Roberto" />
              <div className="convo-info">
                <div className="convo-header">
                  <h4>Dr. Roberto Almeida</h4>
                  <span className="time">Seg</span>
                </div>
                <p>Perfeito, nos vemos na próxima ...</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 2: Janela de Chat */}
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-user">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100" alt="Dra. Juliana" />
              <div>
                <h4>Dra. Juliana Silva</h4>
                <span>Fisioterapeuta</span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg></button>
              <button><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
            </div>
          </div>

          <div className="chat-body">
            <div className="chat-date">Hoje, 10:30 AM</div>

            <div className="card-proposal">
              <div className="proposal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
              </div>
              <div className="proposal-content">
                <h5>Solicitação de Visita Domiciliar</h5>
                <p>Sessão de Fisioterapia Motora de 60 minutos solicitada para sua residência.</p>
                <div className="proposal-footer">
                  <span>R$ 180,00</span>
                  <span>Rua das Flores, 123</span>
                </div>
              </div>
            </div>

            <div className="message-bubble received">
              <p>Olá! Recebi seu pedido. Qual seria o melhor horário para a visita?</p>
              <span className="msg-time">10:42 AM</span>
            </div>
          </div>

          <div className="chat-input-area">
            <button className="btn-attachment"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>
            <input type="text" placeholder="Digite sua mensagem..." />
            <button className="btn-send"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
          </div>
        </div>

        {/* COLUNA 3: Detalhes do Serviço */}
        <div className="chat-details">
          <div className="details-profile">
            <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150" alt="Dra. Juliana" />
            <h4>Dra. Juliana Silva</h4>
            <span>Fisioterapeuta</span>
            <div className="details-rating">⭐ 4.9 <small>(128 avaliações)</small></div>
          </div>

          <div className="details-box">
            <h5>Detalhes do Serviço</h5>
            <div className="service-row">
              <div>
                <strong>Fisioterapia Motora</strong>
                <p>Sessão domiciliar (60 min)</p>
              </div>
              <span className="service-price">R$ 180</span>
            </div>
            <div className="service-info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Sua residência</span>
            </div>
            <div className="service-info-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>A combinar</span>
            </div>
          </div>

          <div className="details-actions">
            <button className="btn-confirm">Confirmar Agendamento</button>
            <button className="btn-cancel">Cancelar Solicitação</button>
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
          <span>© 2024 HomeMed Saúde Digital</span>
          <a href="#">Termos de Uso</a>
          <a href="#">Privacidade</a>
        </div>
      </footer>
    </div>
  );
}