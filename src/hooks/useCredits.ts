import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserCredits } from '../lib/pricing';

export interface CreditsStatus {
  credits: number;
  loading: boolean;
  error: string | null;
}

export function useCredits() {
  const { user } = useAuth();
  const [status, setStatus] = useState<CreditsStatus>({
    credits: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const loadCredits = async () => {
      try {
        const credits = await getUserCredits(user.uid);
        setStatus({
          credits,
          loading: false,
          error: null
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load credits'
        }));
      }
    };

    loadCredits();
  }, [user]);

  return status;
}