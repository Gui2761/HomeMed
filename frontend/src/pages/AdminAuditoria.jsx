import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import './AdminAuditoria.css';

export default function AdminAuditoria() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [proSelecionado, setProSelecionado] = useState(null);
  const [processandoId, setProcessandoId] = useState(null);

  // Filtros
  const [busca, setBusca] = useState('');
  const [conselhoFiltro, setConselhoFiltro] = useState('todos');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      if (rawUser) {
        setUsuario(JSON.parse(rawUser));
      }
    } catch (e) {}

    carregarProfissionais();
  }, []);

  const carregarProfissionais = async () => {
    try {
      setCarregando(true);
      const lista = await api.listarProfissionais();
      const pros = Array.isArray(lista) ? lista : [];
      setProfissionais(pros);
      if (pros.length > 0 && !proSelecionado) {
        setProSelecionado(pros[0]);
      }
    } catch (err) {
      console.error('Erro ao listar profissionais para auditoria:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleAlternarStatus = async (pro, novoStatus) => {
    setProcessandoId(pro.id);
    try {
      await api.alternarVerificacaoProfissional(pro.id, novoStatus);
      alert(`Profissional ${pro.nome} ${novoStatus ? 'aprovado e ativado no marketplace' : 'suspenso da vitrine pública'}.`);
      await carregarProfissionais();
      if (proSelecionado?.id === pro.id) {
        setProSelecionado({ ...proSelecionado, verificado: novoStatus });
      }
    } catch (err) {
      console.error('Erro ao atualizar verificação:', err);
      alert('Erro ao atualizar status do profissional.');
    } finally {
      setProcessandoId(null);
    }
  };

  const tipo = usuario?.tipo_usuario || 'paciente';

  // PROTEÇÃO RBAC: Apenas admin pode acessar
  if (tipo !== 'admin') {
    return (
      <div className="app-container">
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '80px auto', padding: '32px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Acesso Restrito à Governança Clínica
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', marginBottom: '24px' }}>
            Esta área de auditoria de conselhos e conformidade regulatória é reservada exclusivamente aos administradores e auditores médicos do HomeMed. Seus dados estão protegidos conforme as diretrizes da LGPD em Saúde.
          </p>
          <button
            type="button"
            onClick={() => navigate('/home')}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  // Filtragem dos profissionais reais
  const listaFiltrada = profissionais.filter((p) => {
    const termoMatch = !busca.trim() || 
      p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      p.registro_profissional?.toLowerCase().includes(busca.toLowerCase()) ||
      p.especialidade_principal?.toLowerCase().includes(busca.toLowerCase()) ||
      p.email?.toLowerCase().includes(busca.toLowerCase());

    const conselhoMatch = conselhoFiltro === 'todos' || 
      p.registro_profissional?.toLowerCase().includes(conselhoFiltro.toLowerCase());

    const statusMatch = statusFiltro === 'todos' ||
      (statusFiltro === 'verificado' && Boolean(p.verificado)) ||
      (statusFiltro === 'pendente' && !p.verificado);

    return termoMatch && conselhoMatch && statusMatch;
  });

  const totalAtivos = profissionais.filter(p => Boolean(p.verificado)).length;
  const totalPendentes = profissionais.filter(p => !p.verificado).length;

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar />

      {/* HEADER DE AUDITORIA */}
      <header className="admin-header">
        <div className="admin-header-titles">
          <span className="admin-eyebrow">GOVERNANÇA CLÍNICA & REGULATORY COMPLIANCE</span>
          <h1>Auditoria & Gestão de Especialistas</h1>
          <p>Autenticação cadastral em conselhos de classe (CRM, COREN, CREFITO) e liberação ativa no marketplace.</p>
        </div>

        <div className="admin-header-badges">
          <span className="badge-pill-urgent">
            <span className="dot-red"></span>
            {totalPendentes} Pendente(s) de Homologação
          </span>
          <span className="badge-pill-verified">
            <span className="dot-blue"></span>
            {totalAtivos} Ativo(s) Verificado(s)
          </span>
        </div>
      </header>

      {/* 4 CARDS DE ESTATÍSTICAS REAIS */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span className="stat-title">TOTAL DE PROFISSIONAIS</span>
          <div className="stat-number-row">
            <strong>{profissionais.length}</strong>
          </div>
          <p>Profissionais cadastrados no banco de dados</p>
        </div>

        <div className="stat-card">
          <span className="stat-title">HOMOLOGADOS ATIVOS</span>
          <div className="stat-number-row">
            <strong>{totalAtivos}</strong>
            <span className="pulse-green-pill">Liberados</span>
          </div>
          <p>Visíveis na busca pública dos pacientes</p>
        </div>

        <div className="stat-card">
          <span className="stat-title">PENDENTES DE AUDITORIA</span>
          <div className="stat-number-row">
            <strong>{totalPendentes}</strong>
            <span className="trend-up" style={{ color: '#d97706' }}>Aguardando</span>
          </div>
          <p>Aguardando validação do conselho de classe</p>
        </div>

        <div className="stat-card">
          <span className="stat-title">CONFORMIDADE LGPD</span>
          <div className="stat-number-row">
            <strong>100%</strong>
            <span className="badge-satisfaction">Certificado</span>
          </div>
          <p>Criptografia e sigilo médico ativo</p>
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
            placeholder="Buscar por nome, e-mail, conselho ou especialidade..."
          />
        </div>

        <div className="admin-select-group">
          <select value={conselhoFiltro} onChange={(e) => setConselhoFiltro(e.target.value)}>
            <option value="todos">Todos os Conselhos</option>
            <option value="crm">CRM (Medicina)</option>
            <option value="coren">COREN (Enfermagem)</option>
            <option value="crefito">CREFITO (Fisioterapia)</option>
            <option value="crn">CRN (Nutrição)</option>
            <option value="crp">CRP (Psicologia)</option>
          </select>

          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option value="todos">Todos os Status</option>
            <option value="pendente">Apenas Pendentes</option>
            <option value="verificado">Apenas Homologados</option>
          </select>
        </div>
      </div>

      {/* MAIN TWO COLUMNS GRID */}
      <div className="admin-main-grid">
        
        {/* COLUNA ESQUERDA: LISTAGEM DE HOMOLOGAÇÃO */}
        <div className="admin-col-left">
          
          <div className="sub-header-bar">
            <h3>Profissionais Cadastrados ({listaFiltrada.length})</h3>
            <span>Barramento Oficial do HomeMed</span>
          </div>

          {carregando ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px' }}>
              <p>Carregando especialistas do banco de dados...</p>
            </div>
          ) : listaFiltrada.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ color: '#64748b', fontSize: '14px' }}>
                Nenhum profissional encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            listaFiltrada.map((pro) => (
              <div 
                className={`audit-card ${proSelecionado?.id === pro.id ? 'selected-card' : ''}`} 
                key={pro.id}
                onClick={() => setProSelecionado(pro)}
                style={{ cursor: 'pointer' }}
              >
                <div className="audit-card-top">
                  <div className="audit-user-info">
                    <img 
                      src={
                        pro.especialidade_principal?.includes('Enferm') 
                          ? 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=120&h=120'
                          : pro.especialidade_principal?.includes('Médic') || pro.especialidade_principal?.includes('Clínic')
                          ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120&h=120'
                          : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120&h=120'
                      } 
                      alt={pro.nome} 
                      className="audit-avatar"
                    />
                    <div>
                      <div className="audit-name-row">
                        <h4>{pro.nome}</h4>
                        <span className="tag-conselho">{pro.registro_profissional}</span>
                        <span className="tag-spec">{pro.especialidade_principal}</span>
                      </div>
                      <p className="audit-email">
                        {pro.email} • {pro.telefone || 'Telefone não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="audit-status-badge">
                    <span className={`status-dot ${Boolean(pro.verificado) ? 'green' : 'orange'}`}></span>
                    {Boolean(pro.verificado) ? 'Homologado Ativo' : 'Pendente Homologação'}
                  </div>
                </div>

                <div style={{ marginTop: '10px', fontSize: '13px', color: '#475569' }}>
                  <p>{pro.bio ? pro.bio.substring(0, 110) + '...' : 'Sem bio informada.'}</p>
                </div>

                <div className="audit-card-actions" style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Honorário base: <strong>R$ {parseFloat(pro.preco_base).toFixed(2).replace('.', ',')}</strong> / {pro.unidade_cobranca || 'sessão'}
                  </div>
                  
                  <div className="actions-right-flex">
                    {Boolean(pro.verificado) ? (
                      <button 
                        type="button"
                        className="btn-action-suspend"
                        disabled={processandoId === pro.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlternarStatus(pro, false);
                        }}
                      >
                        Suspender da Vitrine
                      </button>
                    ) : (
                      <button 
                        type="button"
                        className="btn-action-approve"
                        disabled={processandoId === pro.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAlternarStatus(pro, true);
                        }}
                      >
                        ✓ Aprovar e Ativar no Marketplace
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

        </div>

        {/* COLUNA DIREITA: GAVETA DE INSPEÇÃO DINÂMICA */}
        <div className="admin-col-right">
          
          <div className="audit-drawer-card">
            <div className="drawer-top-row">
              <div className="drawer-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                <h4>Dossiê do Especialista</h4>
              </div>
              <span className="badge-audit-mode">Inspeção Ativa</span>
            </div>

            {proSelecionado ? (
              <div>
                <p className="drawer-desc" style={{ marginBottom: '14px' }}>
                  Inspeção cadastral com validação de registro para <strong>{proSelecionado.nome}</strong>.
                </p>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Registro no Conselho</small>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{proSelecionado.registro_profissional}</div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Especialidade Principal</small>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{proSelecionado.especialidade_principal}</div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Status Cadastral</small>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: Boolean(proSelecionado.verificado) ? '#059669' : '#d97706' }}>
                      {Boolean(proSelecionado.verificado) ? '🟢 Regular e Verificado no Marketplace' : '🟡 Pendente de Homologação'}
                    </div>
                  </div>
                  <div>
                    <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>Apresentação / Bio</small>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '2px' }}>
                      {proSelecionado.bio || 'Sem apresentação cadastrada.'}
                    </div>
                  </div>
                </div>

                <div className="drawer-quick-actions">
                  {Boolean(proSelecionado.verificado) ? (
                    <button 
                      className="btn-drawer-action" 
                      onClick={() => handleAlternarStatus(proSelecionado, false)}
                    >
                      Suspender Cadastro
                    </button>
                  ) : (
                    <button 
                      className="btn-drawer-action primary" 
                      onClick={() => handleAlternarStatus(proSelecionado, true)}
                    >
                      ✓ Homologar Registro
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '13px', padding: '20px 0' }}>
                Selecione um profissional na lista para inspecionar os dados.
              </p>
            )}

            {/* TERMO DE SIGILO */}
            <div className="lgpd-guard-card" style={{ marginTop: '20px' }}>
              <div className="guard-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <strong>Proteção de Dados LGPD em Saúde</strong>
              </div>
              <p>
                Os dados sensíveis de prontuários e contatos são protegidos sob criptografia e sigilo profissional.
              </p>
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
          <span>© 2026 HomeMed Marketplace • Governança Clínica</span>
        </div>
      </footer>
    </div>
  );
}
