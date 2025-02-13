// src/hooks/useUserCredits.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { checkCredits, deductCredits } from '../lib/credits';

export function useUserCredits() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCredits = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userCredits = await checkCredits(user.uid);
      setCredits(userCredits);
      setError(null);
    } catch (err) {
      setError('Failed to load credits');
    } finally {
      setLoading(false);
    }
  };

  const useCredits = async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;
    try {
      const success = await deductCredits(user.uid, amount);
      if (success) {
        setCredits(prev => prev - amount);
      }
      return success;
    } catch (err) {
      setError('Failed to use credits');
      return false;
    }
  };

  useEffect(() => {
    loadCredits();
  }, [user]);

  return {
    credits,
    loading,
    error,
    useCredits,
    reloadCredits: loadCredits
  };
}
