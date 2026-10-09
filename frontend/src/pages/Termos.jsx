import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Termos.css';

export default function Termos() {
  const navigate = useNavigate();

  return (
    <div className="termos-page">
      <Navbar />

      <main className="termos-container">
        <div className="termos-card">
          {/* Top Badge */}
          <div className="termos-header">
            <span className="termos-badge">INSTRUMENTO JURÍDICO REGULATÓRIO</span>
            <h1>Termos de Uso, Acordo de Serviços e Privacidade</h1>
            <p className="termos-meta">
              Última atualização: Outubro de 2026 • Em conformidade com a LGPD (Lei nº 13.709/2018) e Diretrizes CFM/COFEN/CREFITO
            </p>
            <div className="termos-actions-top">
              <button 
                type="button" 
                onClick={() => window.print()} 
                className="btn-print-termos"
              >
                🖨️ Imprimir / Salvar PDF
              </button>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn-back-termos"
              >
                ← Voltar
              </button>
            </div>
          </div>

          <hr className="termos-divider" />

          {/* Conteúdo Jurídico Estruturado */}
          <article className="termos-body">
            
            <section className="termos-section">
              <h2>1. Identificação das Partes e Objeto da Plataforma</h2>
              <p>
                O presente <strong>Acordo de Adesão e Termos de Uso</strong> disciplina o relacionamento entre o <strong>HomeMed Tecnologia e Saúde Digital Ltda.</strong> ("HomeMed"), operadora da plataforma de intermediação e logística em saúde domiciliar, e você, qualificado como <strong>Usuário Paciente</strong>, <strong>Familiar/Responsável</strong> ou <strong>Profissional de Saúde Credenciado</strong>.
              </p>
              <p>
                A plataforma HomeMed tem como finalidade exclusiva disponibilizar um ambiente tecnológico seguro, criptografado e auditável para viabilizar o agendamento, comunicação e gestão de visitas domiciliares entre pacientes e especialistas autônomos devidamente habilitados.
              </p>
            </section>

            <section className="termos-section">
              <h2>2. Cadastro, Elegibilidade e Responsabilidade Cadastral</h2>
              <p>
                2.1. O acesso às funcionalidades da plataforma requer a criação de conta com autenticação individual intransferível. O Usuário compromete-se a fornecer informações fidedignas, atualizadas e completas.
              </p>
              <p>
                2.2. É estritamente vedada a criação de contas em nome de terceiros sem a devida procuração ou tutela legal expressa comprovada.
              </p>
              <p>
                2.3. A guarda do login e senha é de responsabilidade estrita do Usuário, devendo comunicar imediatamente a administração do HomeMed caso identifique qualquer indício de acesso não autorizado.
              </p>
            </section>

            <section className="termos-section">
              <h2>3. Conformidade Regulatória de Profissionais de Saúde (RNF02)</h2>
              <p>
                3.1. Todo e qualquer profissional cadastrado (Médicos, Enfermeiros, Fisioterapeutas, Nutricionistas, Psicólogos, Terapeutas Ocupacionais e Cuidadores) declara sob as penas da legislação penal e civil brasileira que:
              </p>
              <ul>
                <li>Possui diploma reconhecido pelo Ministério da Educação (MEC);</li>
                <li>Mantém registro ativo, regular e sem impedimento disciplinar junto ao respectivo Conselho Regional de Classe (CRM, COREN, CREFITO, CRN, CRP, CRF ou certificado CBO);</li>
                <li>Atua dentro dos limites éticos, resoluções e diretrizes de sua respectiva autarquia profissional.</li>
              </ul>
              <p>
                3.2. O HomeMed reserva-se o direito soberano de suspender, auditar preventivamente e desativar qualquer perfil que apresente inconsistências documentais, certidões negativas vencidas ou denúncias fundamentadas de má prática.
              </p>
            </section>

            <section className="termos-section highlight-box">
              <h2>4. Privacidade, Tratamento e Sigilo de Prontuário Médico (LGPD em Saúde)</h2>
              <p>
                4.1. Em observância estrita à <strong>Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</strong> e ao Código de Ética Médica:
              </p>
              <ul>
                <li><strong>Dados Sensíveis de Saúde:</strong> Sintomas, prescrições, anotações de evolução domiciliar e prontuários são tratados exclusivamente para a finalidade de assistência clínica e segurança do paciente.</li>
                <li><strong>Criptografia:</strong> Todos os dados em trânsito e em repouso são protegidos por algoritmos de criptografia de padrão hospitalar (TLS 1.3 e AES-256).</li>
                <li><strong>Segregação de Acessos (RBAC):</strong> Nenhum paciente tem acesso a prontuários ou informações de outros usuários. Médicos e especialistas acessam apenas os dados clínicos dos pacientes aos quais estão prestando atendimento domiciliar consentido.</li>
                <li><strong>Direito do Titular:</strong> O titular pode solicitar acesso, retificação, portabilidade ou revogação do consentimento cadastral a qualquer momento através de nossos canais de governança.</li>
              </ul>
            </section>

            <section className="termos-section">
              <h2>5. Atendimento no Domicílio e Condições de Segurança</h2>
              <p>
                5.1. O paciente e seus familiares comprometem-se a fornecer ambiente residencial adequado, salubre e seguro para que o especialista desempenhe o ato assistencial.
              </p>
              <p>
                5.2. O profissional de saúde tem plena autonomia técnica para orientar remoção emergencial a serviço de pronto-atendimento hospitalar (SAMU 192 ou emergência privada) caso identifique agravo agudo com risco de vida que transcenda a capacidade de suporte domiciliar.
              </p>
            </section>

            <section className="termos-section">
              <h2>6. Política Financeira, Cobrança e Repasse de Honorários</h2>
              <p>
                6.1. O valor de cada consulta ou sessão domiciliar é estabelecido pelo próprio especialista em seu perfil e aceito expressamente pelo paciente no momento da confirmação do agendamento.
              </p>
              <p>
                6.2. A liquidação financeira e o repasse ao profissional ocorrem de forma digital e automatizada após a validação do atendimento, com garantia de liquidação para ambas as partes.
              </p>
            </section>

            <section className="termos-section">
              <h2>7. Cancelamentos e Reagendamentos</h2>
              <p>
                7.1. Cancelamentos com antecedência mínima de 4 (quatro) horas antes do horário programado não incorrem em penalidades. Cancelamentos intempestivos ou ausência no domicílio após a chegada do profissional estão sujeitos a taxa de deslocamento.
              </p>
            </section>

            <section className="termos-section">
              <h2>8. Foro e Resolução de Conflitos</h2>
              <p>
                O presente contrato é regido pelas leis da República Federativa do Brasil. As partes elegem o foro da Comarca de São Paulo/SP para dirimir eventuais litígios oriundos deste termo, renunciando a qualquer outro por mais privilegiado que seja.
              </p>
            </section>

          </article>

          {/* Footer do Acordo */}
          <div className="termos-footer-box">
            <p>
              Ao utilizar a plataforma ou clicar em <strong>"Concluir Cadastro"</strong>, você declara ter lido, compreendido e anuído integralmente a todos os termos deste instrumento.
            </p>
            <div className="termos-footer-actions">
              <Link to="/cadastro" className="btn-agree-action">
                Prosseguir com o Cadastro
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
