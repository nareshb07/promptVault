import React, { useEffect, useState, useCallback } from 'react';
import apiClient from '../services/api';
import Icons from "../Icons/Icons";
import { toast, ToastContainer } from 'react-toastify'; // 👈 Added ToastContainer
import 'react-toastify/dist/ReactToastify.css';

const TrendingPrompts = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userVotes, setUserVotes] = useState({});
  const [expandedPrompts, setExpandedPrompts] = useState({});
  const [copiedPromptId, setCopiedPromptId] = useState(null);
  const [addedPromptIds, setAddedPromptIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [url, setUrl] = useState("https://tailwindcss.com/docs/text-align #examples");

  // Fetch trending prompts
  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/prompts/trending/');
      const promptsData = response.data.results || [];
      setPrompts(promptsData);
      const votes = {};
      promptsData.forEach((p) => {
        votes[p.id] = p.user_vote || null;
      });
      setUserVotes(votes);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.error || 'Failed to load trending prompts');
    } finally {
      setLoading(false);
    }
  };

  // Handle voting
  const handleVote = useCallback(
    async (promptId, type) => {
      const currentVote = userVotes[promptId];
      const isSameVote = currentVote === type;
      const newVote = isSameVote ? null : type;

      // Optimistic UI update
      setUserVotes((prev) => ({ ...prev, [promptId]: newVote }));
      setPrompts((prev) =>
        prev.map((p) => {
          if (p.id !== promptId) return p;
          let up = p.upvotes;
          let down = p.downvotes;

          // Remove previous vote if exists
          if (currentVote === 'up') up -= 1;
          if (currentVote === 'down') down -= 1;

          // Add new vote if not null
          if (newVote === 'up') up += 1;
          if (newVote === 'down') down += 1;

          return { ...p, upvotes: up, downvotes: down, score: up - down };
        })
      );

      try {
        const endpoint = newVote ? `${type}vote` : 'remove_vote';
        await apiClient.post(`/prompts/${promptId}/${endpoint}/`);

        // Show success toast
        toast.success(`👍 ${type.charAt(0).toUpperCase()}${type.slice(1)}voted successfully!`, {
          autoClose: 1000,
          position: "bottom-center",
        });

      } catch (err) {
        console.error('Voting error:', err);

        // Revert on error
        setUserVotes((prev) => ({ ...prev, [promptId]: currentVote }));
        setPrompts((prev) =>
          prev.map((p) => p.id === promptId ? {
            ...p,
            upvotes: p.upvotes,
            downvotes: p.downvotes,
            score: p.upvotes - p.downvotes
          } : p)
        );

        toast.error("❌ Failed to register vote. Please try again.");
      }
    },
    [userVotes]
  );

  // Toggle expand/collapse prompt text
  const toggleExpanded = (id) => {
    setExpandedPrompts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Add or remove prompt from added list
  const handleAddPrompt = async (promptId) => {
    // Early exit if already added
    if (addedPromptIds.includes(promptId)) return;

    // Optimistically update UI
    setAddedPromptIds((prev) => [...prev, promptId]);

    try {
      const res = await apiClient.post(`/prompts/copy/${promptId}/`);
      console.log(res.data.message);
      toast.success("✅ Prompt added successfully!", {
        autoClose: 2000,
        position: "bottom-center",
      });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to add prompt';
      console.error(errorMsg);

      if (errorMsg === "You already have this prompt in your collection.") {
        toast.info("💡 Already in your collection", {
          autoClose: 2000,
          position: "bottom-center",
        });
      } else {
        toast.error("❌ Failed to add prompt");
      }

      // Revert on error
      setAddedPromptIds((prev) => prev.filter((id) => id !== promptId));
    }
  };

  // Copy prompt text to clipboard
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedPromptId(id);
      toast.success("📋 Prompt text copied to clipboard!", {
        autoClose: 2000,
        position: "bottom-center",
      });
      setTimeout(() => setCopiedPromptId(null), 5000);
    }).catch((err) => {
      console.error('Clipboard error:', err);
      toast.error("❌ Failed to copy prompt text. Please try again.");
    });
  };

  // Load trending prompts on mount
  useEffect(() => {
    fetchTrending();
  }, []);

  // Filter prompts by title or author
 const filteredPrompts = prompts.filter((prompt) => {
  const query = searchQuery.toLowerCase();

  // Match title or author
  const matchesTitle = prompt.title.toLowerCase().includes(query);
  const matchesAuthor = prompt.user_username?.toLowerCase().includes(query);

  // Match any tag name
  const matchesTag = prompt.tags?.some((tag) =>
    tag.name.toLowerCase().includes(query)
  );

  return matchesTitle || matchesAuthor || matchesTag;
});
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
      <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-md text-center mb-6">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 rounded-md text-center mb-6">
          {error}
        </div>
      )}

      {/* Heading + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-mono font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          🔥 Trending Prompts
        </h2>
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="mt-3 text-gray-400">Loading trending prompts...</p>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No matching prompts found.</p>
      ) : (
        <div className="space-y-6">
          {filteredPrompts.map((prompt) => {
            const vote = userVotes[prompt.id];
            const isExpanded = expandedPrompts[prompt.id];
            const isAdded = addedPromptIds.includes(prompt.id);
            return (
              <div
                key={prompt.id}
                className="bg-slate-900/25 backdrop-blur-sm border border-gray-700 rounded-2xl pb-2 shadow-md hover:border-gray-600 transition-all group"
              >
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-center justify-between bg-slate-700 rounded-t-2xl">
                    <h3 className="text-lg font-semibold font-mono text-white px-3 py-1 rounded-md inline-block">
                      {prompt.title}
                    </h3>
                    <div className="flex space-x-3 pr-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(prompt.prompt_text, prompt.id);
                        }}
                        className={`p-2 transition-colors rounded-full ${
                          copiedPromptId === prompt.id
                            ? ' text-gray-900  hover:text-gray-200'
                            : ' hover:text-gray-900  text-gray-200'
                        }`}
                        title="Copy to clipboard"
                      >
                        {copiedPromptId === prompt.id ? (
                          <Icons name="check" className="text-indigo-400 h-4 w-4" />
                        ) : (
                          <Icons name="copy" className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddPrompt(prompt.id);
                        }}
                        disabled={isAdded}
                        className={`rounded-full p-2 transition-colors ${
                          isAdded
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'hover:bg-gray-200 hover:text-gray-900 bg-gray-900 text-gray-200'
                        }`}
                        title={isAdded ? 'Already added' : 'Add to your prompts'}
                      >
                        {isAdded ? (
                          <Icons name="check" className="h-4 w-4" />
                        ) : (
                          <Icons name="plus" className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Tags */}
                  {prompt.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 px-2">
                      {prompt.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="text-xs bg-slate-300 text-slate-950 px-2 py-0.5 rounded-full"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Prompt Text */}
                <p className="mt-2 text-xs px-3 text-justify font-mono italic text-gray-300 whitespace-pre-wrap">
                  {isExpanded
                    ? prompt.prompt_text
                    : `${prompt.prompt_text.slice(0, 200)}${prompt.prompt_text.length > 200 ? '...' : ''}`
                  }
                  {prompt.prompt_text.length > 200 && (
                    <button
                      onClick={() => toggleExpanded(prompt.id)}
                      className="ml-1 text-indigo-400 hover:text-indigo-300 underline text-sm inline"
                    >
                      {isExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </p>
                {/* Voting */}
                <div className="px-3 flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                  <div className="flex items-center space-x-3 bg-gray-800 rounded-lg">
                    <button
                      onClick={() => handleVote(prompt.id, 'up')}
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                        vote === 'up'
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      aria-label="Upvote"
                    >
                      <Icons name="arrowUp" className="h-5 w-5" />
                    </button>
                    <div className="text-md font-semibold text-center text-gray-100 max-w-5px]">
                      {prompt.score}
                    </div>
                    <button
                      onClick={() => handleVote(prompt.id, 'down')}
                      className={`flex items-center justify-center w-7 h-7 rounded-full transition-colors ${
                        vote === 'down'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                      aria-label="Downvote"
                    >
                      <Icons name="arrowDown" className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-gray-400 mt-1">
                    by{' '}
                    {prompt.user_username ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-sky-500"
                      >
                        @{prompt.user_username}
                      </a>
                    ) : (
                      <span>Anonymous</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🧨 Required: Toast Container 😎 */}
      <ToastContainer />
    </div>
  );
};

export default TrendingPrompts;