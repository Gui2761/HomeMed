import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Credenciamento.css';

export default function Credenciamento() {
  const navigate = useNavigate();
  const [conselho, setConselho] = useState('CREFITO');
  const [registro, setRegistro] = useState('12458-SP');
  const [validado, setValidado] = useState(true);
  const [especialidade, setEspecialidade] = useState('Fisioterapia Neurofuncional');
  const [precoBase, setPrecoBase] = useState('180,00');
  const [unidadeCobranca, setUnidadeCobranca] = useState('Por Consulta / Sessão (Aprox. 50 a 60 min)');
  const [disponivelHoje, setDisponivelHoje] = useState(true);
  const [raioKm, setRaioKm] = useState(15);
  const [cepBase, setCepBase] = useState('04531-010');
  const [chavePix, setChavePix] = useState('341.892.018-09');
  const [termoAceito, setTermoAceito] = useState(true);
  const [enviado, setEnviado] = useState(false);

  // Tags selecionadas
  const [habilidades, setHabilidades] = useState([
    'Reabilitação Pós-AVC',
    'Tratamento de Escaras',
    'Suporte Ventilatório'
  ]);

  const toggleHabilidade = (hab) => {
    if (habilidades.includes(hab)) {
      setHabilidades(habilidades.filter(h => h !== hab));
    } else {
      setHabilidades([...habilidades, hab]);
    }
  };

  const handleVerificarConselho = () => {
    setValidado(true);
    alert(`Registro ${registro} verificado com sucesso junto à base oficial do ${conselho}!`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!termoAceito) {
      alert('Por favor, confirme a declaração de veracidade dos dados informados.');
      return;
    }
    setEnviado(true);
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
          <Link to="/credenciamento" className="active">Credenciamento</Link>
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

      {/* HERO BANNER DE CREDENCIAMENTO */}
      <div className="cred-banner">
        <div className="cred-banner-content">
          <span className="cred-top-pill">Módulo Provedor • Regra RNF02 Validada</span>
          <h1>Credenciamento de Especialistas HomeMed</h1>
          <p>
            Junte-se à maior rede de atendimento domiciliar. Conecte-se a milhares de famílias e pacientes na sua região com garantia de repasse e segurança jurídica.
          </p>
        </div>

        <div className="cred-sla-card">
          <span className="sla-icon">⚡</span>
          <div>
            <span className="sla-label">Tempo Médio de Análise</span>
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
            <small>Autenticação Profissional</small>
          </div>
        </div>

        <div className="stepper-tab active">
          <span className="step-num">2</span>
          <div>
            <strong>TERMOS & DOCUMENTOS</strong>
            <small>Upload de Diplomas e Certidões</small>
          </div>
        </div>

        <div className="stepper-tab active">
          <span className="step-num">3</span>
          <div>
            <strong>PRECIFICAÇÃO & RAIO</strong>
            <small>Precificação e Disponibilidade</small>
          </div>
        </div>
      </div>

      {enviado ? (
        <div className="cred-success-card">
          <div className="success-icon-big">🎉</div>
          <h2>Credenciamento Enviado para Auditoria!</h2>
          <p>
            Seu dossiê e documentação profissional foram criptografados e encaminhados para a equipe de <strong>Governança Clínica do HomeMed</strong>.
          </p>
          <div className="success-protocol-box">
            <span>Protocolo de Homologação:</span>
            <strong>#HOM-2026-SP-9182</strong>
          </div>
          <div className="success-actions">
            <button className="btn-primary-blue" onClick={() => navigate('/admin')}>
              Acessar Painel de Auditoria (Demonstração)
            </button>
            <button className="btn-outline-gray" onClick={() => setEnviado(false)}>
              Editar Informações
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
                    <p>Autenticação cadastral segundo a regra de conformidade RNF02</p>
                  </div>
                </div>
                <span className="required-chip">Obrigatório</span>
              </div>

              <div className="form-grid-conselho">
                <div className="field-block">
                  <label>Conselho de Classe *</label>
                  <select value={conselho} onChange={(e) => setConselho(e.target.value)}>
                    <option value="CREFITO">CREFITO (Fisioterapia / Terapia Ocupacional)</option>
                    <option value="CRM">CRM (Medicina Geral / Especialidades)</option>
                    <option value="COREN">COREN (Enfermagem / Técnico)</option>
                    <option value="CRN">CRN (Nutrição Clínica)</option>
                  </select>
                </div>

                <div className="field-block">
                  <label>Número de Registro Profissional *</label>
                  <div className="input-verify-row">
                    <input 
                      type="text" 
                      value={registro} 
                      onChange={(e) => setRegistro(e.target.value)}
                      placeholder="Ex: 12458-SP"
                      required
                    />
                    <button type="button" className="btn-verify-active" onClick={handleVerificarConselho}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      Verificar Ativo
                    </button>
                  </div>
                </div>
              </div>

              {validado && (
                <div className="validation-alert-box">
                  <div className="check-circle-green">✓</div>
                  <div>
                    <strong>{conselho} Validado: Registro ativo no Conselho Regional</strong>
                    <p>Situação cadastral regular e sem penalidades ético-disciplinares vigentes.</p>
                  </div>
                  <span className="badge-sinc">Sincronizado</span>
                </div>
              )}

              <div className="field-block" style={{ marginTop: '16px' }}>
                <label>Especialidade Principal *</label>
                <select value={especialidade} onChange={(e) => setEspecialidade(e.target.value)}>
                  <option value="Fisioterapia Neurofuncional">Fisioterapia Neurofuncional e Motora</option>
                  <option value="Fisioterapia Respiratória">Fisioterapia Respiratória Domiciliar</option>
                  <option value="Enfermagem Padrão">Enfermagem e Cuidados de Curativos Complexos</option>
                  <option value="Clínica Médica">Clínica Médica e Geriatria</option>
                  <option value="Nutrição Clínica">Nutrição Clínica e Enteral</option>
                </select>
              </div>

              <div className="field-block" style={{ marginTop: '16px' }}>
                <label>Habilidades Complementares (Selecione as que você domina):</label>
                <div className="skills-chips-row">
                  {[
                    'Reabilitação Pós-AVC',
                    'Tratamento de Escaras',
                    'Suporte Ventilatório',
                    'Reabilitação Cardíaca',
                    'Laserterapia',
                    'Pediátrico Domiciliar'
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
                <label>Apresentação & Experiência Clínica (Bio Profissional) *</label>
                <textarea 
                  rows="3"
                  defaultValue="Especialista em reabilitação motora e neurofuncional para idosos com 10 anos de experiência clínica hospitalar e domiciliar contínua. Foco no ganho de autonomia diária, prevenção de quedas e suporte humanizado às famílias."
                  required
                />
              </div>

              {/* DOCUMENTOS OFICIAIS */}
              <div className="docs-upload-group">
                <label>Documentos Oficiais para Verificação Criptografada:</label>
                
                <div className="docs-grid-2">
                  <div className="doc-upload-item">
                    <div className="doc-icon">📄</div>
                    <div className="doc-meta">
                      <strong>Carteira do Conselho (Frente/Verso)</strong>
                      <small>carteira_crefito_2026.pdf (1.4 MB)</small>
                    </div>
                    <span className="doc-status-ok">✓ Pronto para envio</span>
                  </div>

                  <div className="doc-upload-item">
                    <div className="doc-icon">🎓</div>
                    <div className="doc-meta">
                      <strong>Diploma e Certificados</strong>
                      <small>diploma_fisioterapia_usp.pdf (3.8 MB)</small>
                    </div>
                    <span className="doc-status-ok">✓ Pronto para envio</span>
                  </div>
                </div>
              </div>

            </div>

            {/* SEÇÃO 2: PRECIFICAÇÃO, TURNOS & ATUAÇÃO GEOGRÁFICA */}
            <div className="cred-card">
              <div className="card-header-badge">
                <div className="card-header-title">
                  <span className="card-icon">💰</span>
                  <div>
                    <h3>Precificação, Turnos & Atuação Geográfica</h3>
                    <p>Defina sua flexibilidade e tarifas para atendimento domiciliar</p>
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
                      required
                    />
                  </div>
                  <small className="help-text">Valor líquido estimado: repasse automático garantido.</small>
                </div>

                <div className="field-block">
                  <label>Unidade de Cobrança *</label>
                  <select value={unidadeCobranca} onChange={(e) => setUnidadeCobranca(e.target.value)}>
                    <option value="Por Consulta / Sessão (Aprox. 50 a 60 min)">Por Consulta / Sessão (Aprox. 50 a 60 min)</option>
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
                  <p>Ative para receber chamadas de urgência ou consultas no mesmo dia com prioridade de rota.</p>
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
                  max="40" 
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
                      placeholder="04531-010"
                    />
                  </div>
                  <span className="area-coverage-tag">📍 Jardins, Bela Vista, Pinheiros, Itaim Bibi</span>
                </div>
              </div>

              {/* CHAVE PIX */}
              <div className="pix-account-box">
                <div className="field-block">
                  <label>Conta Bancária ou Chave Pix para Recebimento Automático</label>
                  <div className="pix-input-group">
                    <select defaultValue="CPF">
                      <option value="CPF">Chave Pix (CPF)</option>
                      <option value="Email">Chave Pix (E-mail)</option>
                      <option value="Aleatoria">Chave Aleatória</option>
                    </select>
                    <input 
                      type="text" 
                      value={chavePix} 
                      onChange={(e) => setChavePix(e.target.value)} 
                    />
                  </div>
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
                  Declaro sob responsabilidade civil e penal a veracidade dos dados informados, concordando com o <strong>Código de Conduta Profissional HomeMed</strong> e as diretrizes de sigilo e prontuário eletrônico da LGPD em Saúde.
                </label>
              </div>

              <div className="cred-submit-footer">
                <button type="button" className="btn-draft" onClick={() => alert('Rascunho salvo localmente!')}>
                  Salvar Rascunho
                </button>
                <button type="submit" className="btn-submit-audit">
                  Enviar para Análise e Validação do Conselho →
                </button>
              </div>

            </div>

          </div>

          {/* COLUNA DIREITA: PREVIEW & BENEFÍCIOS */}
          <div className="cred-col-right">
            
            {/* PREVIEW DO PERFIL NO MARKETPLACE */}
            <div className="side-preview-card">
              <span className="preview-label">VISUALIZAÇÃO NO MARKETPLACE</span>
              
              <div className="preview-profile-flex">
                <img 
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150" 
                  alt="Dr. Roberto Silveira" 
                  className="preview-avatar"
                />
                <div>
                  <h4>Dr. Roberto Silveira</h4>
                  <span className="preview-crm">{conselho} {registro}</span>
                  <div className="preview-rating">⭐ 5.0 • Fisioterapeuta</div>
                </div>
              </div>

              <div className="preview-price-box">
                <span>Valor por atendimento:</span>
                <strong>R$ {precoBase}</strong>
              </div>

              <div className="preview-status-tag">
                <span className="dot-green"></span>
                Atendendo na sua área de cobertura
              </div>
            </div>

            {/* BENEFÍCIOS DO CREDENCIADO */}
            <div className="side-benefits-card">
              <h4>Benefícios do Credenciado</h4>
              <p>Faça parte da maior rede de saúde domiciliar e conte com suporte completo aos profissionais autônomos:</p>

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
                  <strong>Flexibilidade Total de Rotina</strong>
                  <p>Você escolhe seus dias, horários e raio geográfico de atendimento.</p>
                </div>
              </div>

              <div className="benefit-item">
                <span className="benefit-icon">💼</span>
                <div>
                  <strong>Seguro de Responsabilidade Domiciliar</strong>
                  <p>Cobertura e proteção jurídica profissional durante os atendimentos em residência.</p>
                </div>
              </div>

              <div className="benefit-item">
                <span className="benefit-icon">🚚</span>
                <div>
                  <strong>Suporte Operacional Logístico 24h</strong>
                  <p>Central médica pronta para suporte em rotas e prontuário eletrônico seguro.</p>
                </div>
              </div>
            </div>

            {/* CANAL DIRETO */}
            <div className="side-support-card">
              <h5>Dúvidas sobre o Credenciamento?</h5>
              <p>Fale diretamente com nossa equipe médica de credenciamento via WhatsApp.</p>
              <button type="button" className="btn-talk-support" onClick={() => alert('Conectando ao WhatsApp do Suporte Regulatório HomeMed...')}>
                💬 Falar com Suporte Regulatório
              </button>
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
          <a href="#">Política de Privacidade</a>
          <a href="#">Termos de Serviço</a>
          <a href="#">Suporte</a>
        </div>
      </footer>
    </div>
  );
}
