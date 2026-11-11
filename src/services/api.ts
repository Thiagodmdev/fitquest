import type { AppUser, NewRoutine, NewWorkout, Routine, Workout } from '../types';
import { createDemoApi } from './demoApi';
import { createFirebaseApi } from './firebaseApi';

export type Unsubscribe = () => void;

/** Contrato usado pela interface. Firebase e modo demonstração implementam as mesmas operações. */
export interface Api {
  mode: 'firebase' | 'demo';
  onAuthChange(callback: (user: AppUser | null) => void): Unsubscribe;
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  /** Disponível só no modo demonstração: entra com um histórico de exemplo. */
  loginWithSampleData?(): Promise<void>;
  watchWorkouts(uid: string, onData: (items: Workout[]) => void, onError: (error: Error) => void): Unsubscribe;
  addWorkout(uid: string, workout: NewWorkout): Promise<void>;
  deleteWorkout(uid: string, id: string): Promise<void>;
  watchRoutines(uid: string, onData: (items: Routine[]) => void, onError: (error: Error) => void): Unsubscribe;
  addRoutine(uid: string, routine: NewRoutine): Promise<void>;
  deleteRoutine(uid: string, id: string): Promise<void>;
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const api: Api = firebaseConfig.apiKey
  ? createFirebaseApi(firebaseConfig)
  : createDemoApi();
