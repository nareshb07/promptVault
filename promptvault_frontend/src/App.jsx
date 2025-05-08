import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import HomePage from './pages/HomePage';
import MyPromptsPage from './pages/MyPromptsPage';
// Import PromptFormPage if you decide to make it a separate route for "new"
// import PromptFormPage from './pages/PromptFormPage'; // Example

// You can remove App.css import if not used
// import './App.css';

function App() {
  const { user, logout } = useAuth();
  const googleLoginUrl = 'http://127.0.0.1:8000/accounts/google/login/';
  const djangoLogoutUrl = 'http://127.0.0.1:8000/accounts/logout/';

  const handleLogout = () => {
    logout(); // Clears frontend state
    window.location.href = djangoLogoutUrl; // Redirects to Django logout
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <nav className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold hover:text-blue-200">PromptVault</Link>
          <ul className="flex space-x-4 items-center">
            <li><Link to="/" className="hover:text-blue-200">Home</Link></li>
            {user ? (
              <>
                <li><Link to="/my-prompts" className="hover:text-blue-200">My Prompts</Link></li>
                {/* Add other authenticated links here later e.g., Public Prompts */}
                <li className="ml-auto">
                  <span className="mr-3 hidden sm:inline">Welcome, {user.email}!</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="ml-auto">
                <a
                  href={googleLoginUrl}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                >
                  Login with Google
                </a>
              </li>
            )}
          </ul>
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/my-prompts"
            element={user ? <MyPromptsPage /> : <Navigate to="/" replace />}
          />
          {/* Example for a dedicated "new prompt" page if you choose that route */}
          {/* <Route
            path="/prompts/new"
            element={user ? <PromptFormPage mode="create" /> : <Navigate to="/" replace />}
          /> */}
          {/* Example for a dedicated "edit prompt" page */}
          {/* <Route
            path="/prompts/edit/:promptId"
            element={user ? <PromptFormPage mode="edit" /> : <Navigate to="/" replace />}
          /> */}

          {/* Add more routes here as needed */}
          <Route path="*" element={<Navigate to="/" replace />} /> {/* Catch-all redirects to home */}
        </Routes>
      </main>
    </div>
  );
}

export default App;