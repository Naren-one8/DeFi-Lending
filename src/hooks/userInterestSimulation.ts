import { useEffect, useRef } from 'react';
import { updateInterest } from '../services/mockData';

export function useInterestSimulation(enabled: boolean = true) {
  const intervalRef = useRef<number>();

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = window.setInterval(() => {
      updateInterest();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled]);
}
