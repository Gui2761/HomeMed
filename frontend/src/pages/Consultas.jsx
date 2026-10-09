import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import './Consultas.css';

export default function Consultas() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [filtroAtivo, setFiltroAtivo] = useState('todas');
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAvaliacao, setModalAvaliacao] = useState(null);
  const [notaAvaliacao, setNotaAvaliacao] = useState(5);
  const [comentarioAvaliacao, setComentarioAvaliacao] = useState('');
  const [avaliando, setAvaliando] = useState(false);

  const carregarConsultas = async (filtro = filtroAtivo) => {
    try {
      setCarregando(true);
      const lista = await api.listarAgendamentos(filtro);
      setAgendamentos(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      if (rawUser) setUsuario(JSON.parse(rawUser));
    } catch (e) {}
    carregarConsultas(filtroAtivo);
  }, [filtroAtivo]);

  const handleFiltrar = (f) => {
    setFiltroAtivo(f);
  };

  const handleEnviarAvaliacao = async (e) => {
    e.preventDefault();
    if (!modalAvaliacao) return;
    setAvaliando(true);
    try {
      await api.registrarAvaliacao({
        agendamento_id: modalAvaliacao.agendamentoId,
        nota: notaAvaliacao,
        comentario: comentarioAvaliacao
      });
      alert('Avaliação registrada com sucesso! Agradecemos sua colaboração.');
      setModalAvaliacao(null);
      setComentarioAvaliacao('');
      await carregarConsultas(filtroAtivo);
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      alert('Erro ao registrar avaliação.');
    } finally {
      setAvaliando(false);
    }
  };

  const proximaVisita = agendamentos.find(a => a.status === 'confirmado');
  const outrasVisitas = agendamentos.filter(a => a.id !== proximaVisita?.id);

  const totalProximas = agendamentos.filter(a => a.status === 'confirmado' || a.status === 'pendente').length;
  const totalConcluidas = agendamentos.filter(a => a.status === 'concluido').length;

  const tipo = usuario?.tipo_usuario || 'paciente';

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar />

      {/* CABEÇALHO DA PÁGINA */}
      <header className="page-header-consultas">
        <div className="header-titles">
          <span className="subtitle-top">
            {tipo === 'profissional' ? 'AGENDA MÉDICA DOMICILIAR' : 'GESTÃO CLÍNICA DO PACIENTE'}
          </span>
          <h1>
            {tipo === 'profissional' ? 'Minha Agenda de Visitas Domiciliares' : 'Minhas Consultas e Agendamentos'}
          </h1>
          <p>
            {tipo === 'profissional' 
              ? 'Acompanhe seus atendimentos presenciais agendados, confirme visitas e faça check-in.'
              : 'Gerencie suas visitas presenciais, histórico de atendimento e avalie os profissionais.'}
          </p>
        </div>
        <div className="header-top-actions">
          {tipo === 'paciente' && (
            <button className="btn-agendar-novo" onClick={() => navigate('/home')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agendar Nova Visita
            </button>
          )}
        </div>
      </header>

      {/* FILTROS DE STATUS */}
      <div className="filters-bar">
        <div className="filter-tags">
          <button 
            type="button"
            className={filtroAtivo === 'todas' ? 'f-tag active' : 'f-tag'} 
            onClick={() => handleFiltrar('todas')}
          >
            Todas ({agendamentos.length})
          </button>
          <button 
            type="button"
            className={filtroAtivo === 'proximas' ? 'f-tag active' : 'f-tag'} 
            onClick={() => handleFiltrar('proximas')}
          >
            Próximas ({totalProximas})
          </button>
          <button 
            type="button"
            className={filtroAtivo === 'concluidas' ? 'f-tag active' : 'f-tag'} 
            onClick={() => handleFiltrar('concluidas')}
          >
            Concluídas ({totalConcluidas})
          </button>
          <button 
            type="button"
            className={filtroAtivo === 'canceladas' ? 'f-tag active' : 'f-tag'} 
            onClick={() => handleFiltrar('canceladas')}
          >
            Canceladas
          </button>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL: 2 COLUNAS */}
      <div className="consultas-main-layout">
        
        {/* COLUNA ESQUERDA: LISTAGEM */}
        <div className="consultas-list-section">
          
          {/* PRÓXIMA VISITA DOMICILIAR EM DESTAQUE */}
          {proximaVisita && (
            <div className="consultas-card featured-visit-card">
              <div className="visit-card-header">
                <div className="badge-confirmed-pulse">
                  <span className="pulse-indicator"></span>
                  PRÓXIMA VISITA CONFIRMADA
                </div>
                <div className="visit-datetime-tag">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>
                    {new Date(proximaVisita.data_hora_visita).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} às {new Date(proximaVisita.data_hora_visita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="visit-card-body">
                <img 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200" 
                  alt={proximaVisita.profissional_nome} 
                  className="visit-doc-avatar"
                />
                <div className="visit-doc-details">
                  <div className="doc-specialty-badge">{proximaVisita.especialidade_principal}</div>
                  <h3>{proximaVisita.profissional_nome}</h3>
                  <div className="visit-location-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>
                      {proximaVisita.logradouro ? `${proximaVisita.logradouro}, ${proximaVisita.numero} - ${proximaVisita.bairro}` : 'Endereço cadastrado na conta'}
                    </span>
                  </div>
                </div>

                <div className="visit-price-badge">
                  <span className="price-tag-label">VALOR DA SESSÃO</span>
                  <strong>R$ {parseFloat(proximaVisita.valor_total).toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>

              <div className="visit-card-footer">
                <div className="action-buttons-group">
                  <button className="btn-chat-primary" onClick={() => navigate('/mensagens')}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Falar com Especialista
                  </button>
                  <button className="btn-secondary-outline" onClick={() => navigate('/consultas/detalhes')}>
                    Ver Prontuário & Recibo
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="section-sub-title">
            <h3>Demais Visitas e Histórico</h3>
            <span>Organizado cronologicamente</span>
          </div>

          {carregando ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando seus atendimentos...</p>
            </div>
          ) : outrasVisitas.length === 0 && !proximaVisita ? (
            <div className="empty-state">
              <p>Nenhuma consulta encontrada para este filtro.</p>
              <button className="btn-outline" onClick={() => setFiltroAtivo('todas')}>
                Ver Todas as Consultas
              </button>
            </div>
          ) : (
            outrasVisitas.map(visita => (
              <div className="consultas-card history-card" key={visita.id}>
                <div className="history-left">
                  <img 
                    src={
                      visita.especialidade_principal?.includes('Cuidador')
                        ? 'https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=120&h=120'
                        : visita.especialidade_principal?.includes('Médic') || visita.especialidade_principal?.includes('Clínic')
                        ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120&h=120'
                        : 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=120&h=120'
                    } 
                    alt={visita.profissional_nome} 
                    className="history-avatar"
                  />
                  <div className="history-info">
                    <div className="history-header-row">
                      <h4>{visita.profissional_nome}</h4>
                      <span className={`status-pill ${visita.status}`}>
                        {visita.status === 'concluido' ? 'Concluída' : visita.status === 'cancelado' ? 'Cancelada' : 'Confirmado'}
                      </span>
                    </div>
                    <div className="history-specialty">{visita.especialidade_principal}</div>
                    <div className="history-meta">
                      <span>📅 {new Date(visita.data_hora_visita).toLocaleDateString('pt-BR')} às {new Date(visita.data_hora_visita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>💰 R$ {parseFloat(visita.valor_total).toFixed(2).replace('.', ',')}</span>
                    </div>

                    {visita.avaliacao_nota && (
                      <div className="rated-box">
                        ⭐ Nota {visita.avaliacao_nota}/5 {visita.avaliacao_comentario ? `— "${visita.avaliacao_comentario}"` : ''}
                      </div>
                    )}
                  </div>
                </div>

                <div className="history-actions-stack">
                  {visita.status === 'concluido' && !visita.avaliacao_id && (
                    <button 
                      className="btn-avaliar" 
                      onClick={() => setModalAvaliacao({ agendamentoId: visita.id, proNome: visita.profissional_nome })}
                    >
                      ⭐ Avaliar Visita
                    </button>
                  )}
                  <button className="btn-reagendar" onClick={() => navigate('/home')}>
                    Reagendar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* COLUNA DIREITA: RESUMO E SUPORTE */}
        <div className="consultas-sidebar-right">
          
          <div className="widget-card">
            <div className="widget-header">
              <h3>Resumo Geral</h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
            </div>
            
            <div className="stats-counters-grid">
              <div className="counter-item">
                <strong>{totalProximas.toString().padStart(2, '0')}</strong>
                <span>Agendadas</span>
              </div>
              <div className="counter-item">
                <strong>{totalConcluidas.toString().padStart(2, '0')}</strong>
                <span>Realizadas</span>
              </div>
              <div className="counter-item">
                <strong>03</strong>
                <span>Favoritos</span>
              </div>
            </div>

            <div className="progress-box">
              <div className="progress-labels">
                <span>Progresso do Tratamento</span>
                <strong>75%</strong>
              </div>
              <div className="progress-bar-track">
                <div className="progress-bar-active" style={{ width: '75%' }}></div>
              </div>
              <small>Todas as visitas ficam registradas no prontuário eletrônico unificado.</small>
            </div>
          </div>

          <div className="widget-card tips-card">
            <div className="tips-card-header">
              <span className="tips-icon">💡</span>
              <div>
                <h4>Recomendações para a Visita</h4>
                <p>Boas práticas para atendimento domiciliar</p>
              </div>
            </div>
            <ul className="tips-bullet-list">
              <li>Mantenha documentos e receituários anteriores à mão.</li>
              <li>Garanta boa iluminação e ventilação no quarto de atendimento.</li>
              <li>Profissional equipado com paramentação descartável e EPIs.</li>
            </ul>
          </div>

        </div>
      </div>

      {/* MODAL DE AVALIAÇÃO COM DESIGN STITCH */}
      {modalAvaliacao && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-star-icon">⭐</div>
              <h3>Avaliar Atendimento</h3>
              <p>Como foi sua experiência com <strong>{modalAvaliacao.proNome}</strong>?</p>
            </div>

            <form onSubmit={handleEnviarAvaliacao} className="modal-form">
              <div className="rating-select-group">
                <label>Sua nota de satisfação:</label>
                <div className="stars-picker">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      className={notaAvaliacao >= star ? 'star-btn active' : 'star-btn'}
                      onClick={() => setNotaAvaliacao(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="rating-desc-text">
                  {notaAvaliacao === 5 ? 'Excelente / Muito satisfeito(a)' : notaAvaliacao === 4 ? 'Muito bom' : notaAvaliacao === 3 ? 'Regular' : 'Abaixo do esperado'}
                </span>
              </div>

              <div className="input-group">
                <label>Comentário ou depoimento (opcional):</label>
                <textarea
                  value={comentarioAvaliacao}
                  onChange={(e) => setComentarioAvaliacao(e.target.value)}
                  placeholder="Profissional muito atencioso, pontual e paciente..."
                  rows="3"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setModalAvaliacao(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={avaliando}
                >
                  {avaliando ? 'Enviando...' : 'Confirmar Avaliação'}
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
          <span>© 2026 HomeMed • Gestão de Atendimentos</span>
          <a href="#">Termos</a>
          <a href="#">Privacidade</a>
        </div>
      </footer>
    </div>
  );
}