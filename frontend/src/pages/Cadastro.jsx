import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // Importando a conexão com o backend
import './Cadastro.css';

export default function Cadastro() {
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '', // O CPF usaremos na próxima etapa para a tabela de 'pacientes'
    senha: '',
    confirmarSenha: ''
  });

  // Atualiza o estado conforme o usuário digita
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função disparada ao clicar no botão de submit
  const handleCadastro = async (e) => {
    e.preventDefault();
    
    // 1. Validação básica de senha
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    try {
      // 2. Montando o objeto exatamente como o backend espera
      const payload = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        telefone: formData.telefone,
        tipo_usuario: 'paciente' // Definido como paciente por padrão nesta tela
      };

      // 3. Chamando a API
      const resposta = await api.cadastrarUsuario(payload);
      
      if (resposta.error) {
        alert(`Erro: ${resposta.error}`);
      } else {
        alert('Cadastro realizado com sucesso! Faça seu login.');
        navigate('/'); // Redireciona para a tela inicial (Login)
      }
    } catch (error) {
      console.error('Falha na comunicação:', error);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="cadastro-page">
      {/* Topo Global */}
      <header className="cadastro-header">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          <strong>HomeMed</strong>
        </div>
        <div className="security-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          <span>HIPAA Compliant Security</span>
        </div>
      </header>

      {/* Container Central do Card */}
      <main className="cadastro-main">
        <div className="cadastro-card">
          <div className="card-header-center">
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
            </div>
            <span className="subtitle">ACESSO DO PACIENTE</span>
            <h2>Crie sua conta</h2>
            <p>Preencha seus dados para agendar atendimentos de saúde domiciliar com especialistas verificados.</p>
          </div>

          <form onSubmit={handleCadastro}>
            <div className="input-group">
              <label>Nome Completo</label>
              <div className="input-box">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input 
                  type="text" 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleChange} 
                  placeholder="Ex: Maria Silva Santos" 
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label>E-mail</label>
              <div className="input-box">
                <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  placeholder="seu@email.com" 
                  required 
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>WhatsApp / Telefone</label>
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
              <div className="input-group">
                <label>CPF</label>
                <div className="input-box">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 15h6"/><path d="M9 19h6"/></svg>
                  <input 
                    type="text" 
                    name="cpf" 
                    value={formData.cpf} 
                    onChange={handleChange} 
                    placeholder="000.000.000-00" 
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>Senha</label>
                <div className="input-box">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    name="senha"
                    value={formData.senha} 
                    onChange={handleChange} 
                    placeholder="Mínimo 8 caracteres" 
                    required 
                  />
                  <button type="button" className="btn-eye" onClick={() => setMostrarSenha(!mostrarSenha)}>
                    {mostrarSenha ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="input-group">
                <label>Confirmar Senha</label>
                <div className="input-box">
                  <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
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

            <div className="password-strength">
              <div className="strength-labels">
                <span>Força da senha:</span>
                <span className="waiting">Aguardando senha</span>
              </div>
              <div className="strength-bars">
                <div className="bar empty"></div>
                <div className="bar empty"></div>
                <div className="bar empty"></div>
              </div>
            </div>

            <label className="checkbox-container">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              <p>Concordo com os <a href="#">Termos de Uso</a> e a <a href="#">Política de Privacidade</a> da HomeMed.</p>
            </label>

            <button type="submit" className="btn-primary">
              Criar Minha Conta
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </form>

          <div className="divider">
            <span>OU CADASTRE COM</span>
          </div>

          <button type="button" className="btn-google">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            Continuar com o Google
          </button>

          <p className="footer-text">
            Já possui cadastro na HomeMed? <Link to="/">Acessar minha conta</Link>
          </p>
        </div>
        
        <div className="cadastro-card-footer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          Seus dados estão protegidos por criptografia de ponta a ponta
        </div>
      </main>

      {/* Rodapé Global */}
      <footer className="cadastro-page-footer">
        <p>© 2024 HomeMed Clinical Health, Inc. All patient data is encrypted and confidential.</p>
        <div className="footer-links-cadastro">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}