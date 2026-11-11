import { useState } from 'react';
import { Link } from 'react-router-dom';
import RoutineCard from '../components/RoutineCard';
import WorkoutCard from '../components/WorkoutCard';
import { useGamification } from '../hooks/useGamification';
import { useTraining } from '../hooks/useTraining';

export default function WorkoutsPage() {
  const { workouts, routines, deleteWorkout, deleteRoutine } = useTraining();
  const progress = useGamification();
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const term = search.trim().toLocaleLowerCase('pt-BR');
  const filtered = workouts.filter(
    (workout) =>
      workout.name.toLocaleLowerCase('pt-BR').includes(term) ||
      workout.exercises.some((exercise) => exercise.name.toLocaleLowerCase('pt-BR').includes(term)),
  );

  async function confirmAndDelete(message: string, action: () => Promise<void>) {
    if (!window.confirm(message)) return;
    setError(null);
    try {
      await action();
    } catch {
      setError('Não foi possível excluir. Tente novamente.');
    }
  }

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="eyebrow">Treinos</p>
          <h1>Rotinas e histórico</h1>
        </div>
        <Link className="button" to="/treinos/novo">
          Registrar treino
        </Link>
      </header>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <section className="stack">
        <h2>Minhas rotinas</h2>
        {routines.length === 0 ? (
          <p className="panel empty">Marque “Salvar como rotina” ao registrar um treino para repeti-lo depois.</p>
        ) : (
          <div className="card-grid">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={() => void confirmAndDelete(`Excluir a rotina “${routine.name}”?`, () => deleteRoutine(routine.id))}
              />
            ))}
          </div>
        )}
      </section>

      <section className="stack">
        <div className="section-head">
          <h2>Histórico</h2>
          <label className="field search-field">
            <span className="sr-only">Buscar treino ou exercício</span>
            <input
              type="search"
              placeholder="Buscar treino ou exercício"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        {filtered.length === 0 ? (
          <p className="panel empty">
            {workouts.length === 0 ? 'Nenhum treino registrado ainda.' : 'Nenhum treino encontrado para essa busca.'}
          </p>
        ) : (
          <div className="card-grid">
            {filtered.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                xp={progress.xpByWorkout[workout.id]}
                records={progress.recordsByWorkout[workout.id]}
                onDelete={() =>
                  void confirmAndDelete(
                    `Excluir “${workout.name}”? O XP desse treino será removido.`,
                    () => deleteWorkout(workout.id),
                  )
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
