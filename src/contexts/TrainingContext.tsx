import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import type { NewRoutine, NewWorkout, Routine, Workout } from '../types';

export interface TrainingContextValue {
  workouts: Workout[];
  routines: Routine[];
  loading: boolean;
  error: string | null;
  addWorkout(workout: NewWorkout): Promise<void>;
  deleteWorkout(id: string): Promise<void>;
  addRoutine(routine: NewRoutine): Promise<void>;
  deleteRoutine(id: string): Promise<void>;
}

export const TrainingContext = createContext<TrainingContextValue | null>(null);

/** A key recria o estado ao trocar de conta, então os dados de um usuário nunca aparecem para outro. */
export function TrainingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  return (
    <UserTrainingProvider key={uid ?? 'anonimo'} uid={uid}>
      {children}
    </UserTrainingProvider>
  );
}

function UserTrainingProvider({ uid, children }: { uid: string | null; children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workoutsReady, setWorkoutsReady] = useState(false);
  const [routinesReady, setRoutinesReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assina os dados do usuário logado e cancela a assinatura ao sair.
  useEffect(() => {
    if (!uid) return;

    const handleError = () => setError('Não foi possível carregar seus dados. Tente novamente.');
    const stopWorkouts = api.watchWorkouts(
      uid,
      (items) => {
        setWorkouts([...items].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt));
        setWorkoutsReady(true);
      },
      handleError,
    );
    const stopRoutines = api.watchRoutines(
      uid,
      (items) => {
        setRoutines([...items].sort((a, b) => a.createdAt - b.createdAt));
        setRoutinesReady(true);
      },
      handleError,
    );
    return () => {
      stopWorkouts();
      stopRoutines();
    };
  }, [uid]);

  const requireUid = useCallback(() => {
    if (!uid) throw new Error('Usuário não autenticado.');
    return uid;
  }, [uid]);

  const addWorkout = useCallback((workout: NewWorkout) => api.addWorkout(requireUid(), workout), [requireUid]);
  const deleteWorkout = useCallback((id: string) => api.deleteWorkout(requireUid(), id), [requireUid]);
  const addRoutine = useCallback((routine: NewRoutine) => api.addRoutine(requireUid(), routine), [requireUid]);
  const deleteRoutine = useCallback((id: string) => api.deleteRoutine(requireUid(), id), [requireUid]);

  const loading = Boolean(uid) && !error && !(workoutsReady && routinesReady);

  const value = useMemo(
    () => ({ workouts, routines, loading, error, addWorkout, deleteWorkout, addRoutine, deleteRoutine }),
    [workouts, routines, loading, error, addWorkout, deleteWorkout, addRoutine, deleteRoutine],
  );

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}
