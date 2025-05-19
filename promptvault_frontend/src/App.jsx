import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import HomePage from './pages/HomePage';
import MyPromptsPage from './pages/MyPromptsPage';
import TrendingPrompts from './components/TrendingPrompts';


function App() {
  const { user, logout } = useAuth();
  const googleLoginUrl = 'http://127.0.0.1:8000/accounts/google/login/';
  const djangoLogoutUrl = 'http://127.0.0.1:8000/accounts/logout/';

  const handleLogout = () => {
    logout(); // Clears frontend state
    window.location.href = djangoLogoutUrl; // Redirects to Django logout
  };

  return (
    <div className="min-h-screen bg-slate-800  font-sans text-gray-100">
      <nav className="bg-neutral-800  border-b border-gray-700 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link 
            to="/" 
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
          >
            PromptVault
          </Link>
          
          <ul className="flex space-x-6 items-center">
            <li>
              <Link 
                to="/" 
                className="hover:text-indigo-400 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </Link>
            </li>
            
            {user ? (
              <>
                <li>
                  <Link 
                    to="/my-prompts" 
                    className="hover:text-indigo-400 transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="hidden sm:inline">My Prompts</span>
                  </Link>
                </li>
                
                <li >
                  <Link to = "/trending">
                    <span>Trending</span>
                  </Link>
                </li>



                <li className="ml-4 flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-sm">{user.email}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 px-4 rounded-lg transition-all shadow hover:shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </li>
              </>
            ) : (
              <li className="ml-auto">
                <a
                  href={googleLoginUrl}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-4 rounded-lg transition-all shadow hover:shadow-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login with Google</span>
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
          <Route path="*" element={<Navigate to="/" replace />} />;
          <Route path='/trending' element = { <TrendingPrompts/>} />
        </Routes>
      </main>

      <footer className="mt-12 py-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} PromptVault. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;