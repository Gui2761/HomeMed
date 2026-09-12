import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminAuditoria.css';

export default function AdminAuditoria() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [conselhoFiltro, setConselhoFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [apenasUrgentes, setApenasUrgentes] = useState(false);
  const [aprovadoJuliana, setAprovadoJuliana] = useState(true);
  const [suspensaMarta, setSuspensaMarta] = useState(false);

  const handleAprovarJuliana = () => {
    setAprovadoJuliana(true);
    alert('Dra. Juliana Silva aprovada com sucesso e liberada na vitrine do marketplace!');
  };

  const handleSuspenderMarta = () => {
    setSuspensaMarta(true);
    alert('Marta Oliveira mantida em suspensão preventiva até envio das referências pendentes.');
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/home" className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          <strong>HomeMed</strong>
        </Link>
        <div className="nav-links">
          <Link to="/home">Início</Link>
          <Link to="/consultas">Consultas & Agendamentos</Link>
          <Link to="/mensagens">Mensagens</Link>
          <Link to="/credenciamento">Credenciamento</Link>
          <Link to="/admin" className="active">Administração</Link>
          <Link to="/perfil">Perfil</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" title="Notificações" aria-label="Notificações">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <Link to="/perfil" className="avatar-btn" title="Admin HomeMed" aria-label="Admin HomeMed">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
        </div>
      </nav>

      {/* HEADER DE AUDITORIA */}
      <header className="admin-header">
        <div className="admin-header-titles">
          <span className="admin-eyebrow">GOVERNANÇA CLÍNICA & REGULATORY COMPLIANCE</span>
          <h1>Auditoria & Gestão de Especialistas</h1>
          <p>Verificação regulatória, autenticação em conselhos de classe e liberação ativa de cadastros.</p>
        </div>

        <div className="admin-header-badges">
          <span className="badge-pill-urgent">
            <span className="dot-red"></span>
            18 Pendentes de Homologação
          </span>
          <span className="badge-pill-verified">
            <span className="dot-blue"></span>
            92 Ativos Verificados
          </span>
        </div>
      </header>

      {/* 4 CARDS DE ESTATÍSTICAS NO TOPO */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span className="stat-title">TOTAL DE PROFISSIONAIS</span>
          <div className="stat-number-row">
            <strong>248</strong>
            <span className="trend-up">+14%</span>
          </div>
          <p>Bases ativas: CRM, COREN, CREFITO e Cuidadores</p>
        </div>

        <div className="stat-card">
          <span className="stat-title">CONSULTAS EM ROTA</span>
          <div className="stat-number-row">
            <strong>37</strong>
            <span className="pulse-green-pill">Em andamento</span>
          </div>
          <p>Check-in geolocalizado ativo em tempo real</p>
        </div>

        <div className="stat-card">
          <span className="stat-title">MÉDIA GLOBAL NPS</span>
          <div className="stat-number-row">
            <strong>4.92 ★</strong>
            <span className="badge-satisfaction">Excelente</span>
          </div>
          <p>Índice de retenção pós-atendimento: 98.2%</p>
        </div>

        <div className="stat-card">
          <span className="stat-title">CUSTÓDIA EM ESCROW</span>
          <div className="stat-number-row">
            <strong>R$ 84.600,00</strong>
          </div>
          <p>Garantia de liquidação pós-visita domiciliar</p>
        </div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS */}
      <div className="admin-filters-bar">
        <div className="admin-search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input 
            type="text" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por especialista, e-mail institucional, CRM, COREN ou CREFITO..."
          />
        </div>

        <div className="admin-select-group">
          <select value={conselhoFiltro} onChange={(e) => setConselhoFiltro(e.target.value)}>
            <option value="todos">Todos Conselhos</option>
            <option value="crefito">CREFITO</option>
            <option value="crm">CRM</option>
            <option value="coren">COREN</option>
          </select>

          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendentes</option>
            <option value="verificado">Verificados</option>
            <option value="bloqueado">Bloqueados</option>
          </select>

          <label className="checkbox-urgent-label">
            <input 
              type="checkbox" 
              checked={apenasUrgentes} 
              onChange={(e) => setApenasUrgentes(e.target.checked)} 
            />
            <span>Apenas Urgentes (18)</span>
          </label>
        </div>
      </div>

      {/* MAIN TWO COLUMNS GRID */}
      <div className="admin-main-grid">
        
        {/* COLUNA ESQUERDA: LISTAGEM DE HOMOLOGAÇÃO */}
        <div className="admin-col-left">
          
          <div className="sub-header-bar">
            <h3>Protocolo de Homologação</h3>
            <span>RNDS e Barramento Oficial do Ministério da Saúde</span>
          </div>

          {/* CARD 1: DRA. JULIANA SILVA */}
          <div className="audit-card">
            <div className="audit-card-top">
              <div className="audit-user-info">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120&h=120" 
                  alt="Dra. Juliana Silva" 
                  className="audit-avatar"
                />
                <div>
                  <div className="audit-name-row">
                    <h4>Dra. Juliana Silva</h4>
                    <span className="tag-conselho">CREFITO 12458-SP</span>
                    <span className="tag-spec">Fisioterapia Motora</span>
                  </div>
                  <p className="audit-email">juliana.silva@homemed.com.br • Cadastrada hoje às 08:30</p>
                </div>
              </div>

              <div className="audit-status-badge">
                <span className="status-dot green"></span>
                Consulta ao CREFITO Ativo
              </div>
            </div>

            <div className="docs-chips-group">
              <span className="doc-chip ok">✓ Carteira Profissional (Frente/Verso)</span>
              <span className="doc-chip ok">✓ Diploma Registro MEC</span>
              <span className="doc-chip ok">✓ Apólice Responsabilidade Civil</span>
            </div>

            <div className="check-antecedentes-box">
              <span className="icon-shield">🛡️</span>
              <div>
                <strong>Checagem de Antecedentes Criminais:</strong>
                <span>Certidão Negativa emitida sem pendências judiciais.</span>
              </div>
              <span className="badge-pass">Aprovado</span>
            </div>

            <div className="audit-card-actions">
              <button className="btn-action-outline" onClick={() => alert('Mensagem de solicitação de ajuste enviada.')}>
                Solicitar Ajuste
              </button>
              <button className="btn-action-suspend" onClick={() => alert('Cadastro suspenso preventivamente.')}>
                Suspender
              </button>
              <button className="btn-action-approve" onClick={handleAprovarJuliana}>
                {aprovadoJuliana ? '✓ Ativo no Marketplace' : 'Aprovar e Ativar no Marketplace'}
              </button>
            </div>
          </div>

          {/* CARD 2: CARLOS MENDES */}
          <div className="audit-card">
            <div className="audit-card-top">
              <div className="audit-user-info">
                <img 
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120&h=120" 
                  alt="Carlos Mendes" 
                  className="audit-avatar"
                />
                <div>
                  <div className="audit-name-row">
                    <h4>Carlos Mendes</h4>
                    <span className="tag-conselho">COREN-SP 45892</span>
                    <span className="tag-spec">Enfermagem Padrão</span>
                  </div>
                  <p className="audit-email">carlos.mendes@email.com • Ativo há 4 meses</p>
                </div>
              </div>

              <div className="audit-status-badge verified-solid">
                <span className="status-dot blue"></span>
                Selo Verificado Ativo
              </div>
            </div>

            <div className="audit-metrics-row">
              <div className="metric-box">
                <small>Certidão Ético-Profissional</small>
                <strong>Homologado 05/01/2026 (Sem punições)</strong>
              </div>
              <div className="metric-box">
                <small>Taxa de Cancelamento Domiciliar</small>
                <strong>0.8% nos últimos 90 dias</strong>
              </div>
              <div className="metric-box">
                <small>Resolução Anual MEC</small>
                <strong>Pós-Graduação 11/2024</strong>
              </div>
            </div>

            <div className="audit-card-actions" style={{ marginTop: '14px' }}>
              <span className="audit-log-note">Última checagem efetuada pelo Dr. Marcos V. em 10/01/2026</span>
              <div className="actions-right-flex">
                <button className="btn-action-outline" onClick={() => navigate('/consultas')}>Histórico Clínico</button>
                <button className="btn-action-suspend" onClick={() => alert('Profissional suspenso temporariamente.')}>Suspender Temporariamente</button>
              </div>
            </div>
          </div>

          {/* CARD 3: MARTA OLIVEIRA */}
          <div className="audit-card warning-state">
            <div className="audit-card-top">
              <div className="audit-user-info">
                <img 
                  src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=120&h=120" 
                  alt="Marta Oliveira" 
                  className="audit-avatar"
                />
                <div>
                  <div className="audit-name-row">
                    <h4>Marta Oliveira</h4>
                    <span className="tag-conselho">Cuidadora Certificada</span>
                  </div>
                  <p className="audit-email">marta.oliveira.care@gmail.com • Aguardando checagem de referências</p>
                </div>
              </div>

              <div className="audit-status-badge warning">
                <span className="status-dot orange"></span>
                Pendente Checagem de Referências
              </div>
            </div>

            <div className="warning-callout">
              <span className="warning-icon">⚠️</span>
              <div>
                <strong>Pendência Bloqueante:</strong>
                <p>Atestado de Idoneidade Moral e duas referências familiares anteriores ainda não responderam contato interno de checagem.</p>
              </div>
            </div>

            <div className="audit-card-actions">
              <span className="audit-log-note">Certificação Senac (600 horas) conferida com sucesso</span>
              <div className="actions-right-flex">
                <button className="btn-action-outline" onClick={() => alert('Discando para a referência familiar (11) 98765-4321...')}>
                  Ligar Referências (2)
                </button>
                <button className="btn-action-analyze" onClick={handleSuspenderMarta}>
                  {suspensaMarta ? 'Bloqueada Preventivamente' : 'Analisar Documentos'}
                </button>
              </div>
            </div>
          </div>

          <div className="pagination-bar">
            <span>Exibindo <strong>3 de 248</strong> profissionais avaliados</span>
            <div className="page-buttons">
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">›</button>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: GAVETA DE INSPEÇÃO (AUDIT MODE) */}
        <div className="admin-col-right">
          
          <div className="audit-drawer-card">
            <div className="drawer-top-row">
              <div className="drawer-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                <h4>Gaveta de Inspeção</h4>
              </div>
              <span className="badge-audit-mode">Audit Mode</span>
            </div>

            <p className="drawer-desc">
              Inspeção com validação de integridade SHA-256 e visualização biométrica (CREFITO-SP nº 12458).
            </p>

            {/* DOCUMENTO ESCANEADO SIMULADO */}
            <div className="document-scanned-container">
              <div className="scanned-header">
                <span>REPÚBLICA FEDERATIVA DO BRASIL</span>
                <small>CONSELHO REGIONAL DE FISIOTERAPIA E TERAPIA OCUPACIONAL</small>
              </div>

              <div className="scanned-body">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120&h=140" 
                  alt="Biometria" 
                  className="scanned-biometric-photo"
                />
                <div className="scanned-fields">
                  <div>
                    <label>NOME COMPLETO</label>
                    <strong>JULIANA SILVA SANTOS</strong>
                  </div>
                  <div>
                    <label>REGISTRO CREFITO-SP</label>
                    <strong>12458-SP • FISIOTERAPEUTA</strong>
                  </div>
                  <div>
                    <label>FILIAÇÃO</label>
                    <span>MARIA SILVA / JOSÉ SANTOS</span>
                  </div>
                  <div className="scanned-two-col">
                    <div>
                      <label>DATA NASC.</label>
                      <span>14/05/1988</span>
                    </div>
                    <div>
                      <label>VALIDADE</label>
                      <span>31/12/2029</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="scanned-footer">
                <span>HASH SHA-256: 8a7c90...3639e4</span>
                <span className="stamp-valid">VÁLIDO CFM/COFFITO</span>
              </div>
            </div>

            <div className="drawer-quick-actions">
              <button className="btn-drawer-action" onClick={() => alert('Download do arquivo de imagem TIFF de alta resolução iniciado.')}>
                🔍 Baixar TIFF
              </button>
              <button className="btn-drawer-action primary" onClick={() => alert('Hash SHA-256 verificado com sucesso no livro de registros do Conselho!')}>
                ✓ Validar Hash
              </button>
            </div>

            {/* TERMO DE SIGILO */}
            <div className="lgpd-guard-card">
              <div className="guard-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <strong>Proteção de Dados & Termo de Sigilo</strong>
              </div>
              <p>
                Dados sensíveis de prontuários de pacientes vinculados a este profissional são criptografados ponta-a-ponta sob AES-256.
              </p>
              <small>Auditoria registrada na blockchain interna #HL-9912.</small>
            </div>

            {/* AUDITOR MÉDICO RESPONSÁVEL */}
            <div className="auditor-footer-box">
              <div className="auditor-info">
                <strong>Dr. Ricardo Vasconcelos (CRM 92841)</strong>
                <span>Auditor Médico Responsável • Governança HomeMed</span>
              </div>
              <span className="auditor-status-dot">Auditoria Ativa</span>
            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed Marketplace
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed Marketplace • Todos os direitos reservados.</span>
          <a href="#">Política de Privacidade</a>
          <a href="#">Termos de Serviço</a>
          <a href="#">Suporte</a>
        </div>
      </footer>
    </div>
  );
}
