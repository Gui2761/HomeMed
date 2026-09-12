import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Cadastro.css';

export default function Cadastro() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (erro) setErro('');
  };

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem! Digite a mesma senha em ambos os campos.');
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setCarregando(true);
    setErro('');

    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        tipo_usuario: 'paciente'
      };

      const resposta = await api.cadastrarUsuario(payload);
      
      if (resposta.error) {
        setErro(resposta.error);
      } else {
        alert('🎉 Cadastro realizado com sucesso! Faça seu login para continuar.');
        navigate('/');
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
        <div className="cadastro-brand">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          <strong>HomeMed</strong>
        </div>
        <div className="security-badge-top">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          <span>Privacidade LGPD Garantida</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="cadastro-main">
        <div className="cadastro-card">
          <div className="card-header-center">
            <div className="cadastro-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            </div>
            <span className="cadastro-tag">CONTA PACIENTE / FAMILIAR</span>
            <h2>Crie sua conta no HomeMed</h2>
            <p>Agende visitas domiciliares com os melhores enfermeiros, médicos e fisioterapeutas com facilidade.</p>
          </div>

          {erro && (
            <div className="cadastro-alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleCadastro} className="cadastro-form">
            <div className="input-group">
              <label>Nome Completo</label>
              <div className="input-box">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input 
                  type="text" 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleChange} 
                  placeholder="Seu nome completo" 
                  required 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>E-mail</label>
                <div className="input-box">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="exemplo@email.com" 
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Telefone / WhatsApp</label>
                <div className="input-box">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <input 
                    type="tel" 
                    name="telefone" 
                    value={formData.telefone} 
                    onChange={handleChange} 
                    placeholder="(11) 98765-4321" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>Senha de Acesso</label>
                <div className="input-box">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    name="senha" 
                    value={formData.senha} 
                    onChange={handleChange} 
                    placeholder="Mínimo 6 dígitos" 
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Confirmar Senha</label>
                <div className="input-box">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 12 2 2 4-4"/><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    name="confirmarSenha" 
                    value={formData.confirmarSenha} 
                    onChange={handleChange} 
                    placeholder="Repita a senha" 
                    required 
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-cadastro-submit" disabled={carregando}>
              {carregando ? 'Criando Conta...' : 'Concluir Cadastro e Entrar'}
            </button>
          </form>

          <div className="cadastro-footer">
            <p>Já possui cadastro? <Link to="/">Fazer login</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
}