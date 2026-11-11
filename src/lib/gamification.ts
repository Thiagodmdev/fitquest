import type { ChartPoint, Exercise, Workout } from '../types';
import { addDays, formatShortDate, mondayOf, parseISODate, toISODate } from './dates';

/**
 * Regras do jogo. O progresso é sempre recalculado a partir da lista de treinos,
 * então editar ou excluir um treino nunca deixa XP ou conquistas inconsistentes.
 */
export const XP_BASE = 50;
export const XP_PER_EXERCISE = 10;
export const XP_MAX_DURATION = 90;
export const XP_PER_RECORD = 25;
export const XP_PER_ACTIVE_WEEK = 100;
/** Uma semana conta para a sequência quando tem pelo menos este número de treinos. */
export const ACTIVE_WEEK_MIN_WORKOUTS = 2;

const LEVEL_TITLES = ['Iniciante', 'Aprendiz', 'Atleta', 'Competidor', 'Elite', 'Lenda'];

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unlocked: boolean;
}

export interface Progress {
  totalXp: number;
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpToNextLevel: number;
  totalWorkouts: number;
  totalVolume: number;
  totalRecords: number;
  currentStreak: number;
  bestStreak: number;
  workoutsThisWeek: number;
  xpByWorkout: Record<string, number>;
  recordsByWorkout: Record<string, number>;
  achievements: Achievement[];
}

/** XP acumulado necessário para alcançar um nível: 0, 200, 600, 1200, 2000... */
export function xpForLevel(level: number): number {
  return 100 * level * (level - 1);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

function levelTitle(level: number): string {
  const index = Math.min(Math.floor((level - 1) / 2), LEVEL_TITLES.length - 1);
  return LEVEL_TITLES[index];
}

export function normalizeExerciseName(name: string): string {
  return name.trim().toLocaleLowerCase('pt-BR');
}

export function exerciseVolume(exercise: Exercise): number {
  return exercise.sets * exercise.reps * exercise.weightKg;
}

export function workoutVolume(workout: Workout): number {
  return workout.exercises.reduce((sum, exercise) => sum + exerciseVolume(exercise), 0);
}

function chronological(workouts: Workout[]): Workout[] {
  return [...workouts].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
  );
}

function computeStreaks(workouts: Workout[], now: Date) {
  const countByWeek = new Map<string, number>();
  for (const workout of workouts) {
    const week = toISODate(mondayOf(parseISODate(workout.date)));
    countByWeek.set(week, (countByWeek.get(week) ?? 0) + 1);
  }
  const isActive = (week: string) => (countByWeek.get(week) ?? 0) >= ACTIVE_WEEK_MIN_WORKOUTS;

  const activeWeeks = [...countByWeek.keys()].filter(isActive).sort();
  let bestStreak = 0;
  let run = 0;
  let previous: string | null = null;
  for (const week of activeWeeks) {
    const continuesRun = previous !== null && toISODate(addDays(parseISODate(previous), 7)) === week;
    run = continuesRun ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    previous = week;
  }

  // A semana atual ainda está em andamento: se não estiver ativa, ela não quebra a sequência.
  const thisWeek = mondayOf(now);
  let cursor = isActive(toISODate(thisWeek)) ? thisWeek : addDays(thisWeek, -7);
  let currentStreak = 0;
  while (isActive(toISODate(cursor))) {
    currentStreak += 1;
    cursor = addDays(cursor, -7);
  }

  return {
    activeWeekCount: activeWeeks.length,
    bestStreak,
    currentStreak,
    workoutsThisWeek: countByWeek.get(toISODate(thisWeek)) ?? 0,
  };
}

export function computeProgress(workouts: Workout[], now: Date = new Date()): Progress {
  const bestWeightByExercise = new Map<string, number>();
  const xpByWorkout: Record<string, number> = {};
  const recordsByWorkout: Record<string, number> = {};
  let workoutXp = 0;
  let totalRecords = 0;
  let totalVolume = 0;

  for (const workout of chronological(workouts)) {
    let records = 0;
    for (const exercise of workout.exercises) {
      const key = normalizeExerciseName(exercise.name);
      const best = bestWeightByExercise.get(key);
      // A primeira vez em um exercício define a marca; só superá-la conta como recorde.
      if (best !== undefined && exercise.weightKg > best) records += 1;
      if (best === undefined || exercise.weightKg > best) {
        bestWeightByExercise.set(key, exercise.weightKg);
      }
    }
    const xp =
      XP_BASE +
      workout.exercises.length * XP_PER_EXERCISE +
      Math.min(workout.durationMin, XP_MAX_DURATION) +
      records * XP_PER_RECORD;
    xpByWorkout[workout.id] = xp;
    recordsByWorkout[workout.id] = records;
    workoutXp += xp;
    totalRecords += records;
    totalVolume += workoutVolume(workout);
  }

  const streaks = computeStreaks(workouts, now);
  const totalXp = workoutXp + streaks.activeWeekCount * XP_PER_ACTIVE_WEEK;
  const level = levelFromXp(totalXp);
  const levelStart = xpForLevel(level);

  return {
    totalXp,
    level,
    levelTitle: levelTitle(level),
    xpIntoLevel: totalXp - levelStart,
    xpToNextLevel: xpForLevel(level + 1) - levelStart,
    totalWorkouts: workouts.length,
    totalVolume,
    totalRecords,
    currentStreak: streaks.currentStreak,
    bestStreak: streaks.bestStreak,
    workoutsThisWeek: streaks.workoutsThisWeek,
    xpByWorkout,
    recordsByWorkout,
    achievements: buildAchievements(
      workouts.length,
      totalRecords,
      totalVolume,
      streaks.bestStreak,
      level,
    ),
  };
}

