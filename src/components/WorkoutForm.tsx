import { useState, type FormEvent } from 'react';
import { toISODate } from '../lib/dates';
import type { Exercise } from '../types';
import ExerciseRow, { type ExerciseDraft } from './ExerciseRow';

export interface WorkoutFormValues {
  name: string;
  date: string;
  durationMin: number;
  exercises: Exercise[];
  saveAsRoutine: boolean;
}

interface WorkoutFormProps {
  initialName?: string;
  initialExercises?: Exercise[];
  suggestions: string[];
  onSubmit(values: WorkoutFormValues): Promise<void>;
}

// Contador para dar a cada linha uma key estável, mesmo quando outra linha é removida.
let nextRowKey = 0;

function createRow(exercise?: Exercise): ExerciseDraft {
  return {
    key: nextRowKey++,
    name: exercise?.name ?? '',
    sets: String(exercise?.sets ?? 3),
    reps: String(exercise?.reps ?? 10),
    weightKg: String(exercise?.weightKg ?? ''),
  };
}

export default function WorkoutForm({ initialName = '', initialExercises = [], suggestions, onSubmit }: WorkoutFormProps) {
  const [today] = useState(() => toISODate(new Date()));
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState('60');
  const [saveAsRoutine, setSaveAsRoutine] = useState(false);
  const [rows, setRows] = useState<ExerciseDraft[]>(() =>
    initialExercises.length > 0 ? initialExercises.map((exercise) => createRow(exercise)) : [createRow()],
  );
  const [focusKey, setFocusKey] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addRow() {
    const row = createRow();
    setFocusKey(row.key);
    setRows([...rows, row]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        date,
        durationMin: Number(duration),
        saveAsRoutine,
        exercises: rows.map((row) => ({
          name: row.name.trim(),
          sets: Number(row.sets),
          reps: Number(row.reps),
          weightKg: Number(row.weightKg),
        })),
      });
    } catch {
      setError('Não foi possível salvar o treino. Tente novamente.');
      setSaving(false);
    }
  }

  return (
    <form className="panel form-stack" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="field form-grid-wide">
          <span>Nome do treino</span>
          {/* O Firestore recusa nomes com mais de 100 caracteres (ver firestore.rules). */}
          <input required maxLength={100} placeholder="Ex.: Peito e ombros" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field">
          <span>Data</span>
          <input required type="date" max={today} value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <label className="field">
          <span>Duração (min)</span>
          <input required type="number" min="1" inputMode="numeric" value={duration} onChange={(event) => setDuration(event.target.value)} />
        </label>
      </div>

      <datalist id="exercise-suggestions">
        {suggestions.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>

      <div className="form-stack">
        <h2>Exercícios</h2>
        {rows.map((row) => (
          <ExerciseRow
            key={row.key}
            exercise={row}
            focusOnMount={row.key === focusKey}
            canRemove={rows.length > 1}
            onChange={(next) => setRows(rows.map((item) => (item.key === row.key ? next : item)))}
            onRemove={() => setRows(rows.filter((item) => item.key !== row.key))}
          />
        ))}
        <button type="button" className="button button-ghost" onClick={addRow}>
          + Adicionar exercício
        </button>
      </div>

      <label className="check">
        <input type="checkbox" checked={saveAsRoutine} onChange={(event) => setSaveAsRoutine(event.target.checked)} />
        Salvar também como rotina para repetir depois
      </label>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <button type="submit" className="button" disabled={saving}>
        {saving ? 'Salvando…' : 'Concluir treino'}
      </button>
    </form>
  );
}
