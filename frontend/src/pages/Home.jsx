import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  // Estados do Paciente
  const [termo, setTermo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [destaque, setDestaque] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Médico/Profissional
  const [meuPerfilPro, setMeuPerfilPro] = useState(null);
  const [disponivelHoje, setDisponivelHoje] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const [agendamentosPro, setAgendamentosPro] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('@HomeMed:usuario');
      if (raw) {
        const u = JSON.parse(raw);
        setUsuario(u);
        if (u.tipo_usuario === 'profissional') {
          carregarDadosProfissional();
        } else {
          carregarDadosPaciente();
        }
      } else {
        carregarDadosPaciente();
      }
    } catch (e) {
      carregarDadosPaciente();
    }
  }, []);

  const categorias = [
    { nome: 'Fisioterapia', icone: '🏃' },
    { nome: 'Enfermagem', icone: '🩺' },
    { nome: 'Cuidador', icone: '🤝' },
    { nome: 'Clínico Geral', icone: '⚕️' },
    { nome: 'Nutrição', icone: '🥗' }
  ];

  // Carregamento para Visão de Paciente
  const carregarDadosPaciente = async (categoriaSelecionada = categoriaAtiva, termoBusca = termo) => {
    try {
      setCarregando(true);
      const [dadosDestaque, listaPros] = await Promise.all([
        api.obterDestaque(),
        api.listarProfissionais({
          termo: termoBusca,
          especialidade: categoriaSelecionada,
          localizacao
        })
      ]);
      setDestaque(dadosDestaque);
      setProfissionais(listaPros || []);
    } catch (err) {
      console.error('Erro ao carregar profissionais:', err);
    } finally {
      setCarregando(false);
    }
  };

  // Carregamento para Visão de Profissional / Médico
  const carregarDadosProfissional = async () => {
    try {
      setCarregando(true);
      const [perfilPro, listaAgendamentos] = await Promise.all([
        api.obterMeuPerfilProfissional(),
        api.listarAgendamentos('todas')
      ]);

      if (perfilPro && !perfilPro.error) {
        setMeuPerfilPro(perfilPro);
        setDisponivelHoje(Boolean(perfilPro.disponivel_hoje));
      }
      setAgendamentosPro(Array.isArray(listaAgendamentos) ? listaAgendamentos : []);
    } catch (err) {
      console.error('Erro ao carregar dados do especialista:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleToggleDisponibilidade = async () => {
    const novoStatus = !disponivelHoje;
    setDisponivelHoje(novoStatus);
    setSalvandoStatus(true);
    try {
      await api.salvarCredenciamento({ disponivel_hoje: novoStatus });
    } catch (err) {
      console.error('Erro ao salvar status de disponibilidade:', err);
      setDisponivelHoje(!novoStatus);
    } finally {
      setSalvandoStatus(false);
    }
  };

  const handleBuscar = (e) => {
    e?.preventDefault();
    carregarDadosPaciente(categoriaAtiva, termo);
  };

  const handleCategoriaClick = (catNome) => {
    const novaCat = categoriaAtiva === catNome ? '' : catNome;
    setCategoriaAtiva(novaCat);
    carregarDadosPaciente(novaCat, termo);
  };

  const handleIniciarChat = async (proId) => {
    try {
      const conv = await api.iniciarOuBuscarConversa(proId);
      navigate('/mensagens', { state: { conversaId: conv.id } });
    } catch (err) {
      console.error('Erro ao abrir conversa:', err);
      navigate('/mensagens');
    }
  };

  const tipo = usuario?.tipo_usuario || 'paciente';

  return (
    <div className="app-container">
      {/* NAVBAR COM RBAC INTELIGENTE */}
      <Navbar />

      {/* ======================================================== */}
      {/* 1. VISÃO DO PROFISSIONAL / MÉDICO                       */}
      {/* ======================================================== */}
      {tipo === 'profissional' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 24px 80px', width: '100%' }}>
          
          {/* Header do Painel Clínico */}
          <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', borderRadius: '16px', padding: '32px', color: '#ffffff', marginBottom: '28px', boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🩺 Painel Clínico do Especialista
                </span>
                <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: '10px' }}>
                  Olá, {usuario?.nome || 'Doutor(a)'}!
                </h1>
                <p style={{ opacity: 0.9, fontSize: '14px', maxWidth: '600px', marginTop: '4px' }}>
                  Acompanhe seus atendimentos domiciliares agendados, gerencie sua disponibilidade e mantenha sua documentação do conselho em dia.
                </p>
              </div>

              {/* Card de Status de Disponibilidade Imediata */}
              <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', opacity: 0.8, textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>
                    Status no Marketplace
                  </span>
                  <strong style={{ fontSize: '15px' }}>
                    {disponivelHoje ? '🟢 Disponível para Visitas Hoje' : '⚪ Indisponível Hoje'}
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={handleToggleDisponibilidade}
                  disabled={salvandoStatus}
                  style={{
                    background: disponivelHoje ? '#10b981' : '#e2e8f0',
                    color: disponivelHoje ? '#ffffff' : '#334155',
                    border: 'none',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {salvandoStatus ? 'Salvando...' : disponivelHoje ? 'Desativar Hoje' : 'Ativar Hoje'}
                </button>
              </div>
            </div>
          </div>

          {/* Cards de Métricas do Médico */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Conselho & Registro</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                {meuPerfilPro?.registro_profissional || 'Pendente de Registro'}
              </div>
              <small style={{ color: '#059669', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                {meuPerfilPro?.verificado ? '✓ Homologado pelo Conselho' : '⏳ Em Análise Regulatória'}
              </small>
            </div>

            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Especialidade Principal</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                {meuPerfilPro?.especialidade_principal || 'Clínico Geral'}
              </div>
              <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                R$ {parseFloat(meuPerfilPro?.preco_base || 180).toFixed(2).replace('.', ',')} / {meuPerfilPro?.unidade_cobranca || 'visita'}
              </small>
            </div>

            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Atendimentos Agendados</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
                {agendamentosPro.length} visita(s)
              </div>
              <Link to="/consultas" style={{ color: '#0284c7', fontSize: '12px', fontWeight: '600', textDecoration: 'none', marginTop: '4px', display: 'inline-block' }}>
                Ver agenda completa →
              </Link>
            </div>

            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Avaliação dos Pacientes</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706', marginTop: '6px' }}>
                ⭐ {parseFloat(meuPerfilPro?.nota_media || 5.0).toFixed(1)} / 5.0
              </div>
              <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>Nota com base em visitas concluídas</small>
            </div>
          </div>

          {/* Ações Rápidas de Gestão */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
              Atalhos Rápidos de Operação
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              <Link to="/consultas" style={{ textDecoration: 'none', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'block' }}>
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>📅</span>
                <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block' }}>Minha Agenda de Visitas</strong>
                <small style={{ color: '#64748b' }}>Confirmar visitas domiciliares e check-in</small>
              </Link>

              <Link to="/mensagens" style={{ textDecoration: 'none', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'block' }}>
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>💬</span>
                <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block' }}>Chat com Pacientes</strong>
                <small style={{ color: '#64748b' }}>Tirar dúvidas e orientar preparo da visita</small>
              </Link>

              <Link to="/credenciamento" style={{ textDecoration: 'none', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'block' }}>
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>📋</span>
                <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block' }}>Meu Credenciamento</strong>
                <small style={{ color: '#64748b' }}>Atualizar registro do conselho e bio clínica</small>
              </Link>

              <Link to="/perfil" style={{ textDecoration: 'none', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1', display: 'block' }}>
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>⚙️</span>
                <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block' }}>Valores & Perfil</strong>
                <small style={{ color: '#64748b' }}>Alterar valor por hora/consulta e dados pessoais</small>
              </Link>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* 2. VISÃO DO ADMINISTRADOR                                */}
      {/* ======================================================== */}
      {tipo === 'admin' && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 24px 80px', width: '100%' }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '32px', color: '#ffffff', marginBottom: '28px' }}>
            <span style={{ background: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
              🛡️ MODO AUDITORIA & GOVERNANÇA
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: '800', marginTop: '10px' }}>
              Painel Geral de Conformidade HomeMed
            </h1>
            <p style={{ opacity: 0.8, fontSize: '14px', marginTop: '4px' }}>
              Acesse a homologação de conselhos de classe, validação de diplomas e supervisão clínica da rede.
            </p>
            <div style={{ marginTop: '20px' }}>
              <Link to="/admin" style={{ background: '#0284c7', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '700', fontSize: '14px', display: 'inline-block' }}>
                Abrir Auditoria de Especialistas →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VISÃO DO PACIENTE / FAMILIAR                          */}
      {/* ======================================================== */}
      {tipo === 'paciente' && (
        <>
          {/* HERO SECTION COM BUSCA DUPLA ELEVADA */}
          <header className="hero">
            <div className="hero-badge-pill">
              <span className="pulse-dot"></span>
              <span>Rede Certificada de Saúde Domiciliar</span>
            </div>
            <h1>
              O cuidado que você precisa,<br />
              <span className="text-gradient">no conforto do seu lar.</span>
            </h1>
            <p>
              Conecte-se com enfermeiros, fisioterapeutas, médicos e cuidadores verificados para atendimento humanizado e ágil.
            </p>
            
            <form className="search-bar" onSubmit={handleBuscar}>
              <div className="search-input">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                  type="text" 
                  placeholder="Especialidade ou sintoma..." 
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                />
              </div>
              <div className="divider-vertical"></div>
              <div className="search-input">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <input 
                  type="text" 
                  placeholder="Bairro ou CEP (ex: Bela Vista)" 
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-search">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                Buscar
              </button>
            </form>

            <div className="categories">
              {categorias.map(cat => (
                <button 
                  key={cat.nome} 
                  type="button" 
                  className={categoriaAtiva === cat.nome ? 'category-chip active' : 'category-chip'}
                  onClick={() => handleCategoriaClick(cat.nome)}
                >
                  <span className="chip-icon">{cat.icone}</span>
                  <span>{cat.nome}</span>
                </button>
              ))}
            </div>
          </header>

          {/* PROFISSIONAL EM DESTAQUE */}
          {destaque && (
            <section className="featured-section">
              <div className="featured-card">
                <div className="featured-img-container">
                  <img 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600&h=700" 
                    alt={destaque.nome} 
                    className="featured-img" 
                  />
                  <div className="featured-overlay-badge">
                    <span>⭐ {parseFloat(destaque.nota_media || 5.0).toFixed(1)}</span>
                    <small>Nota Máxima</small>
                  </div>
                </div>
                
                <div className="featured-content">
                  <div className="featured-badge-row">
                    <span className="featured-pill">⭐ ESPECIALISTA EM DESTAQUE</span>
                    <span className="verified-pill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Conselho Regional Verificado
                    </span>
                  </div>

                  <h2>{destaque.nome}</h2>
                  <h3>{destaque.especialidade_principal}</h3>
                  <p>{destaque.bio || 'Especialista com vasta experiência em reabilitação domiciliar, pós-operatório e suporte clínico humanizado.'}</p>
                  
                  <div className="featured-footer">
                    <div className="price-tag-group">
                      <span className="price-label">INVESTIMENTO ESTIMADO</span>
                      <div className="price-value">
                        R$ {parseFloat(destaque.preco_base).toFixed(2).replace('.', ',')}
                        <small>/{destaque.unidade_cobranca || 'sessão'}</small>
                      </div>
                    </div>

                    <div className="featured-actions">
                      <button className="btn-primary-white" onClick={() => handleIniciarChat(destaque.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Conversar Agora
                      </button>
                      <button className="btn-glass" onClick={() => handleIniciarChat(destaque.id)}>
                        Solicitar Visita
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* LISTA DE PROFISSIONAIS PRÓXIMOS */}
          <section className="nearby-section">
            <div className="section-header">
              <div>
                <div className="section-eyebrow">PROFISSIONAIS CREDENCIADOS</div>
                <h2>Próximos de você</h2>
                <p>Especialistas prontos para atendimento em domicílio com agendamento direto</p>
              </div>
              <button 
                type="button" 
                className="btn-link-all" 
                onClick={() => { setCategoriaAtiva(''); setTermo(''); carregarDadosPaciente('', ''); }}
              >
                <span>Ver todos ({profissionais.length})</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>

            {carregando ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Buscando profissionais disponíveis no banco de dados...</p>
              </div>
            ) : profissionais.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum profissional credenciado encontrado no momento.</p>
                <Link to="/cadastro?tipo=profissional" className="btn-primary" style={{ marginTop: '12px', display: 'inline-block' }}>
                  Cadastre-se como Profissional
                </Link>
              </div>
            ) : (
              <div className="cards-grid">
                {profissionais.map(pro => (
                  <div className="pro-card" key={pro.id}>
                    <div className="card-img-wrapper">
                      <img 
                        src={
                          pro.especialidade_principal?.includes('Enferm') 
                            ? 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=300'
                            : pro.especialidade_principal?.includes('Cuidador')
                            ? 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=400&h=300'
                            : pro.especialidade_principal?.includes('Médic') || pro.especialidade_principal?.includes('Clínic')
                            ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=300'
                            : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=300'
                        } 
                        alt={pro.nome} 
                      />
                      {Boolean(pro.disponivel_hoje) && (
                        <span className="card-badge-available">
                          <span className="status-indicator"></span>
                          Disponível Hoje
                        </span>
                      )}
                      <span className="card-rating-chip">
                        ⭐ {parseFloat(pro.nota_media || 5.0).toFixed(1)}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="pro-specialty-pill">{pro.especialidade_principal}</div>
                      <h4>{pro.nome}</h4>
                      <p>{pro.bio ? pro.bio.substring(0, 90) + '...' : 'Atendimento humanizado com foco na recuperação rápida e acolhimento domiciliar.'}</p>
                      
                      <div className="card-footer">
                        <div className="card-price-block">
                          <span className="price-small-label">VALOR POR {pro.unidade_cobranca?.toUpperCase() || 'SESSÃO'}</span>
                          <div className="price-small">
                            R$ {parseFloat(pro.preco_base).toFixed(0)}
                            <small>/{pro.unidade_cobranca || 'h'}</small>
                          </div>
                        </div>
                        <button className="btn-card-action" onClick={() => handleIniciarChat(pro.id)}>
                          <span>Mensagem</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed Saúde Digital
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed • Plataforma Certificada de Saúde Domiciliar</span>
          <a href="#">Termos de Uso</a>
          <a href="#">Privacidade & LGPD</a>
        </div>
      </footer>
    </div>
  );
}