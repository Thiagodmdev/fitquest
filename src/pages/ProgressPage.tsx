import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProgressChart from '../components/ProgressChart';
import StatCard from '../components/StatCard';
import { useTraining } from '../hooks/useTraining';
import { exerciseWeightSeries, listExerciseNames, weeklyVolumeSeries } from '../lib/gamification';

export default function ProgressPage() {
  const { workouts } = useTraining();
  const names = useMemo(() => listExerciseNames(workouts), [workouts]);
  const [selected, setSelected] = useState('');
  const exercise = names.includes(selected) ? selected : names[0];

  const weightSeries = useMemo(
    () => (exercise ? exerciseWeightSeries(workouts, exercise) : []),
    [workouts, exercise],
  );
  const volumeSeries = useMemo(() => weeklyVolumeSeries(workouts), [workouts]);

  if (!exercise) {
    return (
      <div className="stack">
        <header>
          <p className="eyebrow">Evolução</p>
          <h1>Sua evolução</h1>
        </header>
        <p className="panel empty">
          Registre um treino para começar a ver seus gráficos.{' '}
          <Link className="text-link" to="/treinos/novo">Registrar treino</Link>
        </p>
      </div>
    );
  }

  const weights = weightSeries.map((point) => point.value);
  const gain = weights[weights.length - 1] - weights[0];

  return (
    <div className="stack">
      <header className="page-head">
        <div>
          <p className="eyebrow">Evolução</p>
          <h1>Sua evolução</h1>
        </div>
        <label className="field exercise-select">
          <span>Exercício</span>
          <select value={exercise} onChange={(event) => setSelected(event.target.value)}>
            {names.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
      </header>

      <div className="stat-grid stat-grid-3">
        <StatCard label="Melhor carga" value={`${Math.max(...weights).toLocaleString('pt-BR')} kg`} />
        <StatCard label="Ganho desde o início" value={`${gain > 0 ? '+' : ''}${gain.toLocaleString('pt-BR')} kg`} />
        <StatCard label="Sessões" value={weights.length} />
      </div>

      <ProgressChart title={`Maior carga em ${exercise} (kg)`} kind="line" data={weightSeries} unit="kg" labelHeading="Data" />
      <ProgressChart title="Volume semanal, últimas 8 semanas (kg)" kind="bar" data={volumeSeries} unit="kg" labelHeading="Semana de" />
    </div>
  );
}
