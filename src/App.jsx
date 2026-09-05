import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Mensagens from './pages/Mensagens';
import Perfil from './pages/Perfil';
import Consultas from './pages/Consultas';
import Cadastro from './pages/Cadastro';
import './App.css'; // Mantém o CSS global carregado

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Quando a URL for apenas "/", mostra o Login */}
        <Route path="/" element={<Login />} />
        
        {/* Quando a URL for "/Home", mostra a tela principal */}
        <Route path="/home" element={<Home />} />

        {/* Quando a URL for "/Mensagens", mostra a tela Mensagens */}
        <Route path="/mensagens" element={<Mensagens />} />
        
        {/* Quando a URL for "/Perfil", mostra a tela Perfil */}
        <Route path="/perfil" element={<Perfil />} />

        {/* Quando a URL for "/Consultas", mostra a tela Consultas */}
        <Route path="/consultas" element={<Consultas />} />

        {/* Quando a URL for "/Cadastro", mostra a tela Cadastro */}
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}