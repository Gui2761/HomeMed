import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Perfil.css';

export default function Perfil() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('pessoal');
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  const [enderecoData, setEnderecoData] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });

  const carregarPerfil = async () => {
    try {
      setCarregando(true);
      const [dadosPerfil, consultasConcluidas] = await Promise.all([
        api.obterPerfilPaciente(),
        api.listarAgendamentos('concluidas')
      ]);

      if (dadosPerfil && !dadosPerfil.error) {
        setPerfil(dadosPerfil);
        setFormData({
          nome: dadosPerfil.nome || '',
          email: dadosPerfil.email || '',
          telefone: dadosPerfil.telefone || '',
          cpf: dadosPerfil.cpf || ''
        });

        if (dadosPerfil.endereco) {
          setEnderecoData({
            logradouro: dadosPerfil.endereco.logradouro || '',
            numero: dadosPerfil.endereco.numero || '',
            complemento: dadosPerfil.endereco.complemento || '',
            bairro: dadosPerfil.endereco.bairro || '',
            cidade: dadosPerfil.endereco.cidade || '',
            uf: dadosPerfil.endereco.uf || '',
            cep: dadosPerfil.endereco.cep || ''
          });
        }
      }
      setHistorico(consultasConcluidas || []);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso('');
    try {
      await Promise.all([
        api.atualizarPerfilPaciente({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email
        }),
        api.salvarEnderecoPaciente(enderecoData)
      ]);
      setMensagemSucesso('Dados cadastrais e endereço salvos com sucesso!');
      await carregarPerfil();
    } catch (err) {
      console.error('Erro ao salvar dados:', err);
      alert('Erro ao salvar os dados.');
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@HomeMed:token');
    localStorage.removeItem('@HomeMed:usuario');
    navigate('/');
  };

  const formatarCpfLGPD = (cpf) => {
    if (!cpf || cpf.length < 11) return '***.***.***-**';
    return `***.${cpf.substring(4, 7)}.***-**`;
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
          <Link to="/admin">Administração</Link>
          <Link to="/perfil" className="active">Perfil</Link>
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

      {/* CONTEÚDO PRINCIPAL DO PERFIL */}
      <div className="profile-layout">
        
        {/* COLUNA ESQUERDA: Card de Usuário e Estatísticas */}
        <div className="profile-sidebar">
          <div className="user-card-main">
            <div className="avatar-container">
              <img 
                src={perfil?.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200'} 
                alt={perfil?.nome || 'Usuário'} 
              />
              <span className="avatar-verified-check">✓</span>
            </div>
            
            <div className="user-type-pill">PACIENTE VERIFICADO</div>
            <h2>{perfil?.nome || 'Carregando perfil...'}</h2>
            
            <div className="user-location">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>{perfil?.endereco ? `${perfil.endereco.cidade}, ${perfil.endereco.uf}` : 'São Paulo, SP'}</span>
            </div>

            <div className="profile-buttons">
              <button className="btn-edit-profile" onClick={() => setAbaAtiva('pessoal')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Editar Perfil
              </button>
              <button onClick={handleLogout} className="btn-logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Sair da Conta
              </button>
            </div>
          </div>

          <div className="stats-box">
            <div className="stat-item">
              <strong>{perfil?.estatisticas?.realizadas || historico.length}</strong>
              <span>VISITAS REALIZADAS</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <strong>{perfil?.estatisticas?.favoritos || 3}</strong>
              <span>ESPECIALISTAS SALVOS</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Abas e Conteúdo Dinâmico */}
        <div className="profile-content-area">
          <div className="profile-tabs">
            <button 
              type="button"
              className={abaAtiva === 'pessoal' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('pessoal')}
            >
              Informações & Endereço
            </button>
            <button 
              type="button"
              className={abaAtiva === 'historico' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('historico')}
            >
              Histórico Clínico ({historico.length})
            </button>
            <button 
              type="button"
              className={abaAtiva === 'config' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('config')}
            >
              Privacidade LGPD
            </button>
          </div>

          <div className="tab-pane-content">
            {mensagemSucesso && (
              <div className="profile-alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{mensagemSucesso}</span>
              </div>
            )}

            {/* ABA 1: INFORMAÇÕES PESSOAIS & ENDEREÇO */}
            {abaAtiva === 'pessoal' && (
              <form onSubmit={handleSalvarPerfil} className="profile-form">
                <div className="form-section-card">
                  <div className="section-title-row">
                    <h3>Dados Cadastrais</h3>
                    <span className="section-chip">Identificação Oficial</span>
                  </div>
                  <p>Suas informações de contato sob proteção de sigilo médico e LGPD.</p>
                  
                  <div className="form-grid-2">
                    <div className="field-group">
                      <label>Nome Completo</label>
                      <input 
                        type="text" 
                        value={formData.nome} 
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Telefone / WhatsApp</label>
                      <input 
                        type="text" 
                        value={formData.telefone} 
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '14px' }}>
                    <div className="field-group">
                      <label>E-mail</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>CPF (Mascarado por LGPD)</label>
                      <input 
                        type="text" 
                        value={formatarCpfLGPD(formData.cpf)} 
                        disabled
                        className="input-disabled"
                      />
                    </div>
                  </div>
                </div>

                {/* ENDEREÇO RESIDENCIAL PARA ATENDIMENTO DOMICILIAR (RN01) */}
                <div className="form-section-card">
                  <div className="section-title-row">
                    <h3>Endereço Principal para Visitas Domiciliares</h3>
                    <span className="section-chip required">Obrigatório para Consultas</span>
                  </div>
                  <p>Este endereço é utilizado pelos especialistas para cálculo de rota e atendimento presencial.</p>

                  <div className="form-grid-3-1">
                    <div className="field-group">
                      <label>Logradouro (Rua, Avenida)</label>
                      <input 
                        type="text" 
                        value={enderecoData.logradouro} 
                        onChange={(e) => setEnderecoData({ ...enderecoData, logradouro: e.target.value })}
                        placeholder="Ex: Rua das Flores"
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Número</label>
                      <input 
                        type="text" 
                        value={enderecoData.numero} 
                        onChange={(e) => setEnderecoData({ ...enderecoData, numero: e.target.value })}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-grid-4" style={{ marginTop: '14px' }}>
                    <div className="field-group">
                      <label>Complemento</label>
                      <input 
                        type="text" 
                        value={enderecoData.complemento} 
                        onChange={(e) => setEnderecoData({ ...enderecoData, complemento: e.target.value })}
                        placeholder="Apto 45"
                      />
                    </div>
                    <div className="field-group">
                      <label>Bairro</label>
                      <input 
                        type="text" 
                        value={enderecoData.bairro} 
                        onChange={(e) => setEnderecoData({ ...enderecoData, bairro: e.target.value })}
                        placeholder="Bela Vista"
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>Cidade</label>
                      <input 
                        type="text" 
                        value={enderecoData.cidade} 
                        onChange={(e) => setEnderecoData({ ...enderecoData, cidade: e.target.value })}
                        placeholder="São Paulo"
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label>UF</label>
                      <input 
                        type="text" 
                        value={enderecoData.uf} 
                        onChange={(e) => setEnderecoData({ ...enderecoData, uf: e.target.value })}
                        placeholder="SP"
                        maxLength="2"
                        required
                      />
                    </div>
                  </div>

                  <div className="field-group" style={{ maxWidth: '240px', marginTop: '14px' }}>
                    <label>CEP</label>
                    <input 
                      type="text" 
                      value={enderecoData.cep} 
                      onChange={(e) => setEnderecoData({ ...enderecoData, cep: e.target.value })}
                      placeholder="01310-100"
                      required
                    />
                  </div>
                </div>

                <div className="form-submit-row">
                  <button 
                    type="submit" 
                    className="btn-salvar-perfil" 
                    disabled={salvando}
                  >
                    {salvando ? 'Salvando Alterações...' : 'Salvar Informações'}
                  </button>
                </div>
              </form>
            )}

            {/* ABA 2: HISTÓRICO DE CONSULTAS */}
            {abaAtiva === 'historico' && (
              <div className="history-tab-pane">
                <div className="section-title-row">
                  <h3>Histórico de Visitas Domiciliares</h3>
                  <span className="section-chip">Prontuário Integrado</span>
                </div>
                <p>Histórico completo de atendimentos presenciais concluídos e avaliações registradas.</p>
                
                {historico.length === 0 ? (
                  <div className="empty-history-box">
                    <p>Nenhuma consulta concluída no momento.</p>
                    <button className="btn-link-action" onClick={() => navigate('/home')}>
                      Encontrar Especialistas na Home
                    </button>
                  </div>
                ) : (
                  <div className="history-cards-list">
                    {historico.map(h => (
                      <div key={h.id} className="history-item-box">
                        <div className="history-item-top">
                          <div>
                            <h4>{h.profissional_nome}</h4>
                            <span className="history-pro-specialty">{h.especialidade_principal}</span>
                          </div>
                          <span className="status-badge-done">Atendimento Concluído</span>
                        </div>
                        
                        <div className="history-item-meta">
                          <span>📅 {new Date(h.data_hora_visita).toLocaleDateString('pt-BR')} às {new Date(h.data_hora_visita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>💰 R$ {parseFloat(h.valor_total).toFixed(2).replace('.', ',')}</span>
                        </div>

                        {h.avaliacao_nota && (
                          <div className="history-rating-feedback">
                            ⭐ Nota enviada: {h.avaliacao_nota}/5 {h.avaliacao_comentario ? `("${h.avaliacao_comentario}")` : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ABA 3: CONFIGURAÇÕES E LGPD */}
            {abaAtiva === 'config' && (
              <div className="lgpd-tab-pane">
                <div className="section-title-row">
                  <h3>Privacidade & Segurança de Dados</h3>
                  <span className="section-chip">Conformidade CFM & LGPD</span>
                </div>
                <p>No HomeMed, seus registros de saúde e dados sensíveis são protegidos por criptografia de nível hospitalar.</p>
                
                <div className="security-cards-grid">
                  <div className="security-feature-card">
                    <div className="security-icon">🔒</div>
                    <div>
                      <strong>Criptografia em Repouso & Trânsito</strong>
                      <p>Todos os registros, prontuários e chats são protegidos por criptografia AES-256 e TLS 1.3.</p>
                    </div>
                  </div>

                  <div className="security-feature-card">
                    <div className="security-icon">🛡️</div>
                    <div>
                      <strong>Direito ao Esquecimento LGPD</strong>
                      <p>Você pode solicitar a exportação ou exclusão dos seus dados cadastrais a qualquer momento pelo suporte.</p>
                    </div>
                  </div>

                  <div className="security-feature-card">
                    <div className="security-icon">🩺</div>
                    <div>
                      <strong>Normas do Conselho Federal de Medicina</strong>
                      <p>Atendimentos domiciliares e prontuários respeitam integralmente a Resolução CFM nº 2.314/2022.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed Saúde Digital
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed • Gestão de Perfil</span>
          <a href="#">Privacidade</a>
          <a href="#">Termos de Uso</a>
        </div>
      </footer>
    </div>
  );
}