import AchievementBadge from '../components/AchievementBadge';
import { useGamification } from '../hooks/useGamification';
import {
  ACTIVE_WEEK_MIN_WORKOUTS,
  XP_BASE,
  XP_MAX_DURATION,
  XP_PER_ACTIVE_WEEK,
  XP_PER_EXERCISE,
  XP_PER_RECORD,
} from '../lib/gamification';

const XP_RULES = [
  { label: 'Treino concluído', value: `+${XP_BASE} XP` },
  { label: 'Cada exercício do treino', value: `+${XP_PER_EXERCISE} XP` },
  { label: `Cada minuto treinado (até ${XP_MAX_DURATION})`, value: '+1 XP' },
  { label: 'Recorde de carga em um exercício', value: `+${XP_PER_RECORD} XP` },
  { label: `Semana ativa (${ACTIVE_WEEK_MIN_WORKOUTS}+ treinos)`, value: `+${XP_PER_ACTIVE_WEEK} XP` },
];

export default function AchievementsPage() {
  const { achievements } = useGamification();
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;
  const ordered = [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

  return (
    <div className="stack">
      <header>
        <p className="eyebrow">Conquistas</p>
        <h1>
          {unlockedCount} de {achievements.length} desbloqueadas
        </h1>
      </header>

      <div className="badge-grid">
        {ordered.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>

      <section className="panel form-stack">
        <h2>Como ganhar XP</h2>
        <ul className="exercise-list">
          {XP_RULES.map((rule) => (
            <li key={rule.label}>
              <span>{rule.label}</span>
              <strong>{rule.value}</strong>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
