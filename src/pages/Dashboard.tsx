import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserCredits } from '../lib/pricing';
import {
  PenTool,
  Calendar,
  Search,
  CheckCircle,
  Settings,
  LogOut,
  Plus,
  AlertCircle,
  CheckCircle2,
  CreditCard
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
// import { useUserCredits } from '../hooks/useUserCredits';


export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const [credits, setCredits] = useState<number>(0);
  const [projects, setProjects] = useState<any[]>([]); // State for user projects
  // const { credits, loading } = useUserCredits();


  useEffect(() => {
    if (user) {
      const loadCredits = async () => {
        const userCredits = await getUserCredits(user.uid);
        setCredits(userCredits);
      };
      loadCredits();
      loadProjects();


      // Refresh credits every 30 seconds
      const interval = setInterval(loadCredits, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);



  useEffect(() => {
    // Clear URL parameters after showing payment status
    if (paymentStatus) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentStatus, navigate]);

  const loadUserCredits = async () => {
    if (!user) return;
    try {
      const userCredits = await getUserCredits(user.uid);
      setCredits(userCredits);
    } catch (error) {
      console.error('Error loading credits:', error);
    }
  };
  const loadProjects = async () => {
    if (!user) return;
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(projectsQuery);
      const userProjects = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProjects(userProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate('/login');
  //   } catch (error) {
  //     console.error('Failed to log out:', error);
  //   }
  // };

  const features = [
    {
      title: 'New Content',
      icon: <PenTool className="h-6 w-6" />,
      description: 'Create new AI-generated content',
      link: '/create'
    },
    {
      title: 'Schedule',
      icon: <Calendar className="h-6 w-6" />,
      description: 'Manage content calendar',
      link: '/schedule'
    },
    {
      title: 'SEO Tools',
      icon: <Search className="h-6 w-6" />,
      description: 'Optimize your content',
      link: '/seo'
    },
    {
      title: 'Grammar Check',
      icon: <CheckCircle className="h-6 w-6" />,
      description: 'Grammar and plagiarism check',
      link: '/grammar'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Payment Status Messages */}
      {paymentStatus === 'success' && (
        <div className="bg-green-50 p-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
            <p className="text-green-700">
              Payment successful! Your credits have been added to your account.
            </p>
          </div>
        </div>
      )}
      {paymentStatus === 'failed' && (
        <div className="bg-red-50 p-4">
          <div className="max-w-7xl mx-auto flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-red-700">
              Payment failed. Please try again or contact support if the issue persists.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Content Assistant</h1>
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="flex items-center text-gray-600">
                <CreditCard className="h-5 w-5 mr-2" />
                
                  <span>{credits} credits</span>
                
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back, {user?.email}
          </h2>
          <p className="mt-1 text-gray-500">
            What would you like to create today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {features.map((feature) => (
            <button
              key={feature.title}
              onClick={() => navigate(feature.link)}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </button>
          ))}
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </button>
          </div>

          {/* Project Cards */}
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                  onClick={() => navigate(`/project/${project.id}`)} // Navigate to the details page
               >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.topic || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-500">{project.content.substring(0, 100)}...</p>
                  <button
                    // onClick={() => navigate(`/project/${project.id}`)}
                    className="mt-4 text-indigo-600 hover:text-indigo-800"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <PenTool className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new content project
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
