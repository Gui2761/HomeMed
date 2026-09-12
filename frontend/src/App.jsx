import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Mensagens from './pages/Mensagens';
import Perfil from './pages/Perfil';
import Consultas from './pages/Consultas';
import Cadastro from './pages/Cadastro';
import DetalhesAgendamento from './pages/DetalhesAgendamento';
import Credenciamento from './pages/Credenciamento';
import AdminAuditoria from './pages/AdminAuditoria';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/consultas" element={<Consultas />} />
          <Route path="/consultas/detalhes" element={<DetalhesAgendamento />} />
          <Route path="/detalhes-agendamento" element={<DetalhesAgendamento />} />
          <Route path="/credenciamento" element={<Credenciamento />} />
          <Route path="/admin" element={<AdminAuditoria />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}