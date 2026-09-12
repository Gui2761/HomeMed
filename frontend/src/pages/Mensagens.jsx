import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Mensagens.css';

export default function Mensagens() {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversas, setConversas] = useState([]);
  const [conversaAtiva, setConversaAtiva] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('@HomeMed:usuario');
    if (rawUser) {
      try { setUsuarioAtual(JSON.parse(rawUser)); } catch (e) {}
    }
  }, []);

  const carregarConversas = async () => {
    try {
      const lista = await api.listarConversas();
      if (Array.isArray(lista)) {
        setConversas(lista);
        const convDesejadaId = location.state?.conversaId;
        if (convDesejadaId) {
          const encontrada = lista.find(c => c.id === convDesejadaId);
          if (encontrada) setConversaAtiva(encontrada);
          else if (lista.length > 0) setConversaAtiva(lista[0]);
        } else if (lista.length > 0 && !conversaAtiva) {
          setConversaAtiva(lista[0]);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    }
  };

  const carregarMensagens = async (convId) => {
    if (!convId) return;
    try {
      const msgs = await api.obterMensagens(convId);
      setMensagens(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  useEffect(() => {
    carregarConversas();
  }, [location.state]);

  useEffect(() => {
    if (conversaAtiva?.id) {
      carregarMensagens(conversaAtiva.id);
    }
  }, [conversaAtiva]);

  const handleEnviarMensagem = async (e) => {
    e?.preventDefault();
    if (!novoTexto.trim() || !conversaAtiva?.id || enviando) return;

    setEnviando(true);
    try {
      const texto = novoTexto;
      setNovoTexto('');
      await api.enviarMensagem(conversaAtiva.id, {
        conteudo: texto,
        tipo_mensagem: 'texto'
      });
      await carregarMensagens(conversaAtiva.id);
      await carregarConversas();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    } finally {
      setEnviando(false);
    }
  };

  const handleConfirmarAgendamento = async () => {
    if (!conversaAtiva || confirmando) return;
    setConfirmando(true);
    try {
      await api.criarAgendamento({
        profissional_id: conversaAtiva.profissional_id,
        valor_total: conversaAtiva.preco_base || 180.00
      });

      // Envia mensagem no chat informando confirmação
      await api.enviarMensagem(conversaAtiva.id, {
        conteudo: '✅ Agendamento de visita domiciliar confirmado com sucesso pelo paciente!',
        tipo_mensagem: 'texto'
      });

      alert('Agendamento confirmado com sucesso! Redirecionando para suas consultas...');
      navigate('/consultas');
    } catch (err) {
      console.error('Erro ao confirmar agendamento:', err);
      alert(`Atenção: ${err.message || 'Verifique se você possui endereço cadastrado no perfil.'}`);
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          <strong>HomeMed</strong>
        </div>
        <div className="nav-links">
          <Link to="/home">Início</Link>
          <Link to="/consultas">Consultas & Agendamentos</Link>
          <Link to="/mensagens" className="active">Mensagens</Link>
          <Link to="/credenciamento">Credenciamento</Link>
          <Link to="/admin">Administração</Link>
          <Link to="/perfil">Perfil</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" title="Notificações"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></button>
          <Link to="/perfil" className="avatar-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>
        </div>
      </nav>

      {/* CHAT LAYOUT 3 COLUNAS (RF15, RF16, RF17, RF18) */}
      <div className="chat-layout">
        
        {/* COLUNA 1: Lista de Conversas Recentes (RF15) */}
        <div className="chat-sidebar">
          <h3>Mensagens</h3>
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="Buscar conversas..." />
          </div>

          <div className="conversation-list">
            {conversas.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                Nenhuma conversa aberta no momento. Inicie um chat através da Home!
              </div>
            ) : (
              conversas.map(conv => (
                <div 
                  key={conv.id} 
                  className={conversaAtiva?.id === conv.id ? 'convo-item active' : 'convo-item'}
                  onClick={() => setConversaAtiva(conv)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={conv.interlocutor_foto || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100'} alt={conv.interlocutor_nome} />
                  <div className="convo-info">
                    <div className="convo-header">
                      <h4>{conv.interlocutor_nome}</h4>
                      <span className="time">
                        {conv.ultima_mensagem_data ? new Date(conv.ultima_mensagem_data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p>{conv.ultima_mensagem ? (conv.ultima_mensagem.substring(0, 30) + '...') : 'Iniciar conversa...'}</p>
                  </div>
                  {conv.nao_lidas > 0 && (
                    <span className="badge-unread">{conv.nao_lidas}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 2: Janela de Chat em Tempo Real (RF16 & RF17) */}
        <div className="chat-window">
          {conversaAtiva ? (
            <>
              <div className="chat-header">
                <div className="chat-user">
                  <img src={conversaAtiva.interlocutor_foto || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100'} alt={conversaAtiva.interlocutor_nome} />
                  <div>
                    <h4>{conversaAtiva.interlocutor_nome}</h4>
                    <span>{conversaAtiva.interlocutor_especialidade}</span>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button title="Chamada de Vídeo"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg></button>
                  <button title="Chamada Telefônica"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
                </div>
              </div>

              <div className="chat-body">
                <div className="chat-date">Histórico de Mensagens</div>

                {mensagens.map(msg => {
                  const isMinha = usuarioAtual?.id && msg.remetente_id === usuarioAtual.id;

                  // Se for proposta estruturada de atendimento (RF17)
                  if (msg.tipo_mensagem === 'proposta') {
                    const meta = msg.metadados_servico || {};
                    return (
                      <div key={msg.id} className="card-proposal">
                        <div className="proposal-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
                        </div>
                        <div className="proposal-content">
                          <h5>{meta.servico || 'Solicitação de Visita Domiciliar'}</h5>
                          <p>{msg.conteudo}</p>
                          <div className="proposal-footer">
                            <span>R$ {parseFloat(meta.valor || conversaAtiva.preco_base || 180).toFixed(2).replace('.', ',')}</span>
                            <span>{meta.endereco || 'Residência do Paciente'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Mensagem de texto normal
                  return (
                    <div key={msg.id} className={isMinha ? 'message-bubble sent' : 'message-bubble received'}>
                      <p>{msg.conteudo}</p>
                      <span className="msg-time">
                        {new Date(msg.enviado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })}
              </div>

              <form className="chat-input-area" onSubmit={handleEnviarMensagem}>
                <button type="button" className="btn-attachment" title="Enviar Exame / Anexo">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <input 
                  type="text" 
                  placeholder="Digite sua mensagem..." 
                  value={novoTexto}
                  onChange={(e) => setNovoTexto(e.target.value)}
                />
                <button type="submit" className="btn-send" disabled={enviando || !novoTexto.trim()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </form>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
              Selecione uma conversa para visualizar o chat.
            </div>
          )}
        </div>

        {/* COLUNA 3: Detalhes do Serviço & Confirmação (RF18) */}
        {conversaAtiva && (
          <div className="chat-details">
            <div className="details-profile">
              <img src={conversaAtiva.interlocutor_foto || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150'} alt={conversaAtiva.interlocutor_nome} />
              <h4>{conversaAtiva.interlocutor_nome}</h4>
              <span>{conversaAtiva.interlocutor_especialidade}</span>
              <div className="details-rating">⭐ {parseFloat(conversaAtiva.nota_media || 4.9).toFixed(1)} <small>(Especialista Verificado)</small></div>
            </div>

            <div className="details-box">
              <h5>Detalhes do Serviço</h5>
              <div className="service-row">
                <div>
                  <strong>{conversaAtiva.interlocutor_especialidade}</strong>
                  <p>Atendimento Domiciliar ({conversaAtiva.unidade_cobranca || 'sessão'})</p>
                </div>
                <span className="service-price">R$ {parseFloat(conversaAtiva.preco_base || 180).toFixed(0)}</span>
              </div>
              <div className="service-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Residência do Paciente</span>
              </div>
              <div className="service-info-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Horário a combinar</span>
              </div>
            </div>

            <div className="details-actions">
              <button 
                className="btn-confirm" 
                onClick={handleConfirmarAgendamento}
                disabled={confirmando}
              >
                {confirmando ? 'Confirmando...' : 'Confirmar Agendamento'}
              </button>
              <button className="btn-cancel" onClick={() => navigate('/home')}>
                Voltar para Início
              </button>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed Saúde Digital</span>
          <a href="#">Termos de Uso</a>
          <a href="#">Privacidade</a>
        </div>
      </footer>
    </div>
  );
}