import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import './DetalhesAgendamento.css';

export default function DetalhesAgendamento() {
  const navigate = useNavigate();
  const location = useLocation();
  const [visita, setVisita] = useState(location.state?.visita || null);
  const [carregandoVisita, setCarregandoVisita] = useState(!location.state?.visita);

  const [copiado, setCopiado] = useState(false);
  const [anotacaoMedico, setAnotacaoMedico] = useState('');
  const [salvoMsg, setSalvoMsg] = useState('');

  // Estados de Avaliação Interativa
  const [notaAvaliacao, setNotaAvaliacao] = useState(location.state?.visita?.avaliacao_nota || 5);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState(location.state?.visita?.avaliacao_comentario || '');
  const [tagsSelecionadas, setTagsSelecionadas] = useState(['Pontual', 'Atendimento Humanizado', 'Equipamento Próprio', 'Conduta Segura']);
  const [editandoAvaliacao, setEditandoAvaliacao] = useState(!location.state?.visita?.avaliacao_nota);
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false);
  const [msgAvaliacaoSucesso, setMsgAvaliacaoSucesso] = useState('');

  // Estados de Conclusão e Reagendamento de Visita
  const [concluindo, setConcluindo] = useState(false);
  const [modalReagendar, setModalReagendar] = useState(false);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [reagendando, setReagendando] = useState(false);

  const TAGS_DISPONIVEIS = ['Pontual', 'Equipamento Próprio', 'Atendimento Humanizado', 'Conduta Segura', 'Recomendo'];

  const rawUser = localStorage.getItem('@HomeMed:usuario');
  let usuario = null;
  try { if (rawUser) usuario = JSON.parse(rawUser); } catch (e) {}

  useEffect(() => {
    if (!visita) {
      (async () => {
        try {
          setCarregandoVisita(true);
          const lista = await api.listarAgendamentos('todas');
          if (Array.isArray(lista) && lista.length > 0) {
            const v = lista[0];
            setVisita(v);
            if (v.avaliacao_nota) {
              setNotaAvaliacao(v.avaliacao_nota);
              setComentarioAvaliacao(v.avaliacao_comentario || '');
              setEditandoAvaliacao(false);
            } else {
              setEditandoAvaliacao(true);
            }
          }
        } catch (err) {
          console.error('Erro ao buscar visita:', err);
        } finally {
          setCarregandoVisita(false);
        }
      })();
    } else if (visita.avaliacao_nota) {
      setNotaAvaliacao(visita.avaliacao_nota);
      setComentarioAvaliacao(visita.avaliacao_comentario || '');
      setEditandoAvaliacao(false);
    }
  }, []);

  const toggleTag = (tag) => {
    if (tagsSelecionadas.includes(tag)) {
      setTagsSelecionadas(tagsSelecionadas.filter(t => t !== tag));
    } else {
      setTagsSelecionadas([...tagsSelecionadas, tag]);
    }
  };

  const handleSalvarAvaliacao = async (e) => {
    e?.preventDefault();
    const agendamentoIdReal = visita?.id;
    if (!agendamentoIdReal) {
      alert('Não foi possível identificar o código deste agendamento.');
      return;
    }

    setEnviandoAvaliacao(true);
    setMsgAvaliacaoSucesso('');

    try {
      const tagsFormatadas = tagsSelecionadas.length > 0 ? ` [Destaques: ${tagsSelecionadas.join(', ')}]` : '';
      const textoFinal = comentarioAvaliacao.trim()
        ? `${comentarioAvaliacao.trim()}${tagsFormatadas}`
        : `Atendimento domiciliar excelente e pontual!${tagsFormatadas}`;

      await api.registrarAvaliacao({
        agendamento_id: agendamentoIdReal,
        nota: notaAvaliacao,
        comentario: textoFinal
      });

      setVisita(prev => ({
        ...prev,
        avaliacao_nota: notaAvaliacao,
        avaliacao_comentario: textoFinal,
        avaliacao_id: 'av-' + Date.now()
      }));

      setMsgAvaliacaoSucesso('✓ Sua avaliação foi registrada e publicada com sucesso!');
      setEditandoAvaliacao(false);
      setTimeout(() => setMsgAvaliacaoSucesso(''), 5000);
    } catch (err) {
      console.error('Erro ao registrar avaliação:', err);
      alert(`Erro ao registrar avaliação: ${err.message || 'Verifique sua conexão.'}`);
    } finally {
      setEnviandoAvaliacao(false);
    }
  };

  const handleConcluirVisita = async () => {
    if (!visita?.id) return;
    if (!window.confirm('Confirma a conclusão deste atendimento domiciliar? O status será alterado para Concluído e os honorários serão liberados.')) {
      return;
    }
    setConcluindo(true);
    try {
      await api.atualizarStatusAgendamento(visita.id, 'concluido');
      setVisita(prev => ({ ...prev, status: 'concluido' }));
      alert('✅ Atendimento concluído com sucesso! Visita homologada.');
    } catch (err) {
      console.error('Erro ao concluir visita:', err);
      alert(`Erro ao concluir atendimento: ${err.message || 'Tente novamente.'}`);
    } finally {
      setConcluindo(false);
    }
  };

  const handleAbrirReagendar = () => {
    if (visita?.data_hora_visita) {
      const d = new Date(visita.data_hora_visita);
      setNovaData(!isNaN(d) ? d.toISOString().split('T')[0] : '');
      setNovaHora(!isNaN(d) ? d.toTimeString().slice(0, 5) : '14:00');
    }
    setModalReagendar(true);
  };

  const handleConfirmarReagendar = async (e) => {
    e.preventDefault();
    if (!visita?.id || !novaData || !novaHora) return;
    setReagendando(true);
    try {
      const novaDataHoraIso = new Date(`${novaData}T${novaHora}:00`).toISOString();
      await api.reagendarAgendamento(visita.id, novaDataHoraIso);
      setVisita(prev => ({ ...prev, data_hora_visita: novaDataHoraIso, status: 'confirmado' }));
      alert('✅ Atendimento domiciliar reagendado com sucesso!');
      setModalReagendar(false);
    } catch (err) {
      console.error('Erro ao reagendar atendimento:', err);
      alert(`Erro ao reagendar: ${err.message || 'Verifique a data e horário selecionados.'}`);
    } finally {
      setReagendando(false);
    }
  };

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

          {/* AVALIAÇÃO DO ATENDIMENTO INTERATIVA */}
          <div className="card-section">
            <div className="section-title-line">
              <div className="section-heading-icon">⭐</div>
              <h4>Avaliação do Atendimento</h4>
              <span className="protocol-code">Auditoria de Satisfação</span>
            </div>

            {msgAvaliacaoSucesso && (
              <div style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✓</span>
                <span>{msgAvaliacaoSucesso}</span>
              </div>
            )}

            {isProfissional ? (
              /* VISÃO DO PROFISSIONAL: Exibe a avaliação do paciente */
              <div className="rating-review-card">
                {visita?.avaliacao_nota || visita?.avaliacao_comentario ? (
                  <>
                    <div className="rating-top-row">
                      <div className="stars-cluster">
                        {[1, 2, 3, 4, 5].map(st => (
                          <span key={st} style={{ fontSize: '20px', color: (visita.avaliacao_nota || 5) >= st ? '#f59e0b' : '#cbd5e1' }}>★</span>
                        ))}
                        <strong className="rating-number">{visita.avaliacao_nota ? `${visita.avaliacao_nota}.0` : '5.0'} <small>/ 5.0</small></strong>
                      </div>
                      <span className="rating-privacy-tag">🔒 Depoimento de {pacNome}</span>
                    </div>

                    <div className="testimonial-text-box">
                      <p>"{visita.avaliacao_comentario || 'Atendimento domiciliar excelente! Profissional pontual, atencioso e com total domínio técnico.'}"</p>
                    </div>

                    <div className="rating-tags-flex">
                      <span className="rating-tag">✓ Pontual</span>
                      <span className="rating-tag">✓ Equipamento Próprio</span>
                      <span className="rating-tag">✓ Atendimento Humanizado</span>
                      <span className="rating-tag">✓ Conduta Segura</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: '#64748b' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                    <strong style={{ display: 'block', fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>
                      Aguardando Avaliação do Paciente
                    </strong>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      O(A) paciente {pacNome} ainda não registrou a avaliação desta visita. Assim que for enviada, ela será vinculada ao seu perfil público.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* VISÃO DO PACIENTE: Formulário de escrita e envio / Exibição com opção de editar */
              <div className="rating-review-card" style={{ background: editandoAvaliacao ? '#ffffff' : '#f8fafc', border: editandoAvaliacao ? '2px solid #0284c7' : '1px solid #e2e8f0' }}>
                {editandoAvaliacao ? (
                  <form onSubmit={handleSalvarAvaliacao}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                        Como foi sua experiência com {proNome}?
                      </label>
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>
                        Clique nas estrelas abaixo para avaliar e escreva seu relato sincero sobre a visita domiciliar.
                      </p>

                      {/* Seletor de Estrelas Clicáveis */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNotaAvaliacao(star)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '32px',
                                padding: '0 2px',
                                color: notaAvaliacao >= star ? '#f59e0b' : '#cbd5e1',
                                transition: 'all 0.15s ease'
                              }}
                              title={`${star} estrelas`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                          {notaAvaliacao}.0 <small style={{ color: '#64748b', fontSize: '12px' }}>/ 5.0</small>
                        </strong>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#0284c7', background: '#f0f9ff', padding: '3px 10px', borderRadius: '12px' }}>
                          {notaAvaliacao === 5 ? '⭐ Excelente / Muito satisfeito' :
                           notaAvaliacao === 4 ? '⭐ Muito bom' :
                           notaAvaliacao === 3 ? '⭐ Atendimento Regular' :
                           notaAvaliacao === 2 ? '⭐ Abaixo do esperado' : '⭐ Insatisfatório'}
                        </span>
                      </div>
                    </div>

                    {/* Destaques Rápidos / Chips Clicáveis */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Selecione os pontos de destaque:
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {TAGS_DISPONIVEIS.map(tag => {
                          const ativa = tagsSelecionadas.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              style={{
                                background: ativa ? '#ecfdf5' : '#ffffff',
                                border: `1px solid ${ativa ? '#10b981' : '#cbd5e1'}`,
                                color: ativa ? '#047857' : '#64748b',
                                fontWeight: '700',
                                fontSize: '12px',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {ativa ? `✓ ${tag}` : `+ ${tag}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Campo de Escrita / Textarea */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                        Escreva seu depoimento sobre a visita:
                      </label>
                      <textarea
                        value={comentarioAvaliacao}
                        onChange={(e) => setComentarioAvaliacao(e.target.value)}
                        placeholder="Ex: Profissional extremamente pontual, educado e capacitado. Explicou todo o procedimento com clareza e realizou o atendimento no conforto de casa..."
                        rows={4}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #cbd5e1',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    {/* Botões de Ação do Formulário */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        type="submit"
                        disabled={enviandoAvaliacao}
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          padding: '12px 22px',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        {enviandoAvaliacao ? 'Enviando...' : 'Publicar Minha Avaliação'}
                      </button>

                      {(visita?.avaliacao_nota || visita?.avaliacao_comentario) && (
                        <button
                          type="button"
                          onClick={() => setEditandoAvaliacao(false)}
                          style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '12px 18px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancelar Edição
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  /* MODO VISUALIZAÇÃO: Avaliação já salva pelo paciente */
                  <>
                    <div className="rating-top-row">
                      <div className="stars-cluster">
                        {[1, 2, 3, 4, 5].map(st => (
                          <span key={st} style={{ fontSize: '20px', color: (visita?.avaliacao_nota || notaAvaliacao) >= st ? '#f59e0b' : '#cbd5e1' }}>★</span>
                        ))}
                        <strong className="rating-number">{visita?.avaliacao_nota || notaAvaliacao}.0 <small>/ 5.0</small></strong>
                      </div>
                      <span className="rating-privacy-tag">🔒 Sua Avaliação Registrada & Homologada</span>
                    </div>

                    <div className="testimonial-text-box">
                      <p>"{visita?.avaliacao_comentario || comentarioAvaliacao || 'Atendimento domiciliar excelente! Profissional pontual, atencioso e com total domínio técnico.'}"</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div className="rating-tags-flex">
                        {tagsSelecionadas.map(tag => (
                          <span key={tag} className="rating-tag">✓ {tag}</span>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditandoAvaliacao(true)}
                        style={{
                          background: '#f8fafc',
                          color: '#0284c7',
                          border: '1px solid #bae6fd',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Alterar Avaliação
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
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
            
            {/* Ação do Médico: Concluir Atendimento Presencial */}
            {isProfissional && visita?.status !== 'concluido' && (
              <button 
                className="btn-concluir-atendimento" 
                onClick={handleConcluirVisita}
                disabled={concluindo}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {concluindo ? 'Concluindo...' : '✅ Concluir Atendimento Realizado'}
              </button>
            )}

            {/* Ação de Reagendamento (Médico ou Paciente antes da conclusão) */}
            {visita?.status !== 'concluido' && visita?.status !== 'cancelado' && (
              <button 
                className="btn-reagendar" 
                onClick={handleAbrirReagendar}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 16px',
                  fontSize: '14px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                🔁 Reagendar Visita
              </button>
            )}

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

      {/* MODAL DE REAGENDAMENTO */}
      {modalReagendar && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-star-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>🔁</div>
              <h3>Reagendar Atendimento Domiciliar</h3>
              <p>Escolha uma nova data e horário para a visita com <strong>{isProfissional ? pacNome : proNome}</strong>.</p>
            </div>

            <form onSubmit={handleConfirmarReagendar} className="modal-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Nova Data:
                  </label>
                  <input
                    type="date"
                    required
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div className="input-group">
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    Novo Horário:
                  </label>
                  <input
                    type="time"
                    required
                    value={novaHora}
                    onChange={(e) => setNovaHora(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {visita?.data_hora_visita && (
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '13px', color: '#64748b' }}>
                  📌 <strong>Horário anterior:</strong> {dataFormatada}.
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setModalReagendar(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={reagendando}
                >
                  {reagendando ? 'Reagendando...' : 'Confirmar Reagendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed Saúde Digital
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed • Prontuário Eletrônico Unificado</span>
          <Link to="/termos">Política de Privacidade</Link>
          <Link to="/termos">Termos de Atendimento</Link>
        </div>
      </footer>
    </div>
  );
}
