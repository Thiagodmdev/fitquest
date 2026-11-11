import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FEATURES = [
  { number: '01', title: 'Organize', text: 'Monte rotinas, repita com um clique e registre séries, repetições e carga.' },
  { number: '02', title: 'Acompanhe', text: 'Veja a carga de cada exercício e o volume semanal crescerem em gráficos.' },
  { number: '03', title: 'Evolua', text: 'Ganhe XP, suba de nível, mantenha sua sequência e desbloqueie conquistas.' },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <p className="eyebrow">Gestão de treino com gamificação</p>
        <h1>
          Cada treino
          <br />
          <em>sobe seu nível.</em>
        </h1>
        <p className="hero-text">
          O FitQuest transforma sua rotina na academia em progresso visível: registre o treino, bata seus
          recordes e veja sua evolução semana após semana.
        </p>
        <Link className="button" to={user ? '/painel' : '/login'}>
          {user ? 'Ir para o painel' : 'Começar agora'}
        </Link>
      </section>
      <section className="feature-grid">
        {FEATURES.map((feature) => (
          <article key={feature.number} className="feature">
            <span className="feature-number">{feature.number}</span>
            <h2>{feature.title}</h2>
            <p className="muted">{feature.text}</p>
          </article>
        ))}
      </section>
    </>
  );
}
