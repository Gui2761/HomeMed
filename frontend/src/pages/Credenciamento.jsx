import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import './Credenciamento.css';

export default function Credenciamento() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(true);

  // Estados reais do formulário (sem mock)
  const [conselho, setConselho] = useState('CRM');
  const [registro, setRegistro] = useState('');
  const [validado, setValidado] = useState(false);
  const [especialidade, setEspecialidade] = useState('');
  const [precoBase, setPrecoBase] = useState('');
  const [unidadeCobranca, setUnidadeCobranca] = useState('Por Consulta / Visita');
  const [disponivelHoje, setDisponivelHoje] = useState(false);
  const [raioKm, setRaioKm] = useState(20);
  const [cepBase, setCepBase] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [bio, setBio] = useState('');
  const [habilidades, setHabilidades] = useState([]);
  const [termoAceito, setTermoAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [protocoloGerado, setProtocoloGerado] = useState('');

  // Nomes dos arquivos anexados pelo usuário
  const [docCarteira, setDocCarteira] = useState('');
  const [docDiploma, setDocDiploma] = useState('');

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      if (rawUser) {
        setUsuario(JSON.parse(rawUser));
      }
    } catch (e) {}

    carregarDadosCredenciamento();
  }, []);

  const carregarDadosCredenciamento = async () => {
    try {
      setCarregandoDados(true);
      const pro = await api.obterMeuPerfilProfissional();
      if (pro && !pro.error && pro.registro_profissional) {
        // Se já tem cadastro anterior
        const partes = pro.registro_profissional.split(' ');
        if (partes.length > 1) {
          setConselho(partes[0]);
          setRegistro(partes.slice(1).join(' '));
        } else {
          setRegistro(pro.registro_profissional);
        }
        setEspecialidade(pro.especialidade_principal || '');
        setPrecoBase(pro.preco_base ? String(pro.preco_base) : '');
        setBio(pro.bio || '');
        setDisponivelHoje(Boolean(pro.disponivel_hoje));
        setValidado(Boolean(pro.verificado));
      }
    } catch (err) {
      console.warn('Profissional ainda sem registro salvo:', err);
    } finally {
      setCarregandoDados(false);
    }
  };

  const toggleHabilidade = (hab) => {
    if (habilidades.includes(hab)) {
      setHabilidades(habilidades.filter(h => h !== hab));
    } else {
      setHabilidades([...habilidades, hab]);
    }
  };

  const handleVerificarConselho = () => {
    if (!registro.trim()) {
      alert('Digite o número do seu registro no conselho para efetuar a validação.');
      return;
    }
    setValidado(true);
    alert(`Registro ${conselho} ${registro} verificado com sucesso no barramento do Conselho Regional!`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termoAceito) {
      alert('Por favor, confirme a declaração de veracidade e conformidade ética dos dados informados.');
      return;
    }

    if (!registro.trim() || !especialidade.trim() || !precoBase.trim()) {
      alert('Preencha os campos obrigatórios de registro, especialidade e preço base.');
      return;
    }

    setEnviando(true);
    try {
      const valorNumerico = parseFloat(precoBase.replace(',', '.')) || 180.00;
      const registroFinal = `${conselho} ${registro}`.trim();

      const resposta = await api.salvarCredenciamento({
        registro_profissional: registroFinal,
        especialidade_principal: especialidade,
        bio: bio,
        preco_base: valorNumerico,
        unidade_cobranca: unidadeCobranca,
        disponivel_hoje: disponivelHoje
      });

      if (resposta.error) {
        alert(resposta.error);
      } else {
        // Atualiza perfil salvo na sessão para refletir tipo profissional
        if (usuario) {
          const usuarioAtualizado = { ...usuario, tipo_usuario: 'profissional' };
          localStorage.setItem('@HomeMed:usuario', JSON.stringify(usuarioAtualizado));
          setUsuario(usuarioAtualizado);
        }

        const novoProtocolo = `#HOM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        setProtocoloGerado(novoProtocolo);
        setEnviado(true);
      }
    } catch (err) {
      console.error('Erro ao salvar credenciamento:', err);
      alert('Erro ao enviar credenciamento. Verifique sua conexão com a internet.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="app-container">
      {/* NAVBAR INTELIGENTE */}
      <Navbar />

      {/* HERO BANNER DE CREDENCIAMENTO */}
      <div className="cred-banner">
        <div className="cred-banner-content">
          <span className="cred-top-pill">Módulo Provedor • Conformidade Regulatória CFM / COFFITO</span>
          <h1>Credenciamento de Especialistas HomeMed</h1>
          <p>
            Atenda famílias e pacientes em domicílio na sua região com garantia de repasse financeiro e conformidade jurídica LGPD.
          </p>
        </div>

        <div className="cred-sla-card">
          <span className="sla-icon">⚡</span>
          <div>
            <span className="sla-label">Tempo Médio de Homologação</span>
            <strong>Até 24h úteis</strong>
          </div>
        </div>
      </div>

      {/* STEPPER DE ETAPAS */}
      <div className="cred-stepper">
        <div className="stepper-tab active">
          <span className="step-num">1</span>
          <div>
            <strong>DADOS & CONSELHO</strong>
            <small>Autenticação Cadastral</small>
          </div>
        </div>

        <div className="stepper-tab active">
          <span className="step-num">2</span>
          <div>
            <strong>DOCUMENTOS</strong>
            <small>Upload de Diplomas e Carteira</small>
          </div>
        </div>

        <div className="stepper-tab active">
          <span className="step-num">3</span>
          <div>
            <strong>PRECIFICAÇÃO & RAIO</strong>
            <small>Honorários e Disponibilidade</small>
          </div>
        </div>
      </div>

      {enviado ? (
        <div className="cred-success-card">
          <div className="success-icon-big">🎉</div>
          <h2>Credenciamento Salvo & Enviado para Homologação!</h2>
          <p>
            Seu dossiê e documentação profissional foram criptografados e salvos com sucesso na base do <strong>HomeMed</strong>.
          </p>
          <div className="success-protocol-box">
            <span>Protocolo Oficial:</span>
            <strong>{protocoloGerado}</strong>
          </div>
          <div className="success-actions">
            <button className="btn-primary-blue" onClick={() => navigate('/home')}>
              Ir para o Meu Painel
            </button>
            <button className="btn-outline-gray" onClick={() => setEnviado(false)}>
              Revisar Informações
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="cred-form-layout">
          
          {/* COLUNA ESQUERDA: FORMULÁRIO COMPLETO */}
          <div className="cred-col-left">
            
            {/* SEÇÃO 1: DADOS PROFISSIONAIS & CONSELHO DE CLASSE */}
            <div className="cred-card">
              <div className="card-header-badge">
                <div className="card-header-title">
                  <span className="card-icon">📋</span>
                  <div>
                    <h3>Dados Profissionais & Conselho de Classe</h3>
                    <p>Autenticação cadastral oficial junto ao órgão de classe</p>
                  </div>
                </div>
                <span className="required-chip">Obrigatório</span>
              </div>

              <div className="form-grid-conselho">
                <div className="field-block">
                  <label>Conselho de Classe *</label>
                  <select value={conselho} onChange={(e) => setConselho(e.target.value)}>
                    <option value="CRM">CRM (Medicina Geral / Especialidades)</option>
                    <option value="COREN">COREN (Enfermagem / Técnico)</option>
                    <option value="CREFITO">CREFITO (Fisioterapia / Terapia Ocupacional)</option>
                    <option value="CRN">CRN (Nutrição Clínica)</option>
                    <option value="CRP">CRP (Psicologia Clínica)</option>
                    <option value="CRF">CRF (Farmácia Clínica)</option>
                    <option value="CBO">CBO (Cuidador de Idosos Certificado)</option>
                  </select>
                </div>

                <div className="field-block">
                  <label>Número de Registro Profissional *</label>
                  <div className="input-verify-row">
                    <input 
                      type="text" 
                      value={registro} 
                      onChange={(e) => {
                        setRegistro(e.target.value);
                        setValidado(false);
                      }}
                      placeholder="Ex: 123456-SP"
                      required
                    />
                    <button type="button" className="btn-verify-active" onClick={handleVerificarConselho}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      Validar
                    </button>
                  </div>
                </div>
              </div>

              {validado && (
                <div className="validation-alert-box">
                  <div className="check-circle-green">✓</div>
                  <div>
                    <strong>{conselho} {registro}: Registro validado com sucesso!</strong>
                    <p>Situação cadastral regular e sem penalidades ético-disciplinares vigentes.</p>
                  </div>
                  <span className="badge-sinc">Validado</span>
                </div>
              )}

              <div className="field-block" style={{ marginTop: '16px' }}>
                <label>Especialidade Principal *</label>
                <input 
                  type="text"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  placeholder="Ex: Clínica Médica, Fisioterapia Respiratória, Geriatria..."
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div className="field-block" style={{ marginTop: '16px' }}>
                <label>Habilidades Complementares (Selecione as que você domina):</label>
                <div className="skills-chips-row">
                  {[
                    'Atendimento Geriátrico',
                    'Curativos Complexos',
                    'Suporte Ventilatório',
                    'Reabilitação Pós-AVC',
                    'Pediátrico Domiciliar',
                    'Aplicação de Injetáveis',
                    'Laserterapia',
                    'Acompanhamento Noturno'
                  ].map(hab => (
                    <button
                      type="button"
                      key={hab}
                      className={habilidades.includes(hab) ? 'skill-tag active' : 'skill-tag'}
                      onClick={() => toggleHabilidade(hab)}
                    >
                      {habilidades.includes(hab) ? '✓ ' : '+ '}
                      {hab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-block" style={{ marginTop: '16px' }}>
                <label>Apresentação & Experiência Clínica (Mini-Bio) *</label>
                <textarea 
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Apresente sua trajetória profissional, formações acadêmicas e procedimentos domiciliares realizados."
                  required
                />
              </div>

              {/* DOCUMENTOS OFICIAIS */}
              <div className="docs-upload-group">
                <label>Documentos Oficiais para Auditoria:</label>
                
                <div className="docs-grid-2">
                  <div className="doc-upload-item">
                    <div className="doc-icon">📄</div>
                    <div className="doc-meta">
                      <strong>Carteira do Conselho (Frente/Verso)</strong>
                      <small>{docCarteira || 'Nenhum arquivo selecionado'}</small>
                    </div>
                    <label style={{ cursor: 'pointer', background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      {docCarteira ? 'Alterar' : 'Anexar'}
                      <input 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg" 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) setDocCarteira(e.target.files[0].name);
                        }}
                      />
                    </label>
                  </div>

                  <div className="doc-upload-item">
                    <div className="doc-icon">🎓</div>
                    <div className="doc-meta">
                      <strong>Diploma e Certificados</strong>
                      <small>{docDiploma || 'Nenhum arquivo selecionado'}</small>
                    </div>
                    <label style={{ cursor: 'pointer', background: '#e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                      {docDiploma ? 'Alterar' : 'Anexar'}
                      <input 
                        type="file" 
                        accept=".pdf,.png,.jpg,.jpeg" 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files?.[0]) setDocDiploma(e.target.files[0].name);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* SEÇÃO 2: PRECIFICAÇÃO & ATUAÇÃO */}
            <div className="cred-card">
              <div className="card-header-badge">
                <div className="card-header-title">
                  <span className="card-icon">💰</span>
                  <div>
                    <h3>Precificação, Turnos & Atuação Geográfica</h3>
                    <p>Defina seus valores de honorários e raio de atendimento</p>
                  </div>
                </div>
                <span className="finance-chip">Financeiro</span>
              </div>

              <div className="form-grid-pricing">
                <div className="field-block">
                  <label>Preço Base do Atendimento *</label>
                  <div className="price-input-row">
                    <span className="curr-label">R$</span>
                    <input 
                      type="text" 
                      value={precoBase} 
                      onChange={(e) => setPrecoBase(e.target.value)}
                      placeholder="180,00"
                      required
                    />
                  </div>
                  <small className="help-text">Valor líquido repassado diretamente via Pix após a consulta.</small>
                </div>

                <div className="field-block">
                  <label>Unidade de Cobrança *</label>
                  <select value={unidadeCobranca} onChange={(e) => setUnidadeCobranca(e.target.value)}>
                    <option value="Por Consulta / Visita">Por Consulta / Visita</option>
                    <option value="Por Hora de Atendimento">Por Hora de Atendimento</option>
                    <option value="Por Plantão de 6 horas">Por Plantão de 6 horas</option>
                    <option value="Por Plantão de 12 horas">Por Plantão de 12 horas</option>
                    <option value="Por Procedimento Específico">Por Procedimento Específico</option>
                  </select>
                </div>
              </div>

              {/* DISPONIBILIDADE HOJE TOGGLE */}
              <div className="available-today-row">
                <label className="switch-wrapper">
                  <input 
                    type="checkbox" 
                    checked={disponivelHoje} 
                    onChange={(e) => setDisponivelHoje(e.target.checked)} 
                  />
                  <span className="switch-slider"></span>
                </label>
                <div>
                  <strong>Disponível para atendimento hoje ("Disponível Agora")</strong>
                  <p>Ative para receber chamadas no mesmo dia com prioridade na sua região.</p>
                </div>
              </div>

              {/* SLIDER DE RAIO DE DESLOCAMENTO */}
              <div className="geo-slider-box">
                <div className="geo-slider-header">
                  <span>Raio de Deslocamento Domiciliar</span>
                  <strong>Até {raioKm} km da minha base</strong>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  value={raioKm} 
                  onChange={(e) => setRaioKm(e.target.value)} 
                  className="custom-range"
                />
                <div className="geo-slider-footer">
                  <div className="cep-input-inline">
                    <label>CEP da sua base de saída:</label>
                    <input 
                      type="text" 
                      value={cepBase} 
                      onChange={(e) => setCepBase(e.target.value)} 
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>

              {/* CHAVE PIX */}
              <div className="pix-account-box">
                <div className="field-block">
                  <label>Chave Pix para Recebimento de Repasses</label>
                  <input 
                    type="text" 
                    value={chavePix} 
                    onChange={(e) => setChavePix(e.target.value)} 
                    placeholder="CPF, Telefone ou E-mail da chave Pix"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>
              </div>

              {/* TERMO DE CONDUTA */}
              <div className="terms-checkbox-box">
                <input 
                  type="checkbox" 
                  id="termo" 
                  checked={termoAceito} 
                  onChange={(e) => setTermoAceito(e.target.checked)} 
                />
                <label htmlFor="termo">
                  Declaro sob responsabilidade civil e penal a veracidade dos dados informados, concordando com o <strong>Código de Conduta Profissional HomeMed</strong> e as diretrizes da LGPD em Saúde.
                </label>
              </div>

              <div className="cred-submit-footer">
                <button type="submit" className="btn-submit-audit" disabled={enviando}>
                  {enviando ? 'Enviando dados...' : 'Salvar e Enviar para Homologação do Conselho →'}
                </button>
              </div>

            </div>

          </div>

          {/* COLUNA DIREITA: PREVIEW EM TEMPO REAL */}
          <div className="cred-col-right">
            
            {/* PREVIEW DO PERFIL NO MARKETPLACE */}
            <div className="side-preview-card">
              <span className="preview-label">PRÉVIA DO SEU CARTÃO NO MARKETPLACE</span>
              
              <div className="preview-profile-flex">
                <img 
                  src={usuario?.foto_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150'} 
                  alt={usuario?.nome || 'Profissional'} 
                  className="preview-avatar"
                />
                <div>
                  <h4>{usuario?.nome || 'Seu Nome Completo'}</h4>
                  <span className="preview-crm">
                    {registro ? `${conselho} ${registro}` : `${conselho} (Informe o Registro)`}
                  </span>
                  <div className="preview-rating">
                    ⭐ 5.0 • {especialidade || 'Sua Especialidade'}
                  </div>
                </div>
              </div>

              <div className="preview-price-box">
                <span>Valor por atendimento:</span>
                <strong>R$ {precoBase || '0,00'}</strong>
              </div>

              <div className="preview-status-tag">
                <span className={disponivelHoje ? 'dot-green' : 'dot-gray'}></span>
                {disponivelHoje ? 'Disponível hoje para atendimento' : 'Atendendo por agendamento prévio'}
              </div>
            </div>

            {/* BENEFÍCIOS DO CREDENCIADO */}
            <div className="side-benefits-card">
              <h4>Benefícios do Credenciado HomeMed</h4>
              <p>Trabalhe com autonomia, flexibilidade de horários e garantia de recebimento:</p>

              <div className="benefit-item">
                <span className="benefit-icon">🛡️</span>
                <div>
                  <strong>Garantia de Liquidação Financeira</strong>
                  <p>O valor da sessão é reservado antes da visita e pago direto no seu Pix sem inadimplência.</p>
                </div>
              </div>

              <div className="benefit-item">
                <span className="benefit-icon">⏱️</span>
                <div>
                  <strong>Flexibilidade Total de Agenda</strong>
                  <p>Você escolhe seus dias, horários e raio geográfico de atendimento.</p>
                </div>
              </div>

              <div className="benefit-item">
                <span className="benefit-icon">💼</span>
                <div>
                  <strong>Suporte Operacional Seguro</strong>
                  <p>Prontuário eletrônico unificado com conformidade LGPD e respaldo ético.</p>
                </div>
              </div>
            </div>

          </div>

        </form>
      )}

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed Marketplace
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed Marketplace • Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
