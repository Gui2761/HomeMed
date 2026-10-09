import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './DetalhesAgendamento.css';

export default function DetalhesAgendamento() {
  const navigate = useNavigate();
  const [copiado, setCopiado] = useState(false);

  const handleCopiarRecibo = () => {
    navigator.clipboard?.writeText('HM-88219-RECIBO-FISCAL-2026');
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
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
          <span>Agendamento #HM-88219</span>
        </div>
        
        <div className="detalhes-header-row">
          <div className="header-left-title">
            <h1>Detalhes do Agendamento</h1>
            <span className="badge-status-green">
              <span className="dot-green"></span>
              Visita Concluída
            </span>
            <span className="badge-status-neutral">RN01 e Prontuário Domiciliar</span>
          </div>

          <div className="header-right-actions">
            <button className="btn-recibo-fiscal" onClick={handleCopiarRecibo}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              {copiado ? 'Recibo Copiado!' : 'Recibo Fiscal & Relatório'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMNS GRID */}
      <div className="detalhes-main-grid">
        
        {/* COLUNA ESQUERDA (2/3) */}
        <div className="col-detalhes-left">
          
          {/* CARD DO PROFISSIONAL */}
          <div className="card-pro-banner">
            <div className="pro-banner-left">
              <img 
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Dra. Juliana Silva" 
                className="pro-banner-avatar"
              />
              <div>
                <div className="pro-name-row">
                  <h3>Dra. Juliana Silva</h3>
                  <span className="verified-chip-green">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    CREFITO Ativo
                  </span>
                </div>
                <p className="pro-banner-subtitle">Fisioterapia Respiratória e Motora • Registro: CREFITO 12458-SP</p>
                <div className="pro-banner-badges">
                  <span>📍 Atendimento em Domicílio</span>
                  <span>⭐ 5.0 (42 avaliações)</span>
                </div>
              </div>
            </div>

            <button className="btn-chat-pro" onClick={() => navigate('/mensagens')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Enviar Mensagem
            </button>
          </div>

          {/* RESUMO DO PROCEDIMENTO */}
          <div className="card-section">
            <div className="section-title-line">
              <div className="section-heading-icon">🩺</div>
              <h4>Resumo do Procedimento</h4>
              <span className="protocol-code">#RN04 Protocolo Domiciliar</span>
            </div>

            <div className="procedure-stats-grid">
              <div className="proc-stat-col">
                <span className="proc-label">Serviço Solicitado</span>
                <strong>Fisioterapia Motora & Reabilitação</strong>
                <small>Atendimento Domiciliar 60 min</small>
              </div>
              <div className="proc-stat-col">
                <span className="proc-label">Data & Hora da Visita</span>
                <strong>Hoje, 14:00 - 15:00</strong>
                <small>Chegada confirmada às 14:02</small>
              </div>
              <div className="proc-stat-col">
                <span className="proc-label">Duração da Visita</span>
                <strong>Concluído em 1h 04</strong>
                <small>Encerramento às 15:06</small>
              </div>
            </div>

            {/* PRONTUÁRIO DE EVOLUÇÃO CLÍNICA */}
            <div className="prontuario-box">
              <div className="prontuario-header">
                <div className="prontuario-title">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>Prontuário de Evolução Clínica do Paciente</span>
                </div>
                <span className="signed-tag">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                  Assinado Digitalmente (CFM/CREFITO)
                </span>
              </div>
              <p className="prontuario-text">
                "Paciente cooperativo, realizado protocolo de cinesioterapia ativa-assistida para membros inferiores e mobilização articular de amplitude de quadril e joelho. Treino de marcha seguro com apoio de andador. Estabilidade postural mantida sem queixas álgicas agudas. Sinais vitais checados: PA 120/80 mmHg, SpO2 98%."
              </p>
              <div className="prontuario-footer">
                <span>Registro médico com validade jurídica perante CFM nº 2.314/2022</span>
                <span>Chave de Validação: CF6289-4921</span>
              </div>
            </div>
          </div>

          {/* ENDEREÇO DE ATENDIMENTO DOMICILIAR */}
          <div className="card-section">
            <div className="section-title-line">
              <div className="section-heading-icon">📍</div>
              <h4>Endereço de Atendimento Domiciliar</h4>
              <span className="protocol-code">Residência Fixada</span>
            </div>

            <div className="address-display-box">
              <div className="address-info-text">
                <strong>Rua das Flores, 123 - Apto 14</strong>
                <p>Jardim Paulista — São Paulo, SP</p>
                <small>CEP: 01401-000 • Ponto de Referência: Próximo ao Metrô Trianon-Masp</small>
                
                <div className="geo-check-row">
                  <span className="geo-icon">✓</span>
                  <span>Check-in por geolocalização confirmado no raio de 15m às 14:00</span>
                </div>
              </div>

              <div className="mini-map-preview">
                <div className="map-pin-badge">
                  <span>📍 Residência do Paciente</span>
                </div>
                <div className="map-road-indicator">Rota verificada pelo GPS</div>
              </div>
            </div>
          </div>

          {/* AVALIAÇÃO DO ATENDIMENTO */}
          <div className="card-section">
            <div className="section-title-line">
              <div className="section-heading-icon">⭐</div>
              <h4>Avaliação do Atendimento</h4>
              <span className="protocol-code">Avaliado Hoje às 16:15 • Auditoria Aprovada</span>
            </div>

            <div className="rating-review-card">
              <div className="rating-top-row">
                <div className="stars-cluster">
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <span className="star-icon">⭐</span>
                  <strong className="rating-number">5.0 <small>/ 5.0</small></strong>
                </div>
                <span className="rating-privacy-tag">🔒 Depoimento Auditado & Publicado no Perfil do Profissional</span>
              </div>

              <div className="testimonial-text-box">
                <p>
                  "Excelente profissional! Chegou pontualmente com todos os equipamentos de fisioterapia e higienização necessários para o meu pai. Demonstrou domínio técnico incomparável e paciência rara durante os exercícios."
                </p>
              </div>

              <div className="rating-tags-flex">
                <span className="rating-tag">✓ Pontual</span>
                <span className="rating-tag">✓ Equipamento Próprio</span>
                <span className="rating-tag">✓ Muito Atenciosa</span>
                <span className="rating-tag">✓ Explicação Clara</span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA (1/3) */}
        <div className="col-detalhes-right">
          
          {/* FATURAMENTO & ESCROW */}
          <div className="side-card faturamento-card">
            <div className="side-card-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              <h4>Faturamento & Escrow</h4>
              <span className="escrow-chip">RNF04</span>
            </div>

            <div className="escrow-breakdown-list">
              <div className="escrow-row">
                <span>Sessão de Fisioterapia (1h)</span>
                <strong>R$ 180,00</strong>
              </div>
              <div className="escrow-row">
                <span>Taxa de deslocamento domiciliar</span>
                <span className="free-text">R$ 0,00 (Incluso)</span>
              </div>
              <div className="escrow-row">
                <span>Retenção da Plataforma</span>
                <small>Calculado internamente</small>
              </div>

              <div className="escrow-total-row">
                <span>Total Liquidado</span>
                <strong>R$ 180,00</strong>
              </div>
            </div>

            <div className="escrow-safe-alert">
              <div className="safe-icon">🛡️</div>
              <div>
                <strong>Custódia Financeira Liberada</strong>
                <p>Conforme regra RNF04: Liberação de valor ao profissional após confirmação mútua de atendimento.</p>
              </div>
            </div>

            <div className="payment-method-row">
              <div className="card-brand-icon">💳</div>
              <div>
                <strong>Cartão de Crédito</strong>
                <small>Final 5079 • Autorizado em 14:00</small>
              </div>
              <span className="badge-paid">Autorizado</span>
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
                  <strong>Solicitado pelo paciente</strong>
                  <small>Hoje, 10:15 • Pedido formalizado no marketplace</small>
                </div>
              </div>

              <div className="step-point completed">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Confirmado internamente</strong>
                  <small>11:00 • Aceite e confirmação de rota da Dra. Juliana</small>
                </div>
              </div>

              <div className="step-point completed">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Profissional a caminho</strong>
                  <small>13:35 • Deslocamento geolocalizado iniciado</small>
                </div>
              </div>

              <div className="step-point completed">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Visita em andamento</strong>
                  <small>14:02 • Check-in presencial validado</small>
                </div>
              </div>

              <div className="step-point completed highlight">
                <span className="step-circle">✓</span>
                <div className="step-info">
                  <strong>Concluído e finalizado</strong>
                  <small>15:06 • Check-out mútuo e liberação de pagamento</small>
                </div>
              </div>
            </div>
          </div>

          {/* AÇÕES DO PACIENTE */}
          <div className="side-card actions-card">
            <span className="actions-header-label">AÇÕES DO AGENDAMENTO</span>
            
            <button className="btn-agendar-novamente" onClick={() => navigate('/home')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agendar Nova Visita com Juliana
            </button>

            <button className="btn-pdf-download" onClick={() => alert('Download do Prontuário e Comprovante Fiscal gerado com sucesso!')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Baixar Comprovante (PDF)
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
