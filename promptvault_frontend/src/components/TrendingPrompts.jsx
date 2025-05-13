import React, { useEffect, useState } from 'react';

const TrendingPrompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load trending prompts
  const fetchTrending = async () => {
    try {
      const res = await fetch('/api/prompts/trending/');
      if (!res.ok) throw new Error('Failed to load trending prompts');
      console.log(res.json());
      const data = await res.json();
    //   console.log(data);
      
      setPrompts(data);
    } catch (err) {
        // console.log(data);\
        // console.log(err)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle vote actions
  const handleVote = async (promptId, type) => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/${type}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Replace with your auth logic
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error(`Failed to ${type} prompt`);

      const updatedPrompt = await res.json();

      // Update UI
      setPrompts((prev) =>
        prev.map((p) =>
          p.id === promptId ? { ...p, ...updatedPrompt } : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

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
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-700">
              <div className="flex space-x-4">
                <button
                  onClick={() => handleVote(prompt.id, 'upvote')}
                  className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                >
                  ↑ Upvote ({prompt.upvotes})
                </button>
                <button
                  onClick={() => handleVote(prompt.id, 'downvote')}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  ↓ Downvote ({prompt.downvotes})
                </button>
              </div>

              <div className="text-indigo-400 font-medium">
                Score: {(prompt.upvotes - prompt.downvotes).toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingPrompts;