import type { Achievement } from '../lib/gamification';

export default function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const { icon, title, description, current, target, unlocked } = achievement;
  const shown = Math.min(current, target);
  return (
    <article className={`panel badge ${unlocked ? 'badge-unlocked' : ''}`}>
      <span className="badge-icon" aria-hidden="true">{icon}</span>
      <div className="badge-body">
        <h3>{title}</h3>
        <p className="muted">{description}</p>
        {unlocked ? (
          <p className="badge-state">✓ Desbloqueada</p>
        ) : (
          <>
            <div
              className="meter"
              role="progressbar"
              aria-label={`Progresso de ${title}`}
              aria-valuemin={0}
              aria-valuemax={target}
              aria-valuenow={shown}
            >
              <span style={{ width: `${(shown / target) * 100}%` }} />
            </div>
            <p className="muted badge-count">
              {shown.toLocaleString('pt-BR')} de {target.toLocaleString('pt-BR')}
            </p>
          </>
        )}
      </div>
    </article>
  );
}
