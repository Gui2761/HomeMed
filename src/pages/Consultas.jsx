import './Consultas.css';
import { Link } from 'react-router-dom';

export default function Consultas() {
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
            <Link to="/consultas" className="active">Consultas</Link>
            <Link to="/mensagens">Mensagens</Link>
            <Link to="/perfil">Perfil</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></button>
          <Link to="/perfil" className="avatar-btn img-avatar">img</Link>
        </div>
      </nav>

      {/* CABEÇALHO DA PÁGINA */}
      <header className="page-header-consultas">
        <div className="header-titles">
          <span className="subtitle-top">SAÚDE NO CONFORTO DO LAR</span>
          <h1>Minhas Consultas e Agendamentos</h1>
          <p>Gerencie suas visitas domiciliares, histórico clínico e solicite novos profissionais.</p>
        </div>
        <div className="header-top-actions">
          <button className="btn-historioco">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></svg>
            Histórico Geral
          </button>
          <button className="btn-agendar-novo">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agendar Nova Consulta
          </button>
        </div>
      </header>

      {/* FILTROS DE PESQUISA */}
      <div className="filters-bar">
        <div className="filter-tags">
          <button className="f-tag active">Todas (15)</button>
          <button className="f-tag">Próximas (2)</button>
          <button className="f-tag">Em Andamento (0)</button>
          <button className="f-tag">Concluídas (12)</button>
          <button className="f-tag">Canceladas (1)</button>
        </div>
        <div className="filter-search-group">
          <div className="search-mini">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Buscar por profissional ou servi" />
          </div>
          <select className="select-spec">
            <option>Todas Especialidades</option>
          </select>
          <button className="btn-filter-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg></button>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL DE CONTEÚDO (GRID 2 COLUNAS) */}
      <div className="consultas-main-layout">
        
        {/* COLUNA ESQUERDA: Listagem */}
        <div className="consultas-list-section">
          
          {/* Card Destacado / Próxima Visita */}
          <div className="consultas-card featured-visit">
            <div className="visit-card-top">
              <div className="badge-visit primary-bg">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                PRÓXIMA VISITA DOMICILIAR
              </div>
              <span className="status-pill blue-text">Confirmada</span>
              <div className="visit-time-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Amanhã, 14:30
              </div>
            </div>

            <div className="visit-card-middle">
              <div className="doc-info-flex">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120&h=120" alt="Dra. Juliana" />
                <div>
                  <h3>Dra. Juliana Silva</h3>
                  <p>Fisioterapia Motora & Reabilitação</p>
                  <div className="visit-details-inline">
                    <span>📍 Sua residência: Rua das Flores, 123 - Apto 45</span>
                    <span>⏱️ Sessão de 60 min</span>
                  </div>
                </div>
              </div>
              <div className="visit-price-box">
                <small>Valor Total</small>
                <strong>R$ 180,00</strong>
              </div>
            </div>

            <div className="visit-card-actions">
              <div className="left-act">
                <button className="btn-blue-solid">Ver Detalhes</button>
                <button className="btn-light-outline">Abrir Chat</button>
              </div>
              <div className="right-act">
                <button className="btn-text-link">Reagendar</button>
                <button className="btn-icon-only">✕</button>
              </div>
            </div>
          </div>

          <div className="section-sub-title">
            <h3>Demais Visitas e Histórico Recente</h3>
            <span>Organizado cronologicamente</span>
          </div>

          {/* Item Histórico 1 */}
          <div className="consultas-card history-item">
            <div className="history-left">
              <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=100&h=100" alt="Marta Oliveira" />
              <div>
                <div className="history-top-row">
                  <h4>Marta Oliveira</h4>
                  <span className="status-pill blue-soft">Confirmado</span>
                </div>
                <h5>Cuidadora de Idosos • Acompanhamento Diurno</h5>
                <p>📅 15 de Outubro, 08:00  •  ⏱️ Duração: 8 horas  •  <strong>R$ 220,00</strong></p>
              </div>
            </div>
            <div className="history-right">
              <button className="btn-mini-outline">Ver Ficha</button>
              <button className="btn-dot-menu">⋮</button>
            </div>
          </div>

          {/* Item Histórico 2 */}
          <div className="consultas-card history-item">
            <div className="history-left">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=100&h=100" alt="Dr. Ricardo" />
              <div>
                <div className="history-top-row">
                  <h4>Dr. Ricardo Almeida</h4>
                  <span className="status-pill gray-soft">Concluída</span>
                </div>
                <h5>Clínico Geral • Consulta Domiciliar de Rotina</h5>
                <p>📅 12 de Outubro, 10:00  •  📝 Prescrição emitida  •  <strong>R$ 250,00</strong></p>
              </div>
            </div>
            <div className="history-right-stack">
              <div className="actions-row-mini">
                <button className="btn-mini-outline">Receita</button>
                <button className="btn-mini-outline">Avaliar</button>
              </div>
              <button className="btn-blue-solid-mini">Reagendar</button>
            </div>
          </div>

          {/* Item Histórico 3 */}
          <div className="consultas-card history-item">
            <div className="history-left">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=100&h=100" alt="Carlos Mendes" />
              <div>
                <div className="history-top-row">
                  <h4>Carlos Mendes</h4>
                  <span className="status-pill gray-soft">Concluída</span>
                </div>
                <h5>Enfermeiro Padrão • Aplicação e Curativo</h5>
                <p>📅 28 de Setembro, 16:00  •  📋 Relatório de Enfermagem pronto</p>
              </div>
            </div>
            <div className="history-right">
              <button className="btn-mini-outline">Relatório</button>
              <button className="btn-light-outline">Agendar Novamente</button>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: Resumo e Dicas */}
        <div className="consultas-sidebar-right">
          
          <div className="widget-card">
            <div className="widget-title-row">
              <h3>Resumo Pessoal</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
            </div>
            <div className="stats-counters-row">
              <div>
                <strong>02</strong>
                <span>Próximas</span>
              </div>
              <div>
                <strong>12</strong>
                <span>Realizadas</span>
              </div>
              <div>
                <strong>04</strong>
                <span>Favoritos</span>
              </div>
            </div>
            <div className="progress-section">
              <div className="prog-info">
                <span>Metas de Reabilitação Mensal</span>
                <strong>75% Concluído</strong>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: '75%' }}></div>
              </div>
              <p>3 de 4 sessões de Fisioterapia completadas neste ciclo.</p>
            </div>
          </div>

          <div className="widget-card tips-card">
            <div className="tip-header">
              <span className="icon-tip">💡</span>
              <div>
                <h4>Dicas para sua Visita</h4>
                <p>Como garantir o melhor atendimento</p>
              </div>
            </div>
            <ul className="tips-list">
              <li>Tenha em mãos seu documento oficial e exames anteriores.</li>
              <li>Mantenha o cômodo limpo, arejado e com boa iluminação.</li>
              <li>Isole animais de estimação para a segurança do profissional.</li>
            </ul>
          </div>

          <div className="widget-card help-card">
            <h4>Precisa de Ajuda?</h4>
            <p className="help-sub">Nossa equipe está disponível 24h</p>
            <p className="help-desc">Dúvidas sobre reagendamentos, convênios ou preparo do paciente? Fale diretamente com a coordenação médica.</p>
            <button className="btn-whatsapp">Atendimento via WhatsApp</button>
            <button className="btn-call">Ligar 0800 555 0192</button>
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