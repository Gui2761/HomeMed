import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import './Cadastro.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const location = useLocation();

  // Permite abrir já na aba de profissional se vier com ?tipo=profissional
  const queryParams = new URLSearchParams(location.search);
  const initialTipo = queryParams.get('tipo') === 'profissional' ? 'profissional' : 'paciente';

  const [tipoUsuario, setTipoUsuario] = useState(initialTipo);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Campos compartilhados
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  // Campos específicos de Paciente
  const [pacienteData, setPacienteData] = useState({
    cpf: '',
    dataNascimento: '',
    genero: 'Prefiro não informar',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: 'SP',
    contatoEmergenciaNome: '',
    contatoEmergenciaTel: '',
    termosAceitos: false
  });

  // Campos específicos de Profissional
  const [profissionalData, setProfissionalData] = useState({
    cpf: '',
    conselho: 'CRM',
    conselhoUf: 'SP',
    registro_profissional: '',
    especialidade_principal: 'Clínico Geral',
    areasAtuacao: '',
    anosExperiencia: '',
    preco_base: '180.00',
    unidade_cobranca: 'consulta',
    chavePix: '',
    bio: '',
    termosAceitos: false
  });

  useEffect(() => {
    const qTipo = new URLSearchParams(location.search).get('tipo');
    if (qTipo === 'profissional' || qTipo === 'paciente') {
      setTipoUsuario(qTipo);
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (erro) setErro('');
  };

  const handlePacienteChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPacienteData({
      ...pacienteData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (erro) setErro('');
  };

  const handleProfissionalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfissionalData({
      ...profissionalData,
      [name]: type === 'checkbox' ? checked : value
    });
    if (erro) setErro('');
  };

  // Busca automática de endereço por CEP (ViaCEP)
  const handleBuscarCep = async (cepInput) => {
    const cepLimpo = cepInput.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setPacienteData((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf
        }));
      }
    } catch (err) {
      console.warn('ViaCEP offline ou indisponível:', err);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas digitadas não coincidem. Digite a mesma senha em ambos os campos.');
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres para garantir sua segurança.');
      return;
    }

    if (tipoUsuario === 'paciente' && !pacienteData.termosAceitos) {
      setErro('Você precisa aceitar os Termos de Uso e Política de Privacidade LGPD para prosseguir.');
      return;
    }

    if (tipoUsuario === 'profissional' && !profissionalData.termosAceitos) {
      setErro('Você precisa confirmar a declaração de regularidade profissional para prosseguir.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const payload = {
        nome: formData.nome.trim(),
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        telefone: formData.telefone.trim(),
        tipo_usuario: tipoUsuario
      };

      if (tipoUsuario === 'paciente') {
        payload.cpf = pacienteData.cpf.trim();
        if (pacienteData.logradouro && pacienteData.cep) {
          payload.endereco = {
            logradouro: pacienteData.logradouro.trim(),
            numero: pacienteData.numero.trim() || 'S/N',
            complemento: pacienteData.complemento.trim(),
            bairro: pacienteData.bairro.trim(),
            cidade: pacienteData.cidade.trim(),
            uf: pacienteData.uf.trim().toUpperCase(),
            cep: pacienteData.cep.trim()
          };
        }
      } else {
        const registroCompleto = `${profissionalData.conselho}-${profissionalData.conselhoUf} ${profissionalData.registro_profissional}`.trim();
        payload.registro_profissional = registroCompleto;
        payload.especialidade_principal = profissionalData.especialidade_principal.trim();
        payload.preco_base = parseFloat(profissionalData.preco_base) || 180.00;
        payload.unidade_cobranca = profissionalData.unidade_cobranca;
        payload.bio = profissionalData.bio.trim();
      }

      const resposta = await api.cadastrarUsuario(payload);

      if (resposta.error) {
        setErro(resposta.error);
      } else {
        alert(`🎉 Conta de ${tipoUsuario === 'profissional' ? 'Profissional de Saúde' : 'Paciente'} criada com sucesso! Faça seu login para acessar o sistema.`);
        navigate(tipoUsuario === 'profissional' ? '/?portal=medico' : '/');
      }
    } catch (error) {
      console.error('Falha no cadastro:', error);
      setErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-page">
      {/* Top Header */}
      <header className="cadastro-header">
        <Link to="/" className="cadastro-brand" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <img src="/favicon.svg" alt="HomeMed Logo" width="30" height="30" style={{ borderRadius: '7px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
          <strong>HomeMed</strong>
        </Link>
        <div className="security-badge-top">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          <span>Privacidade & LGPD em Saúde</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="cadastro-main">
        <div className="cadastro-card" style={{ maxWidth: '680px' }}>

          {/* Seletor de Tipo de Conta */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '22px' }}>
            <button
              type="button"
              onClick={() => { setTipoUsuario('paciente'); setErro(''); }}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '8px',
                border: 'none',
                background: tipoUsuario === 'paciente' ? '#ffffff' : 'transparent',
                color: tipoUsuario === 'paciente' ? '#0284c7' : '#64748b',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: tipoUsuario === 'paciente' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>👤</span> Portal do Paciente / Familiar
            </button>
            <button
              type="button"
              onClick={() => { setTipoUsuario('profissional'); setErro(''); }}
              style={{
                flex: 1,
                padding: '11px 14px',
                borderRadius: '8px',
                border: 'none',
                background: tipoUsuario === 'profissional' ? '#ffffff' : 'transparent',
                color: tipoUsuario === 'profissional' ? '#059669' : '#64748b',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: tipoUsuario === 'profissional' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              <span>👨‍⚕️</span> Portal do Médico / Profissional
            </button>
          </div>

          <div className="card-header-center">
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
              {tipoUsuario === 'paciente' ? 'Criar Conta de Paciente' : 'Cadastro de Especialista / Médico'}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              {tipoUsuario === 'paciente' 
                ? 'Agende visitas domiciliares com enfermeiros, fisioterapeutas e médicos credenciados.'
                : 'Defina seus horários, valor de consulta e atenda pacientes residenciais na sua cidade.'}
            </p>
          </div>

          {erro && (
            <div className="alert-error-box" style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleCadastro} className="cadastro-form">

            {/* SEÇÃO 1: DADOS BÁSICOS DE ACESSO */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '12px', color: tipoUsuario === 'profissional' ? '#059669' : '#0284c7', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>
                1. Informações Pessoais & Acesso
              </h4>

              <div className="input-group" style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Nome Completo *</label>
                <div className="input-box" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#fff' }}>
                  <input 
                    type="text" 
                    name="nome" 
                    value={formData.nome} 
                    onChange={handleChange} 
                    placeholder={tipoUsuario === 'paciente' ? "Ex: Maria Silva Santos" : "Ex: Dr. Carlos Eduardo Mendes"} 
                    required 
                    style={{ border: 'none', width: '100%', padding: '10px 0', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>E-mail *</label>
                  <div className="input-box" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#fff' }}>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="seu.email@dominio.com" 
                      required 
                      style={{ border: 'none', width: '100%', padding: '10px 0', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Telefone / WhatsApp *</label>
                  <div className="input-box" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#fff' }}>
                    <input 
                      type="tel" 
                      name="telefone" 
                      value={formData.telefone} 
                      onChange={handleChange} 
                      placeholder="(11) 98765-4321" 
                      required 
                      style={{ border: 'none', width: '100%', padding: '10px 0', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* CPF e Informações complementares */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>CPF do Titular *</label>
                  <input 
                    type="text" 
                    name="cpf" 
                    value={tipoUsuario === 'paciente' ? pacienteData.cpf : profissionalData.cpf} 
                    onChange={tipoUsuario === 'paciente' ? handlePacienteChange : handleProfissionalChange} 
                    placeholder="000.000.000-00" 
                    required 
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </div>

                {tipoUsuario === 'paciente' && (
                  <>
                    <div className="input-group">
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Data de Nascimento</label>
                      <input 
                        type="date" 
                        name="dataNascimento" 
                        value={pacienteData.dataNascimento} 
                        onChange={handlePacienteChange} 
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>
                    <div className="input-group">
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Gênero / Sexo</label>
                      <select 
                        name="genero" 
                        value={pacienteData.genero} 
                        onChange={handlePacienteChange}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      >
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SEÇÃO 2: CAMPOS ESPECÍFICOS DE PACIENTE (ENDEREÇO E EMERGÊNCIA) */}
            {tipoUsuario === 'paciente' && (
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '12px', color: '#0284c7', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>
                  2. Endereço Residencial para Visitas Domiciliares
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                  Utilizado pelos médicos e enfermeiros para atendimento presencial na sua residência.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                      CEP {buscandoCep && <span style={{ color: '#0284c7' }}>(Buscando...)</span>}
                    </label>
                    <input 
                      type="text" 
                      name="cep" 
                      value={pacienteData.cep} 
                      onChange={(e) => {
                        handlePacienteChange(e);
                        if (e.target.value.replace(/\D/g, '').length === 8) {
                          handleBuscarCep(e.target.value);
                        }
                      }}
                      placeholder="00000-000" 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Logradouro (Rua, Avenida)</label>
                    <input 
                      type="text" 
                      name="logradouro" 
                      value={pacienteData.logradouro} 
                      onChange={handlePacienteChange} 
                      placeholder="Ex: Rua das Flores" 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 70px', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Número</label>
                    <input 
                      type="text" 
                      name="numero" 
                      value={pacienteData.numero} 
                      onChange={handlePacienteChange} 
                      placeholder="123" 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Complemento</label>
                    <input 
                      type="text" 
                      name="complemento" 
                      value={pacienteData.complemento} 
                      onChange={handlePacienteChange} 
                      placeholder="Apto 45" 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Bairro / Cidade</label>
                    <input 
                      type="text" 
                      name="cidade" 
                      value={pacienteData.cidade ? `${pacienteData.bairro ? pacienteData.bairro + ' - ' : ''}${pacienteData.cidade}` : ''} 
                      onChange={handlePacienteChange} 
                      placeholder="Centro - São Paulo" 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>UF</label>
                    <input 
                      type="text" 
                      name="uf" 
                      value={pacienteData.uf} 
                      onChange={handlePacienteChange} 
                      placeholder="SP" 
                      maxLength="2"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', textTransform: 'uppercase' }}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Contato de Emergência (Familiar ou Cuidador)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input 
                      type="text" 
                      name="contatoEmergenciaNome" 
                      value={pacienteData.contatoEmergenciaNome} 
                      onChange={handlePacienteChange} 
                      placeholder="Nome do contato (ex: Filho)" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                    <input 
                      type="tel" 
                      name="contatoEmergenciaTel" 
                      value={pacienteData.contatoEmergenciaTel} 
                      onChange={handlePacienteChange} 
                      placeholder="Telefone (11) 99999-9999" 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEÇÃO 2: CAMPOS ESPECÍFICOS DE PROFISSIONAL (CONSELHO, ESPECIALIDADE, PREÇO) */}
            {tipoUsuario === 'profissional' && (
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '18px' }}>
                <h4 style={{ fontSize: '12px', color: '#059669', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>
                  2. Dados do Conselho & Atuação Médica
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 80px 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Conselho *</label>
                    <select 
                      name="conselho" 
                      value={profissionalData.conselho} 
                      onChange={handleProfissionalChange}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="CRM">CRM (Medicina)</option>
                      <option value="COREN">COREN (Enfermagem)</option>
                      <option value="CREFITO">CREFITO (Fisioterapia)</option>
                      <option value="CRF">CRF (Farmácia)</option>
                      <option value="CRP">CRP (Psicologia)</option>
                      <option value="CRN">CRN (Nutrição)</option>
                      <option value="CBO">CBO (Cuidador)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>UF *</label>
                    <input 
                      type="text" 
                      name="conselhoUf" 
                      value={profissionalData.conselhoUf} 
                      onChange={handleProfissionalChange} 
                      maxLength="2"
                      placeholder="SP" 
                      required 
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', textTransform: 'uppercase' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Nº de Registro *</label>
                    <input 
                      type="text" 
                      name="registro_profissional" 
                      value={profissionalData.registro_profissional} 
                      onChange={handleProfissionalChange} 
                      placeholder="Ex: 123456" 
                      required 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Especialidade Principal *</label>
                    <input 
                      type="text" 
                      name="especialidade_principal" 
                      value={profissionalData.especialidade_principal} 
                      onChange={handleProfissionalChange} 
                      placeholder="Ex: Clínica Geral, Fisioterapia Respiratória" 
                      required 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Experiência Clínica</label>
                    <input 
                      type="text" 
                      name="anosExperiencia" 
                      value={profissionalData.anosExperiencia} 
                      onChange={handleProfissionalChange} 
                      placeholder="Ex: 8 anos em UTI e Home Care" 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Preço Base (R$) *</label>
                    <input 
                      type="number" 
                      name="preco_base" 
                      value={profissionalData.preco_base} 
                      onChange={handleProfissionalChange} 
                      placeholder="180.00" 
                      required 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Unidade de Cobrança</label>
                    <select 
                      name="unidade_cobranca" 
                      value={profissionalData.unidade_cobranca} 
                      onChange={handleProfissionalChange}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="consulta">por consulta / visita</option>
                      <option value="hora">por hora de atendimento</option>
                      <option value="sessão">por sessão</option>
                      <option value="turno">por plantão / turno (12h)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Chave Pix para Repasses</label>
                    <input 
                      type="text" 
                      name="chavePix" 
                      value={profissionalData.chavePix} 
                      onChange={handleProfissionalChange} 
                      placeholder="CPF, E-mail ou Celular" 
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Mini-Bio / Apresentação Profissional *</label>
                  <textarea 
                    name="bio" 
                    value={profissionalData.bio} 
                    onChange={handleProfissionalChange} 
                    rows="2" 
                    placeholder="Apresente sua formação, procedimentos executados e abordagem no atendimento domiciliar humanizado." 
                    required 
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>
              </div>
            )}

            {/* SEÇÃO 3: SENHA DE ACESSO */}
            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '12px', color: tipoUsuario === 'profissional' ? '#059669' : '#0284c7', textTransform: 'uppercase', marginBottom: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>
                3. Senha de Acesso
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Senha de Acesso *</label>
                  <div className="input-box" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#fff' }}>
                    <input 
                      type={mostrarSenha ? "text" : "password"} 
                      name="senha" 
                      value={formData.senha} 
                      onChange={handleChange} 
                      placeholder="Mínimo 6 caracteres" 
                      required 
                      style={{ border: 'none', width: '100%', padding: '10px 0', fontSize: '14px', outline: 'none' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setMostrarSenha(!mostrarSenha)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {mostrarSenha ? '👁️' : '🙈'}
                    </button>
                  </div>
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Confirmar Senha *</label>
                  <div className="input-box" style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', background: '#fff' }}>
                    <input 
                      type={mostrarSenha ? "text" : "password"} 
                      name="confirmarSenha" 
                      value={formData.confirmarSenha} 
                      onChange={handleChange} 
                      placeholder="Repita a mesma senha" 
                      required 
                      style={{ border: 'none', width: '100%', padding: '10px 0', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TERMOS E CONSENTIMENTO */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  name="termosAceitos" 
                  checked={tipoUsuario === 'paciente' ? pacienteData.termosAceitos : profissionalData.termosAceitos} 
                  onChange={tipoUsuario === 'paciente' ? handlePacienteChange : handleProfissionalChange}
                  style={{ marginTop: '3px' }}
                />
                <span>
                  {tipoUsuario === 'paciente' ? (
                    <>
                      Declaro que li e concordo com os{' '}
                      <Link to="/termos" target="_blank" style={{ color: '#0284c7', fontWeight: '700', textDecoration: 'underline' }}>
                        Termos de Acordo e Privacidade do HomeMed
                      </Link>{' '}
                      e autorizo o tratamento de dados cadastrais conforme as diretrizes da LGPD em Saúde.
                    </>
                  ) : (
                    <>
                      Declaro sob responsabilidade legal e ética que possuo registro ativo e regular junto ao respectivo Conselho de Classe, concordando com os{' '}
                      <Link to="/termos" target="_blank" style={{ color: '#059669', fontWeight: '700', textDecoration: 'underline' }}>
                        Termos de Acordo Profissional HomeMed
                      </Link>.
                    </>
                  )}
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-submit-cadastro" 
              disabled={carregando}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: tipoUsuario === 'profissional' ? 'linear-gradient(135deg, #059669 0%, #047857 100%)' : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                transition: 'all 0.2s ease'
              }}
            >
              {carregando ? (
                <span>Criando conta com segurança...</span>
              ) : (
                <span>
                  {tipoUsuario === 'profissional' ? 'Concluir Cadastro de Especialista' : 'Concluir Cadastro de Paciente'}
                </span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '22px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Já possui uma conta no HomeMed?{' '}
              <Link to={tipoUsuario === 'profissional' ? '/?portal=medico' : '/'} style={{ color: '#0284c7', fontWeight: '700', textDecoration: 'none' }}>
                Fazer login agora
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}