import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import './Perfil.css';

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('pessoal');
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Formulário do Paciente
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

  // Formulário do Profissional
  const [proData, setProData] = useState({
    registro_profissional: '',
    especialidade_principal: '',
    preco_base: '',
    unidade_cobranca: 'consulta',
    bio: '',
    disponivel_hoje: false
  });

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      if (rawUser) {
        setUsuario(JSON.parse(rawUser));
      }
    } catch (e) {}

    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setCarregando(true);
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      const u = rawUser ? JSON.parse(rawUser) : null;
      const isPro = u?.tipo_usuario === 'profissional';

      if (isPro) {
        const [dadosPro, consultas] = await Promise.all([
          api.obterMeuPerfilProfissional(),
          api.listarAgendamentos('concluidas')
        ]);

        if (dadosPro && !dadosPro.error) {
          setPerfil(dadosPro);
          setFormData({
            nome: dadosPro.nome || u?.nome || '',
            email: dadosPro.email || u?.email || '',
            telefone: dadosPro.telefone || u?.telefone || '',
            cpf: ''
          });
          setProData({
            registro_profissional: dadosPro.registro_profissional || '',
            especialidade_principal: dadosPro.especialidade_principal || '',
            preco_base: dadosPro.preco_base ? String(dadosPro.preco_base) : '',
            unidade_cobranca: dadosPro.unidade_cobranca || 'consulta',
            bio: dadosPro.bio || '',
            disponivel_hoje: Boolean(dadosPro.disponivel_hoje)
          });
        }
        setHistorico(Array.isArray(consultas) ? consultas : []);
      } else {
        const [dadosPerfil, consultasConcluidas] = await Promise.all([
          api.obterPerfilPaciente(),
          api.listarAgendamentos('concluidas')
        ]);

        if (dadosPerfil && !dadosPerfil.error) {
          setPerfil(dadosPerfil);
          setFormData({
            nome: dadosPerfil.nome || u?.nome || '',
            email: dadosPerfil.email || u?.email || '',
            telefone: dadosPerfil.telefone || u?.telefone || '',
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
        setHistorico(Array.isArray(consultasConcluidas) ? consultasConcluidas : []);
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso('');

    const isPro = usuario?.tipo_usuario === 'profissional';

    try {
      if (isPro) {
        await Promise.all([
          api.atualizarPerfilPaciente({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email
          }),
          api.salvarCredenciamento({
            registro_profissional: proData.registro_profissional,
            especialidade_principal: proData.especialidade_principal,
            preco_base: parseFloat(proData.preco_base) || 180.00,
            unidade_cobranca: proData.unidade_cobranca,
            bio: proData.bio,
            disponivel_hoje: proData.disponivel_hoje
          })
        ]);
        setMensagemSucesso('Dados do profissional atualizados com sucesso!');
      } else {
        await Promise.all([
          api.atualizarPerfilPaciente({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email
          }),
          api.salvarEnderecoPaciente(enderecoData)
        ]);
        setMensagemSucesso('Informações pessoais e endereço residencial salvos com sucesso!');
      }

      // Atualiza usuário no localStorage
      if (usuario) {
        const uAtualizado = { ...usuario, nome: formData.nome, email: formData.email };
        localStorage.setItem('@HomeMed:usuario', JSON.stringify(uAtualizado));
        setUsuario(uAtualizado);
      }

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

  const tipo = usuario?.tipo_usuario || 'paciente';

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTEÚDO PRINCIPAL DO PERFIL */}
      <div className="profile-layout">
        
        {/* COLUNA ESQUERDA: Card de Usuário e Estatísticas */}
        <div className="profile-sidebar">
          <div className="user-card-main">
            <div className="avatar-container">
              <img 
                src={perfil?.foto_url || (tipo === 'profissional' ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200')} 
                alt={perfil?.nome || usuario?.nome || 'Usuário'} 
              />
              <span className="avatar-verified-check">✓</span>
            </div>
            
            <div className="user-type-pill" style={{ background: tipo === 'profissional' ? '#ecfdf5' : '#e0f2fe', color: tipo === 'profissional' ? '#047857' : '#0369a1' }}>
              {tipo === 'profissional' ? '👨‍⚕️ ESPECIALISTA HOMEMED' : tipo === 'admin' ? '🛡️ ADMINISTRADOR' : '👤 PACIENTE VERIFICADO'}
            </div>
            <h2>{formData.nome || usuario?.nome || 'Carregando perfil...'}</h2>
            
            <div className="user-location">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>
                {tipo === 'profissional'
                  ? 'Atendimento Domiciliar Regional'
                  : perfil?.endereco?.cidade 
                  ? `${perfil.endereco.cidade}, ${perfil.endereco.uf}` 
                  : 'Endereço não cadastrado'}
              </span>
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
              <strong>{historico.length}</strong>
              <span>VISITAS REALIZADAS</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              {tipo === 'profissional' ? (
                <>
                  <strong>R$ {parseFloat(proData.preco_base || 180).toFixed(0)}</strong>
                  <span>VALOR BASE</span>
                </>
              ) : (
                <>
                  <strong>Ativo</strong>
                  <span>STATUS CONTA</span>
                </>
              )}
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
              {tipo === 'profissional' ? 'Dados Profissionais & Honorários' : 'Informações & Endereço Residencial'}
            </button>
            <button 
              type="button"
              className={abaAtiva === 'historico' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('historico')}
            >
              Histórico ({historico.length})
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

            {/* ABA 1: INFORMAÇÕES PESSOAIS / PROFISSIONAIS */}
            {abaAtiva === 'pessoal' && (
              <form onSubmit={handleSalvarPerfil} className="profile-form">
                
                {/* DADOS CADASTRAIS */}
                <div className="form-section-card">
                  <div className="section-title-row">
                    <h3>Identificação Oficial</h3>
                    <span className="section-chip">Dados de Contato</span>
                  </div>
                  <p>Informações de identificação sob sigilo e criptografia.</p>
                  
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
                      <label>E-mail Cadastrado</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    {tipo === 'paciente' && (
                      <div className="field-group">
                        <label>CPF (Mascarado por LGPD)</label>
                        <input 
                          type="text" 
                          value={formatarCpfLGPD(formData.cpf)} 
                          disabled
                          className="input-disabled"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* SE FOR PROFISSIONAL: CAMPOS CLÍNICOS E HONORÁRIOS */}
                {tipo === 'profissional' && (
                  <div className="form-section-card">
                    <div className="section-title-row">
                      <h3>Atuação Médica & Honorários</h3>
                      <span className="section-chip" style={{ background: '#ecfdf5', color: '#047857' }}>Conselho Profissional</span>
                    </div>

                    <div className="form-grid-2">
                      <div className="field-group">
                        <label>Conselho e Registro Profissional</label>
                        <input 
                          type="text" 
                          value={proData.registro_profissional} 
                          onChange={(e) => setProData({ ...proData, registro_profissional: e.target.value })}
                          placeholder="Ex: CRM-SP 123456"
                          required
                        />
                      </div>

                      <div className="field-group">
                        <label>Especialidade Principal</label>
                        <input 
                          type="text" 
                          value={proData.especialidade_principal} 
                          onChange={(e) => setProData({ ...proData, especialidade_principal: e.target.value })}
                          placeholder="Ex: Clínica Geral"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-grid-2" style={{ marginTop: '14px' }}>
                      <div className="field-group">
                        <label>Preço Base por Atendimento (R$)</label>
                        <input 
                          type="number" 
                          value={proData.preco_base} 
                          onChange={(e) => setProData({ ...proData, preco_base: e.target.value })}
                          placeholder="180.00"
                          required
                        />
                      </div>

                      <div className="field-group">
                        <label>Unidade de Cobrança</label>
                        <select 
                          value={proData.unidade_cobranca} 
                          onChange={(e) => setProData({ ...proData, unidade_cobranca: e.target.value })}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        >
                          <option value="consulta">por consulta / visita</option>
                          <option value="hora">por hora de atendimento</option>
                          <option value="sessão">por sessão</option>
                          <option value="turno">por plantão (12h)</option>
                        </select>
                      </div>
                    </div>

                    <div className="field-group" style={{ marginTop: '14px' }}>
                      <label>Mini-Bio / Apresentação aos Pacientes</label>
                      <textarea 
                        rows="3"
                        value={proData.bio} 
                        onChange={(e) => setProData({ ...proData, bio: e.target.value })}
                        placeholder="Descreva sua experiência clínica e procedimentos atendidos em domicílio."
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                )}

                {/* SE FOR PACIENTE: ENDEREÇO RESIDENCIAL */}
                {tipo === 'paciente' && (
                  <div className="form-section-card">
                    <div className="section-title-row">
                      <h3>Endereço Principal para Visitas Domiciliares</h3>
                      <span className="section-chip required">Visitas Presenciais</span>
                    </div>
                    <p>Utilizado para cálculo de rotas dos profissionais que atendem sua residência.</p>

                    <div className="form-grid-3-1">
                      <div className="field-group">
                        <label>Logradouro (Rua, Avenida)</label>
                        <input 
                          type="text" 
                          value={enderecoData.logradouro} 
                          onChange={(e) => setEnderecoData({ ...enderecoData, logradouro: e.target.value })}
                          placeholder="Ex: Rua das Flores"
                        />
                      </div>
                      <div className="field-group">
                        <label>Número</label>
                        <input 
                          type="text" 
                          value={enderecoData.numero} 
                          onChange={(e) => setEnderecoData({ ...enderecoData, numero: e.target.value })}
                          placeholder="123"
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
                          placeholder="Bairro"
                        />
                      </div>
                      <div className="field-group">
                        <label>Cidade</label>
                        <input 
                          type="text" 
                          value={enderecoData.cidade} 
                          onChange={(e) => setEnderecoData({ ...enderecoData, cidade: e.target.value })}
                          placeholder="Cidade"
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
                        />
                      </div>
                    </div>

                    <div className="field-group" style={{ maxWidth: '240px', marginTop: '14px' }}>
                      <label>CEP</label>
                      <input 
                        type="text" 
                        value={enderecoData.cep} 
                        onChange={(e) => setEnderecoData({ ...enderecoData, cep: e.target.value })}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                )}

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
                <p>Histórico completo de atendimentos presenciais concluídos.</p>
                
                {historico.length === 0 ? (
                  <div className="empty-history-box">
                    <p>Nenhuma consulta concluída no momento.</p>
                    <button className="btn-link-action" onClick={() => navigate(tipo === 'profissional' ? '/consultas' : '/home')}>
                      {tipo === 'profissional' ? 'Acessar Agenda de Visitas' : 'Encontrar Especialistas na Home'}
                    </button>
                  </div>
                ) : (
                  <div className="history-cards-list">
                    {historico.map(h => (
                      <div key={h.id} className="history-item-box">
                        <div className="history-item-top">
                          <div>
                            <h4>{tipo === 'profissional' ? (h.paciente_nome || 'Paciente') : (h.profissional_nome || 'Profissional')}</h4>
                            <span className="history-pro-specialty">{h.especialidade_principal}</span>
                          </div>
                          <span className="status-badge-done">Atendimento Concluído</span>
                        </div>
                        
                        <div className="history-item-meta">
                          <span>📅 {new Date(h.data_hora_visita).toLocaleDateString('pt-BR')} às {new Date(h.data_hora_visita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>💰 R$ {parseFloat(h.valor_total).toFixed(2).replace('.', ',')}</span>
                        </div>
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
                <p>No HomeMed, seus registros de saúde e dados sensíveis são protegidos por criptografia de ponta a ponta.</p>
                
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
                      <strong>Resolução CFM nº 2.314/2022</strong>
                      <p>Atendimentos e telemedicina em conformidade estrita com o Conselho Federal de Medicina.</p>
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
        </div>
      </footer>
    </div>
  );
}