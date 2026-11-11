import { useEffect, useRef } from 'react';

export interface ExerciseDraft {
  key: number;
  name: string;
  sets: string;
  reps: string;
  weightKg: string;
}

interface ExerciseRowProps {
  exercise: ExerciseDraft;
  focusOnMount: boolean;
  canRemove: boolean;
  onChange(exercise: ExerciseDraft): void;
  onRemove(): void;
}

/** Uma linha do formulário de treino: nome, séries, repetições e carga. */
export default function ExerciseRow({ exercise, focusOnMount, canRemove, onChange, onRemove }: ExerciseRowProps) {
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusOnMount) nameInput.current?.focus();
    // Só deve rodar quando a linha aparece.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="exercise-row">
      <label className="field exercise-name">
        <span>Exercício</span>
        <input
          ref={nameInput}
          required
          list="exercise-suggestions"
          value={exercise.name}
          onChange={(event) => onChange({ ...exercise, name: event.target.value })}
        />
      </label>
      <label className="field">
        <span>Séries</span>
        <input
          required
          type="number"
          min="1"
          inputMode="numeric"
          value={exercise.sets}
          onChange={(event) => onChange({ ...exercise, sets: event.target.value })}
        />
      </label>
      <label className="field">
        <span>Reps</span>
        <input
          required
          type="number"
          min="1"
          inputMode="numeric"
          value={exercise.reps}
          onChange={(event) => onChange({ ...exercise, reps: event.target.value })}
        />
      </label>
      <label className="field">
        <span>Carga (kg)</span>
        <input
          required
          type="number"
          min="0"
          step="0.5"
          inputMode="decimal"
          value={exercise.weightKg}
          onChange={(event) => onChange({ ...exercise, weightKg: event.target.value })}
        />
      </label>
      <button
        type="button"
        className="button-icon"
        aria-label={`Remover ${exercise.name || 'exercício'}`}
        disabled={!canRemove}
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}
