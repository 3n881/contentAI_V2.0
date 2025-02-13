import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { generateContent } from '../lib/openai';
import { getUserCredits } from '../lib/pricing';
import { useUserCredits } from '../hooks/useUserCredits';


interface ContentForm {
  type: string;
  topic: string;
  tone: string;
  keywords: string;
  length: string;
}

export default function CreateContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [form, setForm] = useState<ContentForm>({
    type: 'blog-post',
    topic: '',
    tone: 'professional',
    keywords: '',
    length: 'medium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  // const { credits, useCredits, reloadCredits } = useUserCredits();


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      if (credits <= 0) {
        setError('No credits remaining. Please purchase credits to continue.');
        navigate('/pricing');
        return;
      }

      // Check and deduct credits
      
      const content = await generateContent(form);
      setGeneratedContent(content);

      // Record the content generation
      await addDoc(collection(db, 'projects'), {
        userId: user.uid,
        ...form,
        content,
        createdAt: new Date().toISOString(),
      });

      // Deduct one credit
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        credits: credits - 1
      });

      // Update local credits state
      setCredits(prev => prev - 1);

    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Content</h1>
            <div className="text-sm text-gray-600">
              Credits remaining: {credits}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="blog-post">Blog Post</option>
                <option value="social-media">Social Media Post</option>
                <option value="article">Article</option>
                <option value="product-description">Product Description</option>
                <option value="email">Email Campaign</option>
              </select>
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Topic or Title
              </label>
              <input
                type="text"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter your topic or title"
                required
              />
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tone
              </label>
              <select
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="friendly">Friendly</option>
                <option value="persuasive">Persuasive</option>
                <option value="humorous">Humorous</option>
              </select>
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Enter keywords, separated by commas"
              />
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Content Length
              </label>
              <select
                value={form.length}
                onChange={(e) => setForm({ ...form, length: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="short">Short (~300 words)</option>
                <option value="medium">Medium (~600 words)</option>
                <option value="long">Long (~1000 words)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Generated Content */}
          {generatedContent && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Generated Content</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="prose max-w-none">
                  {generatedContent.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}