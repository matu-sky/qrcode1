// src/hooks/usePrompt.ts
import { useContext, useEffect } from 'react';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

export function usePrompt({ when, message }: { when: boolean; message: string }) {
  const { navigator } = useContext(NavigationContext);

  useEffect(() => {
    if (!when) return;

    const unblock = (navigator as any).block((tx: any) => {
      if (window.confirm(message)) {
        unblock();
        tx.retry();
      }
    });

    return unblock;
  }, [navigator, when, message]);
}
