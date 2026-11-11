import { Link, useLocation, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import WorkoutCard from '../components/WorkoutCard';
import XPBar from '../components/XPBar';
import { useAuth } from '../hooks/useAuth';
import { useGamification } from '../hooks/useGamification';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useTraining } from '../hooks/useTraining';
import { ACTIVE_WEEK_MIN_WORKOUTS } from '../lib/gamification';

export interface WorkoutReward {
  xp: number;
  newLevel: number | null;
  unlocked: string[];
}

const MIN_GOAL = 1;
const MAX_GOAL = 7;

export default function DashboardPage() {
  const { user } = useAuth();
  const { workouts } = useTraining();
  const progress = useGamification();
  const location = useLocation();
  const navigate = useNavigate();
  const [weeklyGoal, setWeeklyGoal] = useLocalStorage(`fitquest:meta:${user?.uid}`, 3);

  const reward = (location.state as { reward?: WorkoutReward } | null)?.reward;
  const goalPercent = Math.min((progress.workoutsThisWeek / weeklyGoal) * 100, 100);
  const nextAchievement = progress.achievements
    .filter((achievement) => !achievement.unlocked)
    .sort((a, b) => b.current / b.target - a.current / a.target)[0];

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="eyebrow">Painel</p>
          <h1>Olá, {user?.name}</h1>
        </div>
        <Link className="button" to="/treinos/novo">
          Registrar treino
        </Link>
      </header>

      {reward && (
        <div className="alert alert-success" role="status">
          <div>
            <strong>Treino concluído! +{reward.xp} XP</strong>
            {reward.newLevel && <p>Você subiu para o nível {reward.newLevel}!</p>}
            {reward.unlocked.length > 0 && <p>Conquista desbloqueada: {reward.unlocked.join(', ')}</p>}
          </div>
          <button
            type="button"
            className="button-icon"
            aria-label="Fechar aviso"
            onClick={() => navigate('.', { replace: true, state: null })}
          >
            ×
          </button>
        </div>
      )}

      <XPBar
        level={progress.level}
        title={progress.levelTitle}
        xpIntoLevel={progress.xpIntoLevel}
        xpToNextLevel={progress.xpToNextLevel}
        totalXp={progress.totalXp}
      />

      <div className="stat-grid">
        <StatCard label="Treinos" value={progress.totalWorkouts} />
        <StatCard
          label="Sequência"
          value={`${progress.currentStreak} sem.`}
          hint={`Semana ativa: ${ACTIVE_WEEK_MIN_WORKOUTS}+ treinos`}
        />
        <StatCard label="Recordes" value={progress.totalRecords} />
        <StatCard label="Volume total" value={`${(progress.totalVolume / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} t`} />
      </div>

      <div className="two-columns">
        <section className="panel form-stack">
          <h2>Missão da semana</h2>
          <p>
            <strong>{progress.workoutsThisWeek}</strong> de {weeklyGoal} treinos concluídos
          </p>
          <div
            className="meter"
            role="progressbar"
            aria-label="Progresso da missão da semana"
            aria-valuemin={0}
            aria-valuemax={weeklyGoal}
            aria-valuenow={Math.min(progress.workoutsThisWeek, weeklyGoal)}
          >
            <span style={{ width: `${goalPercent}%` }} />
          </div>
          <div className="stepper">
            <span className="muted">Meta semanal</span>
            <button type="button" className="button-icon" aria-label="Diminuir meta" disabled={weeklyGoal <= MIN_GOAL} onClick={() => setWeeklyGoal(weeklyGoal - 1)}>
              −
            </button>
            <strong>{weeklyGoal}</strong>
            <button type="button" className="button-icon" aria-label="Aumentar meta" disabled={weeklyGoal >= MAX_GOAL} onClick={() => setWeeklyGoal(weeklyGoal + 1)}>
              +
            </button>
          </div>
        </section>

        <section className="panel form-stack">
          <h2>Próxima conquista</h2>
          {nextAchievement ? (
            <>
              <p className="next-achievement">
                <span aria-hidden="true">{nextAchievement.icon}</span> {nextAchievement.title}
              </p>
              <p className="muted">{nextAchievement.description}</p>
            </>
          ) : (
            <p>Você desbloqueou todas as conquistas!</p>
          )}
          <Link className="text-link" to="/conquistas">
            Ver todas as conquistas
          </Link>
        </section>
      </div>

      <section className="stack">
        <div className="section-head">
          <h2>Últimos treinos</h2>
          <Link className="text-link" to="/treinos">Ver histórico</Link>
        </div>
        {workouts.length === 0 ? (
          <p className="panel empty">Você ainda não registrou treinos. O primeiro já desbloqueia uma conquista!</p>
        ) : (
          <div className="card-grid">
            {workouts.slice(0, 2).map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                xp={progress.xpByWorkout[workout.id]}
                records={progress.recordsByWorkout[workout.id]}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
