import { useState, useEffect } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

export type NextStepOption = 
  | 'payment-integration'
  | 'email-notifications'
  | 'advanced-booking'
  | 'analytics-dashboard'
  | 'none';

const STORAGE_KEY_PREFIX = 'sgo-next-step';

/**
 * Hook for managing the selected roadmap "Next Step" with local persistence.
 * Scoped per Principal ID when available, falls back to anonymous storage.
 */
export function useNextStep() {
  const { identity } = useInternetIdentity();
  const [selectedStep, setSelectedStep] = useState<NextStepOption>('none');
  const [isLoading, setIsLoading] = useState(true);

  // Determine storage key based on current principal
  const getStorageKey = (): string => {
    if (identity) {
      const principal = identity.getPrincipal().toString();
      return `${STORAGE_KEY_PREFIX}-${principal}`;
    }
    return `${STORAGE_KEY_PREFIX}-anonymous`;
  };

  // Load from localStorage on mount or when identity changes
  useEffect(() => {
    try {
      const key = getStorageKey();
      const stored = localStorage.getItem(key);
      if (stored && isValidNextStepOption(stored)) {
        setSelectedStep(stored as NextStepOption);
      }
    } catch (error) {
      console.error('Failed to load next step from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [identity]);

  // Save to localStorage whenever selection changes
  const updateSelectedStep = (step: NextStepOption) => {
    try {
      const key = getStorageKey();
      localStorage.setItem(key, step);
      setSelectedStep(step);
    } catch (error) {
      console.error('Failed to save next step to localStorage:', error);
    }
  };

  return {
    selectedStep,
    setSelectedStep: updateSelectedStep,
    isLoading,
  };
}

function isValidNextStepOption(value: string): boolean {
  return [
    'payment-integration',
    'email-notifications',
    'advanced-booking',
    'analytics-dashboard',
    'none',
  ].includes(value);
}
