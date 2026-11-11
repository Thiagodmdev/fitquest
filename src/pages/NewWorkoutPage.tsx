import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import WorkoutForm, { type WorkoutFormValues } from '../components/WorkoutForm';
import { useGamification } from '../hooks/useGamification';
import { useTraining } from '../hooks/useTraining';
import { computeProgress, listExerciseNames } from '../lib/gamification';
import type { WorkoutReward } from './DashboardPage';

export default function NewWorkoutPage() {
  const { workouts, routines, addWorkout, addRoutine } = useTraining();
  const progress = useGamification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routine = routines.find((item) => item.id === searchParams.get('rotina'));
  const suggestions = useMemo(() => listExerciseNames(workouts), [workouts]);

  async function handleSubmit({ saveAsRoutine, ...values }: WorkoutFormValues) {
    const newWorkout = { ...values, createdAt: Date.now() };
    await addWorkout(newWorkout);
    if (saveAsRoutine) {
      await addRoutine({ name: values.name, exercises: values.exercises, createdAt: newWorkout.createdAt });
    }

    // Compara o progresso antes e depois para mostrar exatamente o que este treino rendeu.
    const after = computeProgress([...workouts, { ...newWorkout, id: 'novo-treino' }]);
    const reward: WorkoutReward = {
      xp: after.totalXp - progress.totalXp,
      newLevel: after.level > progress.level ? after.level : null,
      unlocked: after.achievements
        .filter((achievement, index) => achievement.unlocked && !progress.achievements[index].unlocked)
        .map((achievement) => achievement.title),
    };
    navigate('/painel', { state: { reward } });
  }

  return (
    <div className="stack narrow">
      <header>
        <p className="eyebrow">Novo treino</p>
        <h1>{routine ? routine.name : 'Registrar treino'}</h1>
      </header>
      <WorkoutForm
        key={routine?.id ?? 'novo'}
        initialName={routine?.name}
        initialExercises={routine?.exercises}
        suggestions={suggestions}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
