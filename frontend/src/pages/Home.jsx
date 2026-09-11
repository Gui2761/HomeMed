import './Home.css';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          <strong>HomeMed</strong>
        </div>
        <div className="nav-links">
            <Link to="/home" className="active">Início</Link>
            <Link to="/consultas">Consultas</Link>
            <Link to="/mensagens">Mensagens</Link>
            <Link to="/perfil">Perfil</Link>
        </div>
        <div className="nav-actions">
          <button className="icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></button>
          <Link to="/perfil" className="avatar-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero">
        <h1>O cuidado que você precisa,<br/>quando e onde quiser.</h1>
        <p>Conecte-se com os melhores profissionais de saúde para atendimento domiciliar especializado e humanizado.</p>
        
        <div className="search-bar">
          <div className="search-input">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" placeholder="O que você precisa hoje?" />
          </div>
          <div className="divider-vertical"></div>
          <div className="search-input">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <input type="text" placeholder="Sua localização" />
          </div>
          <button className="btn-search">Buscar</button>
        </div>

        <div className="categories">
          <span className="badge active">Fisioterapia</span>
          <span className="badge">Enfermagem</span>
          <span className="badge">Cuidador</span>
          <span className="badge">Clínico Geral</span>
          <span className="badge">Nutrição</span>
        </div>
      </header>

      {/* DESTAQUE */}
      <section className="featured">
        <div className="featured-card">
          <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=500" alt="Dra. Juliana Silva" className="featured-img" />
          <div className="featured-content">
            <span className="tag">PROFISSIONAL EM DESTAQUE</span>
            <h2>Dra. Juliana Silva</h2>
            <h3>Fisioterapia Neurológica e Motora</h3>
            <p>Especialista em reabilitação motora com mais de 10 anos de experiência em atendimento domiciliar. Foco no conforto e na evolução constante do paciente, utilizando técnicas modernas e equipamentos próprios.</p>
            <div className="featured-footer">
              <div>
                <span className="price-label">VALOR DA SESSÃO</span>
                <span className="price">R$ 180,00</span>
              </div>
              <div className="featured-actions">
                <button className="btn-secondary">Mensagem</button>
                <button className="btn-outline-light">Ver Perfil</button>
              </div>
            </div>
          </div>
          <div className="rating-float">⭐ 4.9</div>
        </div>
      </section>

      {/* LISTA PRÓXIMOS */}
      <section className="nearby">
        <div className="section-header">
          <div>
            <h2>Próximos de você</h2>
            <p>Profissionais disponíveis na sua região central</p>
          </div>
          <a href="#" className="link-all">Ver todos →</a>
        </div>

        <div className="cards-grid">
          {/* Card 1 */}
          <div className="pro-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300&h=200" alt="Carlos Mendes" />
              <span className="card-rating">⭐ 4.8</span>
            </div>
            <div className="card-body">
              <h4>Carlos Mendes</h4>
              <h5>Enfermeiro Padrão</h5>
              <p>Cuidados pós-operatórios, administração de medicamentos e acompanhamento contínuo d...</p>
              <div className="card-footer">
                <div>
                  <span className="price-small-label">A PARTIR DE</span>
                  <span className="price-small">R$ 150 <small>/turno</small></span>
                </div>
                <button className="btn-outline">Ver Perfil</button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="pro-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=300&h=200" alt="Marta Oliveira" />
              <span className="card-badge">DISPONÍVEL HOJE</span>
              <span className="card-rating">⭐ 5.0</span>
            </div>
            <div className="card-body">
              <h4>Marta Oliveira</h4>
              <h5>Cuidadora de Idosos</h5>
              <p>Acompanhamento hospitalar e domiciliar, auxílio na mobilidade e preparo de refeições restritas.</p>
              <div className="card-footer">
                <div>
                  <span className="price-small-label">A PARTIR DE</span>
                  <span className="price-small">R$ 90 <small>/hora</small></span>
                </div>
                <button className="btn-outline">Ver Perfil</button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="pro-card">
            <div className="card-img-wrapper">
              <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300&h=200" alt="Dr. Ricardo Almeida" />
              <span className="card-rating">⭐ 4.7</span>
            </div>
            <div className="card-body">
              <h4>Dr. Ricardo Almeida</h4>
              <h5>Médico Clínico Geral</h5>
              <p>Consultas domiciliares para avaliação geral, prescrição de receitas e check-up preventivo.</p>
              <div className="card-footer">
                <div>
                  <span className="price-small-label">CONSULTA</span>
                  <span className="price-small">R$ 250</span>
                </div>
                <button className="btn-outline">Ver Perfil</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-main">
        <div className="logo-small">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8v4H3v14h18V7h-5V3z"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>
          HomeMed
        </div>
        <div className="footer-links">
          <span>© 2024 HomeMed Saúde Digital</span>
          <a href="#">Termos de Uso</a>
          <a href="#">Privacidade</a>
        </div>
      </footer>
    </div>
  );
}