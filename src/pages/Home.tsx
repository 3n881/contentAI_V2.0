import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wand2, 
  Search, 
  CheckCircle, 
  Calendar, 
  Zap, 
  Shield, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Wand2 className="h-6 w-6 text-indigo-600" />,
      title: 'AI Content Generation',
      description: 'Create high-quality content in seconds with our advanced AI technology.'
    },
    {
      icon: <Search className="h-6 w-6 text-indigo-600" />,
      title: 'SEO Optimization',
      description: 'Get real-time SEO suggestions to rank higher in search results.'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
      title: 'Grammar & Plagiarism',
      description: 'Ensure your content is error-free and completely original.'
    },
    {
      icon: <Calendar className="h-6 w-6 text-indigo-600" />,
      title: 'Content Scheduling',
      description: 'Plan and schedule your content across multiple platforms.'
    }
  ];

  const benefits = [
    {
      icon: <Zap className="h-12 w-12 text-yellow-400" />,
      title: '10x Faster Content Creation',
      description: 'Save hours of work with AI-powered content generation.'
    },
    {
      icon: <Shield className="h-12 w-12 text-green-400" />,
      title: 'Quality Guaranteed',
      description: 'Advanced algorithms ensure high-quality, engaging content.'
    },
    {
      icon: <Award className="h-12 w-12 text-blue-400" />,
      title: 'SEO Optimized',
      description: 'Rank better in search results with built-in SEO tools.'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
              Create Amazing Content
              <span className="block text-indigo-600">Powered by AI</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
              Transform your content creation process with our AI-powered platform. 
              Generate high-quality content, optimize for SEO, and schedule posts - all in one place.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-3 text-lg font-medium text-indigo-600 bg-white border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Create Great Content
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our platform provides all the tools you need to create, optimize, and manage your content.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose Content AI?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Join thousands of content creators who trust our platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-white">
                Ready to Transform Your Content?
              </h2>
              <p className="mt-2 text-lg text-indigo-100">
                Get started with our AI-powered platform today.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-3 text-lg font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}