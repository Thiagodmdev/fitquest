import { Link } from 'react-router-dom';
import type { Routine } from '../types';

interface RoutineCardProps {
  routine: Routine;
  onDelete(): void;
}

export default function RoutineCard({ routine, onDelete }: RoutineCardProps) {
  return (
    <article className="panel routine-card">
      <div>
        <h3>{routine.name}</h3>
        <p className="muted">{routine.exercises.map((exercise) => exercise.name).join(' · ')}</p>
      </div>
      <div className="routine-card-actions">
        <Link className="button button-small" to={`/treinos/novo?rotina=${routine.id}`}>
          Iniciar
        </Link>
        <button type="button" className="button-link" onClick={onDelete}>
          Excluir
        </button>
      </div>
    </article>
  );
}
