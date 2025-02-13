import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Globe, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { scheduleContent, getScheduledContent, type ScheduledContent } from '../lib/scheduler';

export default function Scheduler() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('');
  const [platform, setPlatform] = useState('blog');
  const [loading, setLoading] = useState(false);
  const [scheduledItems, setScheduledItems] = useState<ScheduledContent[]>([]);

  useEffect(() => {
    if (user) {
      loadScheduledContent();
    }
  }, [user]);

  const loadScheduledContent = async () => {
    if (!user) return;
    const items = await getScheduledContent(user.uid);
    setScheduledItems(items as ScheduledContent[]);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const dateTime = new Date(`${publishDate}T${publishTime}`);
      await scheduleContent({
        userId: user.uid,
        title,
        content,
        publishDate: dateTime,
        platform,
        status: 'scheduled'
      });
      
      // Reset form and reload scheduled content
      setTitle('');
      setContent('');
      setPublishDate('');
      setPublishTime('');
      setPlatform('blog');
      await loadScheduledContent();
    } catch (error) {
      console.error('Error scheduling content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Content Scheduler</h1>

          <form onSubmit={handleSchedule} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 block w-full h-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="blog">Blog</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Content
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Scheduled Content</h2>
            <div className="space-y-4">
              {scheduledItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.content.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(item.publishDate).toLocaleString()}
                      </div>
                      <div className="flex items-center mt-1">
                        <Globe className="h-4 w-4 mr-1" />
                        {item.platform}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}