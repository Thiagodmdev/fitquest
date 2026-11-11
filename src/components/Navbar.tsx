import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../hooks/useGamification';
import { api } from '../services/api';

const LINKS = [
  { to: '/painel', label: 'Painel' },
  { to: '/treinos', label: 'Treinos' },
  { to: '/evolucao', label: 'Evolução' },
  { to: '/conquistas', label: 'Conquistas' },
];

export default function Navbar() {
  const { user } = useAuth();
  const { level } = useGamification();
  const navigate = useNavigate();

  async function handleLogout() {
    await api.logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to={user ? '/painel' : '/'} className="brand">
        <span aria-hidden="true">⚡</span> FitQuest
      </Link>
      {user ? (
        <>
          <nav className="navbar-links" aria-label="Principal">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="navbar-user">
            <span className="level-chip">Nível {level}</span>
            <button type="button" className="button-link" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </>
      ) : (
        <Link to="/login" className="button button-small">
          Entrar
        </Link>
      )}
    </header>
  );
}
