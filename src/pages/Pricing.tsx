

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { pricingPlans, processPayment, getUserCredits } from '../lib/pricing';

export default function Pricing() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCredits, setCurrentCredits] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadUserCredits();
    }
  }, [user]);

  const loadUserCredits = async () => {
    if (!user) return;
    const credits = await getUserCredits(user.uid);
    setCurrentCredits(credits);
  };

  const handlePurchase = async (planId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const previousCredits = currentCredits;
      await processPayment(user.uid, planId);
      
      // Poll for credit update
      const pollInterval = setInterval(async () => {
        const newCredits = await getUserCredits(user.uid);
        if (newCredits > previousCredits) {
          setCurrentCredits(newCredits);
          clearInterval(pollInterval);
        }
      }, 2000); // Check every 2 seconds

      // Stop polling after 1 minute
      setTimeout(() => clearInterval(pollInterval), 60000);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
          <p className="mt-4 text-xl text-gray-600">
            Get access to powerful AI content generation tools
          </p>
          <p className="mt-2 text-lg text-indigo-600">
            Current Credits: {currentCredits}
          </p>
        </div>

        {error && (
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                <p className="mt-4 text-gray-500">{plan.credits} content credits</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ₹{plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">/one-time</span>
                </p>
                <button
                  onClick={() => handlePurchase(plan.id)}
                  disabled={loading}
                  className="mt-8 block w-full bg-indigo-600 text-white rounded-lg px-6 py-4 text-center font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </span>
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
              <div className="px-8 pb-8">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                  What's included
                </h3>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="ml-3 text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-indigo-900 mb-4">
              Why Choose Our Platform?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-indigo-800 mb-2">
                  Content Generation
                </h4>
                <ul className="space-y-2 text-sm text-indigo-700">
                  <li>• Blog posts and articles</li>
                  <li>• Social media content</li>
                  <li>• Product descriptions</li>
                  <li>• Email campaigns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-indigo-800 mb-2">
                  Advanced Features
                </h4>
                <ul className="space-y-2 text-sm text-indigo-700">
                  <li>• SEO optimization</li>
                  <li>• Grammar checking</li>
                  <li>• Plagiarism detection</li>
                  <li>• Content scheduling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}