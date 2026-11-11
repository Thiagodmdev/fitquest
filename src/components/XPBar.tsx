interface XPBarProps {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpToNextLevel: number;
  totalXp: number;
}

export default function XPBar({ level, title, xpIntoLevel, xpToNextLevel, totalXp }: XPBarProps) {
  const percent = Math.min((xpIntoLevel / xpToNextLevel) * 100, 100);
  return (
    <section className="panel xp-card" aria-label="Progresso de nível">
      <div className="xp-level">
        <span className="xp-level-number">{level}</span>
        <span className="stat-label">Nível</span>
      </div>
      <div className="xp-body">
        <div className="xp-heading">
          <h2>{title}</h2>
          <span className="muted">{totalXp.toLocaleString('pt-BR')} XP no total</span>
        </div>
        <div
          className="meter meter-large"
          role="progressbar"
          aria-label={`Progresso até o nível ${level + 1}`}
          aria-valuemin={0}
          aria-valuemax={xpToNextLevel}
          aria-valuenow={xpIntoLevel}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="muted">
          Faltam {(xpToNextLevel - xpIntoLevel).toLocaleString('pt-BR')} XP para o nível {level + 1}
        </p>
      </div>
    </section>
  );
}
