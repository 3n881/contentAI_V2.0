import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, AlertCircle } from 'lucide-react';

interface CreditsCheckProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreditsCheck({ isOpen, onClose }: CreditsCheckProps) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">Credits Required</h2>
        <p className="text-gray-600 mb-6 text-center">
          You need credits to use this feature. Purchase credits to continue using our AI tools.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              onClose();
              navigate('/pricing');
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            View Plans
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}