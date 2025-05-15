import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-6">
            Welcome to PromptVault
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your personal space to store, manage, and organize AI prompts with style
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-75"></div>
            <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {user ? (
          <div className="space-y-6">
            <p className="text-xl text-gray-300">
              Welcome back, <span className="font-medium text-indigo-400">{user.username || user.email}</span>!
            </p>
            <Link
              to="/my-prompts"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Go to My Prompts
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-xl text-gray-300">
              Get started by logging in with your Google account
            </p>
            <div className="flex justify-center">
              <div className="animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Use the login button in the navigation above
            </p>
          </div>
        )}

        {/* Feature highlights section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔒',
              title: 'Secure Storage',
              description: 'Your prompts are safely stored and always accessible'
            },
            {
              icon: '🏷️',
              title: 'Smart Tagging',
              description: 'Organize with tags for quick retrieval'
            },
            {
              icon: '🚀',
              title: 'Quick Access',
              description: 'Copy prompts with a single click'
            }
          ].map((feature, index) => (
            <div key={index} className="bg-gray-700/50 p-6 rounded-xl border border-gray-600 hover:border-indigo-400 transition-colors">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;