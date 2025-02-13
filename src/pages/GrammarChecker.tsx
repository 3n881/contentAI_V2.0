import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Loader2, AlertCircle, Copy } from 'lucide-react';
import { checkGrammar, checkPlagiarism, type GrammarCheck } from '../lib/grammar';
import { useAuth } from '../contexts/AuthContext';
import { getUserCredits } from '../lib/pricing';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function GrammarChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grammarResults, setGrammarResults] = useState<GrammarCheck | null>(null);
  const [originalityScore, setOriginalityScore] = useState<number | null>(null);
  const [credits, setCredits] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserCredits();
    }
  }, [user]);

  const loadUserCredits = async () => {
    if (!user) return;
    const userCredits = await getUserCredits(user.uid);
    setCredits(userCredits);
  };

  const handleCopyText = async () => {
    if (grammarResults?.correctedText) {
      try {
        await navigator.clipboard.writeText(grammarResults.correctedText);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const handleCheck = async () => {
    if (!user || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (credits <= 0) {
        setError('No credits remaining. Please purchase credits to continue.');
        navigate('/pricing');
        return;
      }

      const [grammarResult, plagiarismResult] = await Promise.all([
        checkGrammar(content),
        checkPlagiarism(content)
      ]);

      setGrammarResults(grammarResult);
      setOriginalityScore(plagiarismResult);

      // Deduct one credit
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: credits - 1
      });

      // Update local credits state
      setCredits(prev => prev - 1);
      
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.error('Error checking content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Grammar & Plagiarism Checker</h1>
            <div className="text-sm text-gray-600">
              Credits remaining: {credits}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Check
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Paste your content here..."
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <p className="text-sm mt-1">Please try again in a few moments.</p>
              </div>
            </div>
          )}

          <button
            onClick={handleCheck}
            disabled={loading || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Checking...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Content
              </>
            )}
          </button>

          {grammarResults && (
            <div className="mt-8 space-y-6">
              {/* Corrected Text Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Corrected Text</h2>
                <div className="relative">
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap">
                    {grammarResults.correctedText}
                  </div>
                  <button
                    onClick={handleCopyText}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 bg-white rounded-md shadow-sm hover:shadow transition-all"
                    title="Copy corrected text"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  {copySuccess && (
                    <div className="absolute top-2 right-12 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Copied!
                    </div>
                  )}
                </div>
              </div>

              {/* Grammar Suggestions */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">Grammar & Style Suggestions</h2>
                {grammarResults.corrections.length === 0 ? (
                  <div className="p-4 bg-green-50 text-green-700 rounded-md flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    No grammar issues found!
                  </div>
                ) : (
                  grammarResults.corrections.map((correction, index) => (
                    <div key={index} className="mb-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-800 line-through">{correction.original}</p>
                          <p className="text-sm font-medium text-gray-900 mt-1">{correction.suggestion}</p>
                          <p className="text-xs text-gray-600 mt-1">{correction.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Scores Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">Grammar Score</h2>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          grammarResults.overallScore > 80
                            ? 'bg-green-600'
                            : grammarResults.overallScore > 60
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${grammarResults.overallScore}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {grammarResults.overallScore}/100
                    </span>
                  </div>
                </div>

                {originalityScore !== null && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">Originality Score</h2>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            originalityScore > 80
                              ? 'bg-green-600'
                              : originalityScore > 60
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${originalityScore}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {originalityScore}% Original
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}