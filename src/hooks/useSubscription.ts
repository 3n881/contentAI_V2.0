import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentSubscription } from '../lib/subscription';

export interface SubscriptionStatus {
  isSubscribed: boolean;
  currentPlan: string | null;
  credits: number;
  loading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    currentPlan: null,
    credits: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const loadSubscription = async () => {
      try {
        const subscription = await getCurrentSubscription(user.uid);
        setStatus({
          isSubscribed: subscription.status === 'active',
          currentPlan: subscription.plan,
          credits: subscription.credits,
          loading: false,
          error: null
        });
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load subscription status'
        }));
      }
    };

    loadSubscription();
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return false;
    
    try {
      const subscription = await getCurrentSubscription(user.uid);
      return subscription.status === 'active';
    } catch (error) {
      return false;
    }
  };

  return {
    ...status,
    checkSubscription
  };
}