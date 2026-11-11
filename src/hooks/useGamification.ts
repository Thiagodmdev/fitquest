import { useMemo } from 'react';
import { computeProgress } from '../lib/gamification';
import { useTraining } from './useTraining';

/** Calcula XP, nível, sequência e conquistas, refazendo a conta só quando os treinos mudam. */
export function useGamification() {
  const { workouts } = useTraining();
  return useMemo(() => computeProgress(workouts), [workouts]);
}
