import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to PromptVault!</h1>
      <p className="text-lg text-gray-600 mb-6">
        Your personal space to store, manage, and discover amazing prompts.
      </p>
      {user ? (
        <div>
          <p className="text-xl mb-4">You are logged in, {user.username}.</p>
          <Link
            to="/my-prompts"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-150"
          >
            Go to My Prompts
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-xl mb-4">Get started by logging in with your Google account.</p>
          {/* Login button is in the main App navbar */}
        </div>
      )}
      {/* You can add more content here, like featured public prompts later */}
    </div>
  );
};

export default HomePage;