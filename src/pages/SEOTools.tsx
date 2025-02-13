import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { analyzeSEO, generateKeywordSuggestions, type SEOSuggestions } from '../lib/seo';
import { useAuth } from '../contexts/AuthContext';
import { getUserCredits } from '../lib/pricing';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function SEOTools() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SEOSuggestions | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);

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

  const handleAnalyze = async () => {
    if (!user || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (credits <= 0) {
        setError('No credits remaining. Please purchase credits to continue.');
        navigate('/pricing');
        return;
      }

      const [seoResults, keywordResults] = await Promise.all([
        analyzeSEO(content),
        generateKeywordSuggestions(content)
      ]);
      
      setSuggestions(seoResults);
      setKeywords(keywordResults);

      // Deduct one credit
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: credits - 1
      });

      // Update local credits state
      setCredits(prev => prev - 1);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      console.error('Error analyzing content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">SEO Tools</h1>
            <div className="text-sm text-gray-600">
              Credits remaining: {credits}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content to Analyze
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-40 p-3 border rounded-md"
              placeholder="Paste your content here..."
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !content}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Content
              </>
            )}
          </button>

          {suggestions && (
            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Title Suggestions</h2>
                <p className="text-gray-800 bg-gray-50 p-3 rounded">{suggestions.title}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Meta Description</h2>
                <p className="text-gray-800 bg-gray-50 p-3 rounded">{suggestions.metaDescription}</p>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Keyword Suggestions</h2>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">Readability Score</h2>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${suggestions.readabilityScore}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {suggestions.readabilityScore}/100
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}