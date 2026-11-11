import { formatDate } from '../lib/dates';
import { workoutVolume } from '../lib/gamification';
import type { Workout } from '../types';

interface WorkoutCardProps {
  workout: Workout;
  xp: number;
  records: number;
  onDelete?(): void;
}

export default function WorkoutCard({ workout, xp, records, onDelete }: WorkoutCardProps) {
  return (
    <article className="panel workout-card">
      <header className="workout-card-head">
        <div>
          <h3>{workout.name}</h3>
          <p className="muted">
            {formatDate(workout.date)} · {workout.durationMin} min ·{' '}
            {workoutVolume(workout).toLocaleString('pt-BR')} kg
          </p>
        </div>
        <span className="xp-tag">+{xp} XP</span>
      </header>
      <ul className="exercise-list">
        {workout.exercises.map((exercise, index) => (
          <li key={`${exercise.name}-${index}`}>
            <span>{exercise.name}</span>
            <span className="muted">
              {exercise.sets}×{exercise.reps} · {exercise.weightKg.toLocaleString('pt-BR')} kg
            </span>
          </li>
        ))}
      </ul>
      {(records > 0 || onDelete) && (
        <footer className="workout-card-foot">
          <span>{records > 0 && `📈 ${records} ${records === 1 ? 'recorde' : 'recordes'} de carga`}</span>
          {onDelete && (
            <button type="button" className="button-link" onClick={onDelete}>
              Excluir
            </button>
          )}
        </footer>
      )}
    </article>
  );
}
