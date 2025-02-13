import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface UsageLimitProps {
  remainingTries: number;
}

export function UsageLimit({ remainingTries }: UsageLimitProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Usage Limit Reached</h2>
        <p className="text-gray-600 mb-6 text-center">
          {remainingTries > 0 ? (
            `You have ${remainingTries} ${remainingTries === 1 ? 'try' : 'tries'} remaining in the free tier.`
          ) : (
            "You've reached the limit of free tries."
          )}
        </p>
        <p className="text-gray-600 mb-6 text-center">
          Subscribe to continue using our premium features and unlock unlimited access.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => navigate('/subscription')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            View Subscription Plans
          </button>
        </div>
      </div>
    </div>
  );
}