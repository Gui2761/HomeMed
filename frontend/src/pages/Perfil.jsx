import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import './Perfil.css';

// Avatares predefinidos em alta resolução por perfil
const AVATARES_PRESET = {
  profissional: [
    { nome: 'Dr. Gabriel (Clínico)', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Dra. Mariana (Pediatra)', url: 'https://images.unsplash.com/photo-1594824813637-a169e5d4cb0f?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Dr. Lucas (Geriatra)', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Enf. Camila (Enfermagem)', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Dra. Beatriz (Fisioterapia)', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300' }
  ],
  paciente: [
    { nome: 'Ana Clara', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Juliana', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Carlos', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Helena', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Roberto', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300' }
  ],
  admin: [
    { nome: 'Gestor HomeMed', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Diretoria Clínica', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Auditoria & Compliance', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300&h=300' },
    { nome: 'Coordenação Geral', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300&h=300' }
  ]
};

export default function Perfil() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [usuario, setUsuario] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('pessoal');
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Foto de Perfil & Modal
  const [modalFotoAberta, setModalFotoAberta] = useState(false);
  const [fotoAtual, setFotoAtual] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [urlCustomFoto, setUrlCustomFoto] = useState('');

  // Formulário do Paciente / Geral
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

  // Formulário do Admin
  const [adminData, setAdminData] = useState({
    departamento: 'Gestão e Auditoria Central'
  });

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        setUsuario(u);
        if (u.foto_url) {
          setFotoAtual(u.foto_url);
          setFotoPreview(u.foto_url);
        }
      }
    } catch (e) {}

    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setCarregando(true);
      const rawUser = localStorage.getItem('@HomeMed:usuario');
      const u = rawUser ? JSON.parse(rawUser) : null;
      const tipo = u?.tipo_usuario || 'paciente';

      if (tipo === 'profissional') {
        const [dadosPro, consultas] = await Promise.all([
          api.obterMeuPerfilProfissional(),
          api.listarAgendamentos('concluidas')
        ]);

        if (dadosPro && !dadosPro.error) {
          setPerfil(dadosPro);
          const foto = dadosPro.foto_url || u?.foto_url || '';
          if (foto) {
            setFotoAtual(foto);
            setFotoPreview(foto);
          }
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
      } else if (tipo === 'admin') {
        const [dadosAdmin, todasConsultas] = await Promise.all([
          api.obterPerfilUsuario(),
          api.listarAgendamentos('todas')
        ]);

        if (dadosAdmin && !dadosAdmin.error) {
          setPerfil(dadosAdmin);
          const foto = dadosAdmin.foto_url || u?.foto_url || '';
          if (foto) {
            setFotoAtual(foto);
            setFotoPreview(foto);
          }
          setFormData({
            nome: dadosAdmin.nome || u?.nome || '',
            email: dadosAdmin.email || u?.email || '',
            telefone: dadosAdmin.telefone || u?.telefone || '',
            cpf: ''
          });
        }
        setHistorico(Array.isArray(todasConsultas) ? todasConsultas : []);
      } else {
        // Paciente
        const [dadosPerfil, consultasConcluidas] = await Promise.all([
          api.obterPerfilPaciente(),
          api.listarAgendamentos('concluidas')
        ]);

        if (dadosPerfil && !dadosPerfil.error) {
          setPerfil(dadosPerfil);
          const foto = dadosPerfil.foto_url || u?.foto_url || '';
          if (foto) {
            setFotoAtual(foto);
            setFotoPreview(foto);
          }
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

  // Upload e Redimensionamento Local com HTML Canvas
  const handleSelecionarArquivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Arquivo muito pesado. Escolha uma foto com até 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
        setFotoPreview(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmarFoto = async () => {
    const fotoFinal = fotoPreview || urlCustomFoto || fotoAtual;
    setFotoAtual(fotoFinal);
    setModalFotoAberta(false);

    // Salva imediatamente no banco para conveniência
    try {
      const isPro = usuario?.tipo_usuario === 'profissional';
      if (isPro) {
        await api.salvarCredenciamento({ foto_url: fotoFinal });
      } else {
        await api.atualizarPerfilUsuario({ foto_url: fotoFinal });
      }

      // Atualiza localStorage e emite evento para a Navbar sincronizar instantaneamente
      if (usuario) {
        const uAtualizado = { ...usuario, foto_url: fotoFinal };
        localStorage.setItem('@HomeMed:usuario', JSON.stringify(uAtualizado));
        setUsuario(uAtualizado);
        window.dispatchEvent(new Event('user-profile-updated'));
        window.dispatchEvent(new Event('storage'));
      }
      setMensagemSucesso('Foto de perfil alterada e sincronizada com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar foto:', err);
    }
  };

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagemSucesso('');

    const tipo = usuario?.tipo_usuario || 'paciente';

    try {
      const fotoParaSalvar = fotoAtual || fotoPreview || (usuario?.foto_url || '');

      if (tipo === 'profissional') {
        await Promise.all([
          api.atualizarPerfilUsuario({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            foto_url: fotoParaSalvar
          }),
          api.salvarCredenciamento({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            foto_url: fotoParaSalvar,
            registro_profissional: proData.registro_profissional,
            especialidade_principal: proData.especialidade_principal,
            preco_base: parseFloat(proData.preco_base) || 180.00,
            unidade_cobranca: proData.unidade_cobranca,
            bio: proData.bio,
            disponivel_hoje: proData.disponivel_hoje
          })
        ]);
        setMensagemSucesso('Dados do profissional e foto salvos com sucesso!');
      } else if (tipo === 'admin') {
        await api.atualizarPerfilUsuario({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          foto_url: fotoParaSalvar
        });
        setMensagemSucesso('Dados de administrador e foto salvos com sucesso!');
      } else {
        // Paciente
        await Promise.all([
          api.atualizarPerfilPaciente({
            nome: formData.nome,
            telefone: formData.telefone,
            email: formData.email,
            foto_url: fotoParaSalvar
          }),
          api.salvarEnderecoPaciente(enderecoData)
        ]);
        setMensagemSucesso('Informações pessoais, foto e endereço residencial salvos com sucesso!');
      }

      // Atualiza usuário no localStorage
      if (usuario) {
        const uAtualizado = { 
          ...usuario, 
          nome: formData.nome, 
          email: formData.email, 
          telefone: formData.telefone,
          foto_url: fotoParaSalvar 
        };
        localStorage.setItem('@HomeMed:usuario', JSON.stringify(uAtualizado));
        setUsuario(uAtualizado);
        window.dispatchEvent(new Event('user-profile-updated'));
        window.dispatchEvent(new Event('storage'));
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
  const presetsDisponiveis = AVATARES_PRESET[tipo] || AVATARES_PRESET.paciente;

  const fotoExibicao = fotoAtual || perfil?.foto_url || usuario?.foto_url || (
    tipo === 'profissional'
      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=300'
      : tipo === 'admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300'
      : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300'
  );

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTEÚDO PRINCIPAL DO PERFIL */}
      <div className="profile-layout">
        
        {/* COLUNA ESQUERDA: Card de Usuário e Estatísticas */}
        <div className="profile-sidebar">
          <div className="user-card-main">
            <div 
              className="avatar-container" 
              onClick={() => { setFotoPreview(fotoExibicao); setModalFotoAberta(true); }}
              title="Clique para alterar sua foto de perfil"
            >
              <img 
                src={fotoExibicao} 
                alt={perfil?.nome || usuario?.nome || 'Usuário'} 
              />
              <span className="avatar-edit-overlay-btn" title="Alterar Foto">
                📷
              </span>
            </div>

            <button 
              type="button" 
              className="btn-open-photo-modal"
              onClick={() => { setFotoPreview(fotoExibicao); setModalFotoAberta(true); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Alterar Foto de Perfil
            </button>
            
            <div 
              className="user-type-pill" 
              style={{ 
                background: tipo === 'admin' ? '#fee2e2' : tipo === 'profissional' ? '#ecfdf5' : '#e0f2fe', 
                color: tipo === 'admin' ? '#b91c1c' : tipo === 'profissional' ? '#047857' : '#0369a1',
                marginTop: '12px'
              }}
            >
              {tipo === 'profissional' ? '👨‍⚕️ ESPECIALISTA HOMEMED' : tipo === 'admin' ? '🛡️ ADMINISTRADOR CENTRAL' : '👤 PACIENTE VERIFICADO'}
            </div>
            
            <h2>{formData.nome || usuario?.nome || 'Carregando perfil...'}</h2>
            
            <div className="user-location">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>
                {tipo === 'profissional'
                  ? 'Atendimento Domiciliar Regional'
                  : tipo === 'admin'
                  ? 'Sede Operacional HomeMed'
                  : perfil?.endereco?.cidade 
                  ? `${perfil.endereco.cidade}, ${perfil.endereco.uf}` 
                  : 'Endereço não cadastrado'}
              </span>
            </div>

            <div className="profile-buttons">
              <button className="btn-edit-profile" onClick={() => setAbaAtiva('pessoal')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                Editar Informações
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
              <span>{tipo === 'admin' ? 'CONSULTAS TOTAIS' : 'VISITAS REALIZADAS'}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              {tipo === 'profissional' ? (
                <>
                  <strong>R$ {parseFloat(proData.preco_base || 180).toFixed(0)}</strong>
                  <span>VALOR BASE</span>
                </>
              ) : tipo === 'admin' ? (
                <>
                  <strong>SuperAdmin</strong>
                  <span>NÍVEL ACESSO</span>
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
              {tipo === 'profissional' 
                ? 'Dados Médicos & Honorários' 
                : tipo === 'admin' 
                ? 'Gestão de Administrador' 
                : 'Informações & Endereço Residencial'}
            </button>
            <button 
              type="button"
              className={abaAtiva === 'historico' ? 'tab-btn active' : 'tab-btn'}
              onClick={() => setAbaAtiva('historico')}
            >
              {tipo === 'admin' ? `Consultas Globais (${historico.length})` : `Histórico (${historico.length})`}
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

            {/* ABA 1: FORMULÁRIO DE EDIÇÃO */}
            {abaAtiva === 'pessoal' && (
              <form onSubmit={handleSalvarPerfil} className="profile-form">
                
                {/* DADOS CADASTRAIS GERAIS */}
                <div className="form-section-card">
                  <div className="section-title-row">
                    <h3>Identificação & Contato</h3>
                    <span className="section-chip">Editável</span>
                  </div>
                  <p>Mantenha seus dados sempre atualizados para contato e emissão de comprovantes.</p>
                  
                  <div className="form-grid-2">
                    <div className="field-group">
                      <label>Nome Completo</label>
                      <input 
                        type="text" 
                        value={formData.nome} 
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        required
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="field-group">
                      <label>Telefone / WhatsApp</label>
                      <input 
                        type="text" 
                        value={formData.telefone} 
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        required
                        placeholder="(11) 98765-4321"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '14px' }}>
                    <div className="field-group">
                      <label>E-mail de Login</label>
                      <input 
                        type="email" 
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="seuemail@exemplo.com"
                      />
                    </div>
                    {tipo === 'paciente' ? (
                      <div className="field-group">
                        <label>CPF (Protegido por LGPD)</label>
                        <input 
                          type="text" 
                          value={formatarCpfLGPD(formData.cpf)} 
                          disabled
                          className="input-disabled"
                        />
                      </div>
                    ) : (
                      <div className="field-group">
                        <label>Tipo de Conta</label>
                        <input 
                          type="text" 
                          value={tipo === 'admin' ? 'Administrador do Sistema' : 'Profissional de Saúde'} 
                          disabled
                          className="input-disabled"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* SE FOR ADMIN: GESTÃO E ATALHOS */}
                {tipo === 'admin' && (
                  <div className="form-section-card">
                    <div className="section-title-row">
                      <h3>Controles Administrativos</h3>
                      <span className="section-chip" style={{ background: '#fef2f2', color: '#b91c1c' }}>Acesso Restrito</span>
                    </div>
                    <p>Funções exclusivas para supervisão da plataforma HomeMed.</p>

                    <div className="field-group">
                      <label>Departamento / Atribuição</label>
                      <input 
                        type="text" 
                        value={adminData.departamento} 
                        onChange={(e) => setAdminData({ ...adminData, departamento: e.target.value })}
                        placeholder="Ex: Auditoria Médica & Compliance"
                      />
                    </div>

                    <div className="admin-action-card">
                      <div>
                        <h4>Auditoria de Especialistas</h4>
                        <p>Aprove ou reprove credenciamentos de médicos e enfermeiros pendentes.</p>
                      </div>
                      <Link to="/admin" className="btn-modal-save" style={{ textDecoration: 'none', display: 'inline-block' }}>
                        Acessar Auditoria
                      </Link>
                    </div>

                    <div className="admin-action-card" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
                      <div>
                        <h4 style={{ color: '#0369a1' }}>Todas as Consultas</h4>
                        <p style={{ color: '#075985' }}>Acompanhe o status de todos os atendimentos domiciliares em tempo real.</p>
                      </div>
                      <Link to="/consultas" className="btn-modal-save" style={{ textDecoration: 'none', display: 'inline-block', background: '#0284c7' }}>
                        Ver Consultas
                      </Link>
                    </div>
                  </div>
                )}

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
                          placeholder="Ex: CRM-SP 189420 ou COREN-SP 54321"
                          required
                        />
                      </div>

                      <div className="field-group">
                        <label>Especialidade Principal</label>
                        <input 
                          type="text" 
                          value={proData.especialidade_principal} 
                          onChange={(e) => setProData({ ...proData, especialidade_principal: e.target.value })}
                          placeholder="Ex: Clínica Geral & Geriatria"
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
                          style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                        >
                          <option value="consulta">por consulta / visita</option>
                          <option value="hora">por hora de atendimento</option>
                          <option value="sessão">por sessão</option>
                          <option value="turno">por plantão (12h)</option>
                        </select>
                      </div>
                    </div>

                    <div className="field-group" style={{ marginTop: '14px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={proData.disponivel_hoje}
                          onChange={(e) => setProData({ ...proData, disponivel_hoje: e.target.checked })}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontWeight: '700', color: '#047857' }}>
                          🟢 Estou disponível para atendimentos domiciliares hoje
                        </span>
                      </label>
                    </div>

                    <div className="field-group" style={{ marginTop: '14px' }}>
                      <label>Mini-Bio / Apresentação Clínica</label>
                      <textarea 
                        rows="3"
                        value={proData.bio} 
                        onChange={(e) => setProData({ ...proData, bio: e.target.value })}
                        placeholder="Descreva sua experiência clínica, áreas de foco e metodologia humanizada."
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
                          placeholder="Ex: Av. Paulista"
                        />
                      </div>
                      <div className="field-group">
                        <label>Número</label>
                        <input 
                          type="text" 
                          value={enderecoData.numero} 
                          onChange={(e) => setEnderecoData({ ...enderecoData, numero: e.target.value })}
                          placeholder="1000"
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
                          placeholder="Apto 102"
                        />
                      </div>
                      <div className="field-group">
                        <label>Bairro</label>
                        <input 
                          type="text" 
                          value={enderecoData.bairro} 
                          onChange={(e) => setEnderecoData({ ...enderecoData, bairro: e.target.value })}
                          placeholder="Bela Vista"
                        />
                      </div>
                      <div className="field-group">
                        <label>Cidade</label>
                        <input 
                          type="text" 
                          value={enderecoData.cidade} 
                          onChange={(e) => setEnderecoData({ ...enderecoData, cidade: e.target.value })}
                          placeholder="São Paulo"
                        />
                      </div>
                      <div className="field-group">
                        <label>UF</label>
                        <input 
                          type="text" 
                          value={enderecoData.uf} 
                          onChange={(e) => setEnderecoData({ ...enderecoData, uf: e.target.value.toUpperCase() })}
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
                        placeholder="01310-100"
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
                  <h3>{tipo === 'admin' ? 'Painel de Consultas Globais' : 'Histórico de Visitas Domiciliares'}</h3>
                  <span className="section-chip">Prontuário Integrado</span>
                </div>
                <p>Histórico completo de atendimentos presenciais registrados no sistema.</p>
                
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
                          <span className="status-badge-done">Atendimento Registrado</span>
                        </div>
                        
                        <div className="history-item-meta">
                          <span>📅 {new Date(h.data_hora_visita).toLocaleDateString('pt-BR')} às {new Date(h.data_hora_visita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>💰 R$ {parseFloat(h.valor_total || 0).toFixed(2).replace('.', ',')}</span>
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

      {/* MODAL DE ALTERAÇÃO DE FOTO */}
      {modalFotoAberta && (
        <div className="photo-modal-backdrop" onClick={() => setModalFotoAberta(false)}>
          <div className="photo-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="photo-modal-header">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Alterar Foto de Perfil
              </h3>
              <button 
                type="button" 
                className="btn-close-modal" 
                onClick={() => setModalFotoAberta(false)}
              >
                ✕
              </button>
            </div>

            <div className="photo-modal-body">
              {/* Preview Centralizado */}
              <div className="photo-preview-center">
                <img 
                  src={fotoPreview || fotoExibicao} 
                  alt="Pré-visualização" 
                  className="photo-preview-large" 
                />
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Pré-visualização do seu avatar
                </span>
              </div>

              <div className="photo-upload-options">
                {/* Opção 1: Upload de Arquivo do Computador/Celular */}
                <div 
                  className="upload-file-box" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handleSelecionarArquivo} 
                  />
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>📁</div>
                  <strong style={{ display: 'block', fontSize: '13px', color: '#0284c7' }}>
                    Clique para selecionar uma foto do seu computador
                  </strong>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    Formatos aceitos: JPG, PNG, WEBP (Redimensionamento automático)
                  </span>
                </div>

                {/* Opção 2: Avatares Sugeridos */}
                <div>
                  <div className="preset-avatars-label">Ou escolha um avatar predefinido:</div>
                  <div className="preset-avatars-grid">
                    {presetsDisponiveis.map((av, index) => (
                      <img 
                        key={index}
                        src={av.url} 
                        alt={av.nome} 
                        title={av.nome}
                        className={`preset-avatar-item ${fotoPreview === av.url ? 'selected' : ''}`}
                        onClick={() => setFotoPreview(av.url)}
                      />
                    ))}
                  </div>
                </div>

                {/* Opção 3: Link/URL Externa */}
                <div className="field-group">
                  <label>Ou cole o link direto de uma imagem (URL):</label>
                  <input 
                    type="url" 
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    value={urlCustomFoto}
                    onChange={(e) => {
                      setUrlCustomFoto(e.target.value);
                      if (e.target.value) setFotoPreview(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="photo-modal-footer">
              <button 
                type="button" 
                className="btn-modal-cancel" 
                onClick={() => setModalFotoAberta(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="btn-modal-save" 
                onClick={handleConfirmarFoto}
              >
                Salvar Esta Foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/favicon.svg" alt="HomeMed" width="20" height="20" style={{ borderRadius: '5px' }} />
          HomeMed Saúde Digital
        </div>
        <div className="footer-links">
          <span>© 2026 HomeMed • Gestão de Perfil</span>
          <Link to="/termos">Termos de Acordo & Privacidade</Link>
        </div>
      </footer>
    </div>
  );
}