import { useState, useEffect } from 'react';

const TESTING_MODE_KEY = 'sgo_testing_mode';

/**
 * Hook to manage guest testing mode state
 * Defaults to OFF, persisted in localStorage
 * When ON, allows guests to see and book dummy/test hotels
 */
export function useTestingMode() {
  const [isTestingMode, setIsTestingMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(TESTING_MODE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TESTING_MODE_KEY, isTestingMode.toString());
    } catch (error) {
      console.warn('Failed to persist testing mode:', error);
    }
  }, [isTestingMode]);

  const toggleTestingMode = () => {
    setIsTestingMode((prev) => !prev);
  };

  return {
    isTestingMode,
    setIsTestingMode,
    toggleTestingMode,
  };
}
