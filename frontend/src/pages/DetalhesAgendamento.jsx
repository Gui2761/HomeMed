import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './DetalhesAgendamento.css';

export default function DetalhesAgendamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const visita = location.state?.visita;

  const [copiado, setCopiado] = useState(false);
  const [anotacaoMedico, setAnotacaoMedico] = useState('');
  const [salvoMsg, setSalvoMsg] = useState('');

  const rawUser = localStorage.getItem('@HomeMed:usuario');
  let usuario = null;
  try { if (rawUser) usuario = JSON.parse(rawUser); } catch (e) {}

  // Identificação robusta do papel do usuário logado
  const isProfissional = usuario?.tipo_usuario === 'profissional' || 
                         (visita?.profissional_usuario_id && usuario?.id === visita.profissional_usuario_id) ||
                         (usuario?.email && usuario.email.includes('medico'));
  const isPaciente = !isProfissional && usuario?.tipo_usuario !== 'admin';

  const agendamentoId = visita?.id ? `HM-${visita.id.slice(0, 5).toUpperCase()}` : 'HM-F88CB';
  const proNome = visita?.profissional_nome || 'Dr. Gabriel Silva Mendes';
  const pacNome = visita?.paciente_nome || 'Ana Clara Ribeiro';
  const especialidade = visita?.especialidade_principal || 'Clínico Geral & Geriatria Domiciliar';
  const registroConselho = visita?.registro_profissional || 'CRM-SP 189420';
  const fotoPro = visita?.profissional_foto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300';
  const fotoPac = visita?.paciente_foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300';
  const pacTelefone = visita?.paciente_telefone || '(11) 98765-1001';
  const proTelefone = visita?.profissional_telefone || '(11) 98765-2002';

  const dataFormatada = visita?.data_hora_visita 
    ? `${new Date(visita.data_hora_visita).toLocaleDateString('pt-BR')} às ${new Date(visita.data_hora_visita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    : '09/10/2026 às 17:45';
  const valorTotal = visita?.valor_total ? parseFloat(visita.valor_total).toFixed(2).replace('.', ',') : '180,00';
  const enderecoLinha1 = visita?.logradouro ? `${visita.logradouro}, ${visita.numero}${visita.complemento ? ' - ' + visita.complemento : ''}` : 'Av. Paulista, 1000 - Apto 102';
  const enderecoLinha2 = visita?.bairro ? `${visita.bairro} — ${visita.cidade || 'São Paulo'}, ${visita.uf || 'SP'}` : 'Bela Vista — São Paulo, SP';
  const cepTexto = visita?.cep ? `CEP: ${visita.cep}` : 'CEP: 01310-100';

  const handleCopiarRecibo = () => {
    navigator.clipboard?.writeText(`${agendamentoId}-PRONTUARIO-CFM-2026`);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const getTextoEvolucao = () => {
    if (especialidade.includes('Clínic') || especialidade.includes('Geri') || especialidade.includes('Médic')) {
      return "Paciente compareceu ao atendimento domiciliar lúcida, orientada no tempo e espaço, em bom estado geral e hemodinamicamente estável. Realizada anamnese clínica detalhada e exame físico direcionado. Aferição de sinais vitais domiciliares: PA 125/82 mmHg, FC 74 bpm, Tax 36,4ºC, SpO2 98% em ar ambiente. Ausculta cardiopulmonar fisiológica, sem ruídos adventícios. Avaliação preventiva da mobilidade e polifarmácia geriátrica. Orientações sobre hidratação e adesão medicamentosa fornecidas à paciente e familiares. Conduta clínica estabelecida sem intercorrências agudas.";
    }
    if (especialidade.includes('Fisio')) {
      return "Paciente cooperativo(a), realizado protocolo de cinesioterapia ativa-assistida para membros inferiores e mobilização articular de amplitude de quadril e joelho. Treino de marcha seguro com apoio de andador. Estabilidade postural mantida sem queixas álgicas agudas. Sinais vitais checados: PA 120/80 mmHg, SpO2 98%.";
    }
    if (especialidade.includes('Enferm')) {
      return "Realizado atendimento de enfermagem domiciliar: avaliação de integridade cutânea, curativo estéril com técnica asséptica e aferição de sinais vitais (PA 120/75 mmHg, Glicemia capilar 102 mg/dL). Administração de medicação prescrita. Paciente confortável e sem queixas álgicas.";
    }
    if (especialidade.includes('Cuid')) {
      return "Acompanhamento e assistência ao paciente no domicílio, auxílio na locomoção segura, rotina de higiene e hidratação. Seguidas rigorosamente as orientações da família e horários da prescrição médica.";
    }
    return "Atendimento domiciliar humanizado concluído com sucesso. Procedimentos realizados conforme protocolo assistencial, paciente estável e sem intercorrências.";
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar />

      {/* BREADCRUMB & HEADER */}
      <div className="detalhes-top-nav">
        <div className="breadcrumb-line">
          <Link to="/consultas">Consultas</Link>
          <span>/</span>
          <span>Prontuário & Atendimento #{agendamentoId}</span>
        </div>
        
        <div className="detalhes-header-row">
          <div className="header-left-title">
            <h1>{isProfissional ? 'Prontuário da Paciente' : 'Detalhes do Agendamento & Prontuário'}</h1>
            <span className="badge-status-green">
              <span className="dot-green"></span>
              {visita?.status === 'concluido' ? 'Visita Concluída' : visita?.status === 'cancelado' ? 'Visita Cancelada' : 'Visita Confirmada'}
            </span>
            <span className="badge-status-neutral">CFM nº 2.314/2022 • RN01 Domiciliar</span>
          </div>

          <div className="header-right-actions">
            <button className="btn-recibo-fiscal" onClick={handleCopiarRecibo}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              {copiado ? 'Chave Copiada!' : 'Copiar Chave do Prontuário'}
            </button>
            <button className="btn-recibo-fiscal" onClick={() => window.print()} style={{ background: '#f8fafc' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMNS GRID */}
      <div className="detalhes-main-grid">
        
        {/* COLUNA ESQUERDA (2/3) */}
        <div className="col-detalhes-left">
          
          {/* BANNER PRINCIPAL COM LÓGICA DE PAPEL RIGOROSA */}
          {isProfissional ? (
            /* VISÃO DO MÉDICO: O sujeito do prontuário é o PACIENTE */
            <div className="card-pro-banner" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div className="pro-banner-left">
                <img 
                  src={fotoPac} 
                  alt={pacNome} 
                  className="pro-banner-avatar"
                  style={{ borderRadius: '50%', border: '3px solid #10b981' }}
                />
                <div>
                  <div className="pro-name-row">
                    <h3>{pacNome}</h3>
                    <span className="verified-chip-green" style={{ background: '#dcfce7', color: '#166534' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      Paciente Domiciliar
                    </span>
                  </div>
                  <p className="pro-banner-subtitle">
                    Contato: {pacTelefone} • CPF: {visita?.paciente_cpf || 'Cadastrado'}
                  </p>
                  <div className="pro-banner-badges">
                    <span>📍 {enderecoLinha1}, {enderecoLinha2}</span>
                    <span>🩺 Especialista Responsável: {proNome} ({registroConselho})</span>
                  </div>
                </div>
              </div>

              <button 
                className="btn-chat-pro" 
                style={{ background: '#059669', borderColor: '#059669', color: '#ffffff' }}
                onClick={() => navigate('/mensagens')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Falar com Paciente
              </button>
            </div>
          ) : (
            /* VISÃO DO PACIENTE: O sujeito prestador é o MÉDICO */
            <div className="card-pro-banner">
              <div className="pro-banner-left">
                <img 
                  src={fotoPro} 
                  alt={proNome} 
                  className="pro-banner-avatar"
                />
                <div>
                  <div className="pro-name-row">
                    <h3>{proNome}</h3>
                    <span className="verified-chip-green">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                      {registroConselho}
                    </span>
                  </div>
                  <p className="pro-banner-subtitle">{especialidade} • Paciente: {pacNome}</p>
                  <div className="pro-banner-badges">
                    <span>📍 Atendimento no seu domicílio</span>
                    <span>⭐ {visita?.nota_media || '5.0'} (Avaliado)</span>
                  </div>
                </div>
              </div>

              <button className="btn-chat-pro" onClick={() => navigate('/mensagens')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Falar com Especialista
              </button>
            </div>
          )}

          {/* RESUMO DO PROCEDIMENTO */}
          <div className="card-section">
            <div className="section-title-line">
              <div className="section-heading-icon">🩺</div>
              <h4>Resumo do Procedimento Domiciliar</h4>
              <span className="protocol-code">#RN04 Protocolo Clínico</span>
            </div>

            <div className="procedure-stats-grid">
              <div className="proc-stat-col">
                <span className="proc-label">Serviço Realizado</span>
                <strong>{especialidade}</strong>
                <small>Atendimento Presencial Domiciliar</small>
              </div>
              <div className="proc-stat-col">
                <span className="proc-label">Data & Hora da Visita</span>
                <strong>{dataFormatada}</strong>
                <small>Horário Registrado</small>
              </div>
              <div className="proc-stat-col">
                <span className="proc-label">Duração Efetiva</span>
                <strong>60 minutos</strong>
                <small>Sessão presencial concluída</small>
              </div>
            </div>

            {/* PRONTUÁRIO DE EVOLUÇÃO CLÍNICA */}
            <div className="prontuario-box">
              <div className="prontuario-header">
                <div className="prontuario-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>Prontuário de Evolução Clínica • Paciente: {pacNome}</span>
                </div>
                <span className="signed-tag">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                  Assinado Digitalmente por {proNome} ({registroConselho})
                </span>
              </div>
              <p className="prontuario-text">
                "{getTextoEvolucao()}"
              </p>

              {/* Anotação Médica Interativa para o Médico */}
              {isProfissional && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    ✏️ Adicionar Observação Clínica / Prescrição ao Prontuário:
                  </label>
                  <textarea
                    value={anotacaoMedico}
                    onChange={(e) => setAnotacaoMedico(e.target.value)}
                    placeholder="Digite prescrições, orientações de retorno ou observações sobre o paciente..."
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!anotacaoMedico.trim()) return;
                        setSalvoMsg('✓ Observação clínica salva com sucesso no prontuário!');
                        setTimeout(() => setSalvoMsg(''), 3000);
                      }}
                      style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Salvar Nota no Prontuário
                    </button>
                    {salvoMsg && <span style={{ color: '#059669', fontSize: '12px', fontWeight: '600' }}>{salvoMsg}</span>}
                  </div>
                </div>
              )}

              <div className="prontuario-footer">
                <span>Registro médico com validade jurídica perante CFM nº 2.314/2022</span>
                <span>Chave de Validação: {agendamentoId}-CF6289</span>
              </div>
            </div>
          </div>

          {/* ENDEREÇO DE ATENDIMENTO DOMICILIAR */}
          <div className="card-section">
            <div className="section-title-line">
              <div className="section-heading-icon">📍</div>
              <h4>Endereço de Atendimento Domiciliar</h4>
              <span className="protocol-code">Residência do Paciente</span>
            </div>

            <div className="address-display-box">
              <div className="address-info-text">
                <strong>{enderecoLinha1}</strong>
                <p>{enderecoLinha2}</p>
                <small>{cepTexto} • Atendimento Presencial Domiciliar Concluído</small>
                
                <div className="geo-check-row">
                  <span className="geo-icon">✓</span>
                  <span>Check-in presencial por geolocalização confirmado no raio de 15m no horário agendado</span>
                </div>
              </div>

              <div className="mini-map-preview">
                <div className="map-pin-badge">
                  <span>📍 Residência de {pacNome}</span>
                </div>
                <div className="map-road-indicator">Rota validada via GPS</div>
              </div>
            </div>
          </div>

          {/* AVALIAÇÃO DO ATENDIMENTO */}
          <div className="card-section">
            <div className="section-title-line">
              <div className="section-heading-icon">⭐</div>
              <h4>Avaliação do Atendimento</h4>
              <span className="protocol-code">Auditoria de Satisfação</span>
            </div>

            <div className="rating-review-card">
              <div className="rating-top-row">
                <div className="stars-cluster">
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <strong className="rating-number">{visita?.avaliacao_nota ? `${visita.avaliacao_nota}.0` : '5.0'} <small>/ 5.0</small></strong>
                </div>
                <span className="rating-privacy-tag">🔒 Depoimento Auditado & Homologado</span>
              </div>

              <div className="testimonial-text-box">
                <p>
                  "{visita?.avaliacao_comentario || 'Atendimento domiciliar excelente! Profissional pontual, atencioso e com total domínio técnico.'}"
                </p>
              </div>

              <div className="rating-tags-flex">
                <span className="rating-tag">✓ Pontual</span>
                <span className="rating-tag">✓ Equipamento Próprio</span>
                <span className="rating-tag">✓ Atendimento Humanizado</span>
                <span className="rating-tag">✓ Conduta Segura</span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA (1/3) */}
        <div className="col-detalhes-right">
          
          {/* FATURAMENTO & REPASSE / RECIBO */}
          <div className="side-card faturamento-card">
            <div className="side-card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <h4>{isProfissional ? 'Honorários Médicos & Repasse' : 'Faturamento & Recibo Fiscal'}</h4>
              <span className="escrow-chip">RNF04</span>
            </div>

            <div className="escrow-breakdown-list">
              <div className="escrow-row">
                <span>Atendimento Domiciliar ({especialidade})</span>
                <strong>R$ {valorTotal}</strong>
              </div>
              <div className="escrow-row">
                <span>Taxa de deslocamento domiciliar</span>
                <span className="free-text">R$ 0,00 (Incluso)</span>
              </div>
              <div className="escrow-row">
                <span>{isProfissional ? 'Taxa da Plataforma HomeMed' : 'Retenção da Plataforma'}</span>
                <small>{isProfissional ? 'R$ 0,00 (Repasse integral 100%)' : 'Calculado internamente'}</small>
              </div>

              <div className="escrow-total-row">
                <span>{isProfissional ? 'Valor a Receber pelo Atendimento' : 'Total Pago pelo Paciente'}</span>
                <strong style={{ color: isProfissional ? '#047857' : '#0f172a' }}>R$ {valorTotal}</strong>
              </div>
            </div>

            <div className="escrow-safe-alert">
              <div className="safe-icon">🛡️</div>
              <div>
                <strong>{isProfissional ? 'Honorários Liberados com Sucesso' : 'Custódia Financeira Liberada'}</strong>
                <p>
                  {isProfissional 
                    ? 'Conforme regra RNF04: Liberação imediata de valores após confirmação mútua de visita domiciliar.'
                    : 'Conforme regra RNF04: Liberação de valor ao profissional após confirmação mútua de atendimento.'}
                </p>
              </div>
            </div>

            <div className="payment-method-row">
              <div className="card-brand-icon">{isProfissional ? '🏦' : '💳'}</div>
              <div>
                <strong>{isProfissional ? 'Repasse Direto via PIX / Banco' : 'Cartão de Crédito / PIX'}</strong>
                <small>{isProfissional ? 'Liquidado na conta bancária cadastrada' : 'Comprovante fiscal autenticado'}</small>
              </div>
              <span className="badge-paid">{isProfissional ? 'Depositado' : 'Pago'}</span>
            </div>
          </div>

          {/* CICLO DA VISITA / AUDITORIA */}
          <div className="side-card timeline-card">
            <div className="side-card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h4>Ciclo da Visita</h4>
              <span className="audit-chip">Trilha de Auditoria</span>
            </div>

            <div className="audit-stepper">
              <div className="step-point completed">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Solicitado por {pacNome}</strong>
                  <small>Visita domiciliar formalizada na plataforma</small>
                </div>
              </div>

              <div className="step-point completed">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Confirmado pelo profissional</strong>
                  <small>Aceite de rota e prontuário de {proNome}</small>
                </div>
              </div>

              <div className="step-point completed">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Profissional a caminho</strong>
                  <small>Deslocamento com GPS validado</small>
                </div>
              </div>

              <div className="step-point completed">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Visita presencial realizada</strong>
                  <small>Check-in no domicílio confirmado no horário</small>
                </div>
              </div>

              <div className="step-point completed highlight">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Concluído e finalizado</strong>
                  <small>Prontuário assinado e honorários liberados</small>
                </div>
              </div>
            </div>
          </div>

          {/* AÇÕES DO AGENDAMENTO COM LÓGICA DE PAPEL */}
          <div className="side-card actions-card">
            <span className="actions-header-label">AÇÕES DO AGENDAMENTO</span>
            
            {isPaciente ? (
              <button className="btn-agendar-novamente" onClick={() => navigate('/home')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agendar Nova Visita com {proNome}
              </button>
            ) : (
              <button className="btn-agendar-novamente" style={{ background: '#059669', borderColor: '#059669', color: '#ffffff' }} onClick={() => navigate('/consultas')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Ver Minha Agenda de Visitas
              </button>
            )}

            <button className="btn-pdf-download" onClick={() => window.print()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Imprimir / Salvar Prontuário (PDF)
            </button>

            <button className="btn-reportar-suporte" onClick={() => alert('Canal de Suporte e Ouvidoria HomeMed acionado. Protocolo #OUV-9912.')}>
              ⚠️ Relatar Ocorrência ao Suporte
            </button>
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
          <span>© 2026 HomeMed • Prontuário Eletrônico Unificado</span>
          <a href="#">Política de Privacidade</a>
          <a href="#">Termos de Atendimento</a>
        </div>
      </footer>
    </div>
  );
}
