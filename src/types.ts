export interface AppUser {
  uid: string;
  name: string;
  email: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
}

export interface Workout {
  id: string;
  name: string;
  /** Data do treino no formato AAAA-MM-DD. */
  date: string;
  durationMin: number;
  exercises: Exercise[];
  createdAt: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: number;
}

export type NewWorkout = Omit<Workout, 'id'>;
export type NewRoutine = Omit<Routine, 'id'>;

export interface ChartPoint {
  label: string;
  value: number;
}