function buildAchievements(
  workouts: number,
  records: number,
  volume: number,
  bestStreak: number,
  level: number,
): Achievement[] {
  const definitions: Omit<Achievement, 'unlocked'>[] = [
    { id: 'first-workout', icon: '🏁', title: 'Primeiro passo', description: 'Registre seu primeiro treino', current: workouts, target: 1 },
    { id: 'workouts-10', icon: '💪', title: 'Pegando ritmo', description: 'Complete 10 treinos', current: workouts, target: 10 },
    { id: 'workouts-50', icon: '🏋️', title: 'Veterano', description: 'Complete 50 treinos', current: workouts, target: 50 },
    { id: 'first-record', icon: '📈', title: 'Novo patamar', description: 'Bata seu primeiro recorde de carga', current: records, target: 1 },
    { id: 'records-10', icon: '🚀', title: 'Quebra-recordes', description: 'Bata 10 recordes de carga', current: records, target: 10 },
    { id: 'streak-4', icon: '🔥', title: 'Um mês firme', description: 'Mantenha 4 semanas ativas em sequência', current: bestStreak, target: 4 },
    { id: 'streak-12', icon: '☄️', title: 'Imparável', description: 'Mantenha 12 semanas ativas em sequência', current: bestStreak, target: 12 },
    { id: 'volume-10k', icon: '🧱', title: 'Dez toneladas', description: 'Levante 10.000 kg de volume total', current: volume, target: 10000 },
    { id: 'volume-100k', icon: '🏔️', title: 'Cem toneladas', description: 'Levante 100.000 kg de volume total', current: volume, target: 100000 },
    { id: 'level-5', icon: '👑', title: 'Elite à vista', description: 'Alcance o nível 5', current: level, target: 5 },
  ];
  return definitions.map((definition) => ({
    ...definition,
    unlocked: definition.current >= definition.target,
  }));
}

/** Lista de exercícios já registrados, usando a grafia mais recente de cada nome. */
export function listExerciseNames(workouts: Workout[]): string[] {
  const names = new Map<string, string>();
  for (const workout of chronological(workouts)) {
    for (const exercise of workout.exercises) {
      names.set(normalizeExerciseName(exercise.name), exercise.name.trim());
    }
  }
  return [...names.values()].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Maior carga por treino de um exercício, em ordem cronológica. */
export function exerciseWeightSeries(workouts: Workout[], exerciseName: string): ChartPoint[] {
  const key = normalizeExerciseName(exerciseName);
  const points: ChartPoint[] = [];
  for (const workout of chronological(workouts)) {
    const matches = workout.exercises.filter(
      (exercise) => normalizeExerciseName(exercise.name) === key,
    );
    if (matches.length > 0) {
      points.push({
        label: formatShortDate(workout.date),
        value: Math.max(...matches.map((exercise) => exercise.weightKg)),
      });
    }
  }
  return points;
}

/** Volume levantado em cada uma das últimas semanas, incluindo as semanas zeradas. */
export function weeklyVolumeSeries(
  workouts: Workout[],
  weeks = 8,
  now: Date = new Date(),
): ChartPoint[] {
  const thisWeek = mondayOf(now);
  const volumeByWeek = new Map<string, number>();
  for (const workout of workouts) {
    const week = toISODate(mondayOf(parseISODate(workout.date)));
    volumeByWeek.set(week, (volumeByWeek.get(week) ?? 0) + workoutVolume(workout));
  }
  return Array.from({ length: weeks }, (_, index) => {
    const week = toISODate(addDays(thisWeek, (index - weeks + 1) * 7));
    return { label: formatShortDate(week), value: volumeByWeek.get(week) ?? 0 };
  });
}
