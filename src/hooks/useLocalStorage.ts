import { useCallback, useState } from 'react';

/** Funciona como useState, mas mantém o valor salvo no navegador. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const save = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Sem acesso ao armazenamento, o valor continua válido até a página recarregar.
      }
    },
    [key],
  );

  return [value, save] as const;
}
