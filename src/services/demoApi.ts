import { addDays, mondayOf, toISODate } from '../lib/dates';
import type { AppUser, Exercise, Routine, Workout } from '../types';
import type { Api, Unsubscribe } from './api';

/**
 * Modo demonstração: guarda tudo no localStorage do navegador, sem verificar senha.
 * Serve para rodar e apresentar o app sem um projeto Firebase; não é autenticação real.
 */
const SESSION_KEY = 'fitquest:demo:session';
const SAMPLE_USER: AppUser = { uid: 'demo-exemplo', name: 'Atleta Demo', email: 'demo@fitquest.app' };

function read<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

const workoutsKey = (uid: string) => `fitquest:demo:${uid}:workouts`;
const routinesKey = (uid: string) => `fitquest:demo:${uid}:routines`;

const PUSH: Exercise[] = [
  { name: 'Supino reto', sets: 4, reps: 8, weightKg: 50 },
  { name: 'Desenvolvimento', sets: 3, reps: 10, weightKg: 22 },
  { name: 'Tríceps na polia', sets: 3, reps: 12, weightKg: 20 },
];
const PULL: Exercise[] = [
  { name: 'Remada curvada', sets: 4, reps: 8, weightKg: 45 },
  { name: 'Puxada frontal', sets: 3, reps: 10, weightKg: 40 },
  { name: 'Rosca direta', sets: 3, reps: 12, weightKg: 14 },
];
const LEGS: Exercise[] = [
  { name: 'Agachamento', sets: 4, reps: 8, weightKg: 60 },
  { name: 'Leg press', sets: 3, reps: 12, weightKg: 120 },
  { name: 'Panturrilha em pé', sets: 3, reps: 15, weightKg: 40 },
];
const PLAN = [
  { name: 'Peito e ombros', exercises: PUSH },
  { name: 'Costas e bíceps', exercises: PULL },
  { name: 'Pernas', exercises: LEGS },
];

/** Dez semanas de treinos com carga crescente, terminando na semana anterior à atual. */
function buildSampleWorkouts(now: Date): Workout[] {
  const firstMonday = addDays(mondayOf(now), -70);
  const workouts: Workout[] = [];
  for (let week = 0; week < 10; week += 1) {
    // A semana 4 tem só um treino, para o gráfico e a sequência parecerem um histórico real.
    const sessions = week === 3 ? 1 : 3;
    for (let session = 0; session < sessions; session += 1) {
      const plan = PLAN[session];
      const date = addDays(firstMonday, week * 7 + session * 2);
      workouts.push({
        id: `exemplo-${week}-${session}`,
        name: plan.name,
        date: toISODate(date),
        durationMin: 50 + ((week + session) % 3) * 10,
        createdAt: date.getTime(),
        exercises: plan.exercises.map((exercise) => ({
          ...exercise,
          weightKg: exercise.weightKg + Math.floor(week / 2) * 2.5,
        })),
      });
    }
  }
  return workouts;
}

export function createDemoApi(): Api {
  const authListeners = new Set<(user: AppUser | null) => void>();
  const dataListeners = new Map<string, Set<() => void>>();

  function setSession(user: AppUser | null) {
    if (user) write(SESSION_KEY, user);
    else localStorage.removeItem(SESSION_KEY);
    authListeners.forEach((listener) => listener(user));
  }

  function watch<T>(key: string, onData: (items: T[]) => void): Unsubscribe {
    const emit = () => onData(read<T[]>(key, []));
    const listeners = dataListeners.get(key) ?? new Set();
    listeners.add(emit);
    dataListeners.set(key, listeners);
    emit();
    return () => listeners.delete(emit);
  }

  function save<T>(key: string, items: T[]) {
    write(key, items);
    dataListeners.get(key)?.forEach((emit) => emit());
  }

  function add<T extends { id: string }>(key: string, item: Omit<T, 'id'>) {
    save(key, [...read<T[]>(key, []), { ...item, id: crypto.randomUUID() } as T]);
  }

  function remove<T extends { id: string }>(key: string, id: string) {
    save(key, read<T[]>(key, []).filter((item) => item.id !== id));
  }

  return {
    mode: 'demo',

    onAuthChange(callback) {
      authListeners.add(callback);
      callback(read<AppUser | null>(SESSION_KEY, null));
      return () => authListeners.delete(callback);
    },

    async login(email) {
      setSession({ uid: `demo-${email.toLowerCase()}`, name: email.split('@')[0], email });
    },

    async register(name, email) {
      setSession({ uid: `demo-${email.toLowerCase()}`, name, email });
    },

    async logout() {
      setSession(null);
    },

    async loginWithSampleData() {
      save(workoutsKey(SAMPLE_USER.uid), buildSampleWorkouts(new Date()));
      save<Routine>(
        routinesKey(SAMPLE_USER.uid),
        PLAN.map((plan, index) => ({ ...plan, id: `rotina-${index}`, createdAt: index })),
      );
      setSession(SAMPLE_USER);
    },

    watchWorkouts: (uid, onData) => watch(workoutsKey(uid), onData),
    addWorkout: async (uid, workout) => add<Workout>(workoutsKey(uid), workout),
    deleteWorkout: async (uid, id) => remove<Workout>(workoutsKey(uid), id),
    watchRoutines: (uid, onData) => watch(routinesKey(uid), onData),
    addRoutine: async (uid, routine) => add<Routine>(routinesKey(uid), routine),
    deleteRoutine: async (uid, id) => remove<Routine>(routinesKey(uid), id),
  };
}
