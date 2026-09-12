import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [termo, setTermo] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [destaque, setDestaque] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const categorias = [
    { nome: 'Fisioterapia', icone: '🏃' },
    { nome: 'Enfermagem', icone: '🩺' },
    { nome: 'Cuidador', icone: '🤝' },
    { nome: 'Clínico Geral', icone: '⚕️' },
    { nome: 'Nutrição', icone: '🥗' }
  ];

  const carregarDados = async (categoriaSelecionada = categoriaAtiva, termoBusca = termo) => {
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

  useEffect(() => {
    carregarDados();
  }, []);

  const handleBuscar = (e) => {
    e?.preventDefault();
    carregarDados(categoriaAtiva, termo);
  };

  const handleCategoriaClick = (catNome) => {
    const novaCat = categoriaAtiva === catNome ? '' : catNome;
    setCategoriaAtiva(novaCat);
    carregarDados(novaCat, termo);
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

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <Link to="/home" className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          <strong>HomeMed</strong>
        </Link>
        <div className="nav-links">
          <Link to="/home" className="active">Início</Link>
          <Link to="/consultas">Consultas & Agendamentos</Link>
          <Link to="/mensagens">Mensagens</Link>
          <Link to="/credenciamento">Credenciamento</Link>
          <Link to="/admin">Administração</Link>
          <Link to="/perfil">Perfil</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" title="Notificações" aria-label="Notificações">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          </button>
          <Link to="/perfil" className="avatar-btn" title="Meu Perfil" aria-label="Meu Perfil">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
        </div>
      </nav>

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

      {/* PROFISSIONAL EM DESTAQUE - ESTILO STITCH LUXURY CARD */}
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
            onClick={() => { setCategoriaAtiva(''); setTermo(''); carregarDados('', ''); }}
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
            <p>Nenhum profissional encontrado para os filtros selecionados.</p>
            <button className="btn-outline" onClick={() => { setCategoriaAtiva(''); setTermo(''); carregarDados('', ''); }}>
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="cards-grid">
            {profissionais.map(pro => (
              <div className="pro-card" key={pro.id}>
                <div className="card-img-wrapper">
                  <img 
                    src={
                      pro.especialidade_principal.includes('Enferm') 
                        ? 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=300'
                        : pro.especialidade_principal.includes('Cuidador')
                        ? 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=400&h=300'
                        : pro.especialidade_principal.includes('Médic') || pro.especialidade_principal.includes('Clínic')
                        ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=300'
                        : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=300'
                    } 
                    alt={pro.nome} 
                  />
                  {pro.disponivel_hoje === 1 && (
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

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed Saúde Digital
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed • Plataforma Certificada de Saúde</span>
          <a href="#">Termos de Uso</a>
          <a href="#">Privacidade & LGPD</a>
        </div>
      </footer>
    </div>
  );
}