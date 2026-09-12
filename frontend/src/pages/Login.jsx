import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './Login.css';

export default function Login() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', senha: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (erro) setErro('');
  };

  const handlePreencherDemo = () => {
    setFormData({
      email: 'ricardo.santos@email.com',
      senha: 'password123'
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    
    try {
      const resposta = await api.fazerLogin(formData);
      
      if (resposta.token) {
        localStorage.setItem('@HomeMed:token', resposta.token);
        localStorage.setItem('@HomeMed:usuario', JSON.stringify(resposta.usuario));
        navigate('/home');
      } else {
        setErro(resposta.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Erro ao conectar com o servidor. Verifique se a API está online.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Icon & Header */}
        <div className="login-header">
          <div className="brand-badge-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          </div>
          <div className="brand-name">HomeMed</div>
          <h2>Bem-vindo de volta</h2>
          <p>Acesse seu portal de saúde domiciliar integrada</p>
        </div>

        {erro && (
          <div className="login-alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <span>{erro}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-field-group">
            <label>E-mail cadastrado</label>
            <div className="input-box">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
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

          <div className="input-field-group">
            <div className="label-row">
              <label>Sua Senha</label>
              <a href="#" className="link-forgot" onClick={(e) => { e.preventDefault(); alert('Em ambiente de teste, utilize as credenciais padrão do paciente Ricardo Santos.'); }}>
                Esqueceu a senha?
              </a>
            </div>
            <div className="input-box">
              <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input 
                type={mostrarSenha ? "text" : "password"} 
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••" 
                required
              />
              <button 
                type="button" 
                className="btn-toggle-eye"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label="Mostrar/ocultar senha"
              >
                {mostrarSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login-submit" disabled={carregando}>
            {carregando ? (
              <span className="btn-spinner"></span>
            ) : (
              <>
                <span>Acessar Conta</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Access Button */}
        <div className="demo-credentials-pill" onClick={handlePreencherDemo}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          <span>Preencher Dados de Demonstração (Ricardo Santos)</span>
        </div>

        <div className="login-divider">
          <span>OU</span>
        </div>

        <div className="login-footer">
          <p>
            Não tem uma conta no HomeMed? <Link to="/cadastro">Cadastre-se grátis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}