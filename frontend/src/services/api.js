const API_URL = import.meta.env.VITE_API_URL || '/api';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('@HomeMed:token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Autenticação & Usuários
  async cadastrarUsuario(dados) {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  async fazerLogin(dados) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  async redefinirSenha(dados) {
    const response = await fetch(`${API_URL}/redefinir-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    return response.json();
  },

  // Profissionais & Busca (Home)
  async listarProfissionais({ termo, especialidade, localizacao, apenasDisponiveis } = {}) {
    const params = new URLSearchParams();
    if (termo) params.append('termo', termo);
    if (especialidade) params.append('especialidade', especialidade);
    if (localizacao) params.append('localizacao', localizacao);
    if (apenasDisponiveis) params.append('apenasDisponiveis', 'true');

    const response = await fetch(`${API_URL}/profissionais?${params.toString()}`);
    return response.json();
  },

  async obterDestaque() {
    const response = await fetch(`${API_URL}/profissionais/destaque`);
    return response.json();
  },

  async obterProfissional(id) {
    const response = await fetch(`${API_URL}/profissionais/${id}`);
    return response.json();
  },

  // Perfil do Paciente
  async obterPerfilPaciente() {
    const response = await fetch(`${API_URL}/pacientes/me`, {
      headers: getHeaders()
    });
    return response.json();
  },

  async atualizarPerfilPaciente(dados) {
    const response = await fetch(`${API_URL}/pacientes/me`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(dados)
    });
    return response.json();
  },

  async salvarEnderecoPaciente(dados) {
    const response = await fetch(`${API_URL}/pacientes/me/endereco`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dados)
    });
    return response.json();
  },

  // Mensageria / Chat
  async listarConversas() {
    const response = await fetch(`${API_URL}/conversas`, {
      headers: getHeaders()
    });
    return response.json();
  },

  async obterMensagens(conversaId) {
    const response = await fetch(`${API_URL}/conversas/${conversaId}/mensagens`, {
      headers: getHeaders()
    });
    return response.json();
  },

  async enviarMensagem(conversaId, dados) {
    const response = await fetch(`${API_URL}/conversas/${conversaId}/mensagens`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dados)
    });
    return response.json();
  },

  async iniciarOuBuscarConversa(profissionalId) {
    const response = await fetch(`${API_URL}/conversas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ profissional_id: profissionalId })
    });
    return response.json();
  },

  // Agendamentos / Consultas
  async listarAgendamentos(status = 'todas') {
    const response = await fetch(`${API_URL}/agendamentos?status=${status}`, {
      headers: getHeaders()
    });
    return response.json();
  },

  async criarAgendamento(dados) {
    const response = await fetch(`${API_URL}/agendamentos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dados)
    });
    return response.json();
  },

  async atualizarStatusAgendamento(id, status) {
    const response = await fetch(`${API_URL}/agendamentos/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return response.json();
  },

  // Avaliações
  async registrarAvaliacao(dados) {
    const response = await fetch(`${API_URL}/avaliacoes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(dados)
    });
    return response.json();
  }
};