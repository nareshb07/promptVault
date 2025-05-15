import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../services/api';

const TrendingPrompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVotes, setUserVotes] = useState({}); // { promptId: 'up'|'down'|null }

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/prompts/trending/');
      const promptsData = res.data.results || res.data;
      setPrompts(promptsData);
      
      // Initialize userVotes state from API data
      const votesMap = {};
      promptsData.forEach(prompt => {
        votesMap[prompt.id] = prompt.user_vote || null; // 'up', 'down', or null
      });
      setUserVotes(votesMap);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load trending prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = useCallback(async (promptId, type) => {
    try {
      // Optimistic UI update
      const newVoteType = userVotes[promptId] === type ? null : type;
      setUserVotes(prev => ({ ...prev, [promptId]: newVoteType }));

      // Calculate optimistic score changes
      setPrompts(prev => prev.map(prompt => {
        if (prompt.id !== promptId) return prompt;
        
        const changes = { ...prompt };
        const currentVote = userVotes[promptId];
        
        // If removing vote
        if (newVoteType === null) {
          if (currentVote === 'up') changes.upvotes -= 1;
          if (currentVote === 'down') changes.downvotes -= 1;
        } 
        // If changing vote
        else if (currentVote) {
          if (type === 'up') {
            changes.upvotes += 1;
            changes.downvotes -= (currentVote === 'down' ? 1 : 0);
          } else {
            changes.downvotes += 1;
            changes.upvotes -= (currentVote === 'up' ? 1 : 0);
          }
        } 
        // If new vote
        else {
          if (type === 'up') changes.upvotes += 1;
          else changes.downvotes += 1;
        }
        
        return changes;
      }));

      // Make API call
      const endpoint = type === 'up' ? 'upvote' : 'downvote';
      const response = await apiClient.post(`prompts/${promptId}/${endpoint}/`);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Update with server response
      setPrompts(prev => prev.map(p => 
        p.id === promptId ? { 
          ...p, 
          upvotes: response.data.upvotes || p.upvotes,
          downvotes: response.data.downvotes || p.downvotes 
        } : p
      ));

    } catch (err) {
      console.error("Voting error:", err);
      setError(err.message || `Failed to ${type}vote`);
      // Revert optimistic updates
      fetchTrending(); // Refresh data from server
    }
  }, [userVotes]);

  useEffect(() => {
    fetchTrending();
  }, []);


  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="mt-3 text-gray-400">Loading trending prompts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-md text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-6">
        🔥 Trending Prompts
      </h2>

      {prompts.length === 0 && (
        <p className="text-gray-500 text-center py-6">No trending prompts yet.</p>
      )}

      <div className="space-y-6">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-5 shadow-md"
          >
            {/* Prompt Title */}
            <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>

            {/* Prompt Text */}
            <p className="mt-2 text-sm text-gray-300 line-clamp-3">
              {prompt.prompt_text}
            </p>

            {/* Tags */}
            {prompt.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded-full"
                  >
                    {typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Voting Controls */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-3">
                {/* Upvote Button */}
                <button
                  onClick={() => handleVote(prompt.id, 'up')}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                    userVotes[prompt.id] === 'up'
                      ? 'bg-emerald-900 text-emerald-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  }`}
                  aria-label="Upvote"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                {/* Score Display */}
                <div className={`text-lg font-semibold min-w-[24px] text-center ${
                  (prompt.upvotes - prompt.downvotes) > 0 ? 'text-emerald-400' :
                  (prompt.upvotes - prompt.downvotes) < 0 ? 'text-rose-400' :
                  'text-gray-400'
                }`}>
                  {prompt.upvotes - prompt.downvotes}
                </div>

                {/* Downvote Button */}
                <button
                  onClick={() => handleVote(prompt.id, 'down')}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                    userVotes[prompt.id] === 'down'
                      ? 'bg-rose-900 text-rose-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  }`}
                  aria-label="Downvote"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPrompts;