import React, { useState, useEffect, useCallback } from 'react';
// import { Link } from 'react-router-dom'; // If you need links to edit page
import apiClient from '../services/api'; // Or '../api'
import { useAuth } from '../AuthContext'; // To ensure user is loaded

// We can make PromptForm a sub-component or import it
const PromptForm = ({ onPromptCreated, existingPromptData = null, onPromptUpdated }) => {
  const [title, setTitle] = useState(existingPromptData?.title || '');
  const [promptText, setPromptText] = useState(existingPromptData?.prompt_text || '');
  const [tags, setTags] = useState(existingPromptData?.tags?.join(', ') || ''); // For comma-separated input
// const [isPublic, setIsPublic] = useState(existingPromptData?.is_public || false); // Keep for later
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(existingPromptData);

  useEffect(() => {
    if (existingPromptData) {
      setTitle(existingPromptData.title);
      setPromptText(existingPromptData.prompt_text);
      setTags(existingPromptData.tags?.map(tag => typeof tag === 'object' ? tag.name : tag).join(', ') || '');
      // setTags(existingPromptData.tags?.join(', ') || '');
      // setIsPublic(existingPromptData.is_public || false);
    } else {
        // Reset for new prompt form
    setTitle('');
    setPromptText('');
    setTags('');
    // setIsPublic(false);
    }
  }, [existingPromptData]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !promptText) {
      setFormError('Title and Prompt Text are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');

    const promptData = {
      title,
      prompt_text: promptText,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      // tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      // is_public: isPublic,
    };

    try {
      let response;
      if (isEditing) {
        response = await apiClient.put(`/prompts/${existingPromptData.id}/`, promptData);
        if (onPromptUpdated) onPromptUpdated(response.data);
      } else {
        response = await apiClient.post('/prompts/', promptData);
        if (onPromptCreated) onPromptCreated(response.data); // Pass new prompt up
      }
      // Reset form only if not editing or if explicitly told to
      if (!isEditing) {
          setTitle('');
          setPromptText('');
          // setTags('');
          // setIsPublic(false);
      }
    } catch (err) {
      console.error("Error saving prompt:", err.response?.data || err.message);
      setFormError(`Failed to save prompt: ${JSON.stringify(err.response?.data) || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold">{isEditing ? "Edit Prompt" : "Create New Prompt"}</h3>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          id="title"
          placeholder="Prompt Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="promptText" className="block text-sm font-medium text-gray-700">Prompt Text</label>
        <textarea
          id="promptText"
          placeholder="Prompt Text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
          rows="4"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      {/* Add Tags and IsPublic fields later */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Prompt' : 'Add Prompt')}
      </button>
      {formError && <p className="text-red-500 text-sm mt-2">{formError}</p>}
    </form>
  );
};


const MyPromptsPage = () => {
  const { user } = useAuth(); // Ensure user context is available
  const [prompts, setPrompts] = useState([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [pageError, setPageError] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(null); // To hold prompt data for editing

  const fetchPrompts = useCallback(async () => {
    if (!user) {
        setIsLoadingPrompts(false);
        setPrompts([]); // Clear prompts if no user
        return;
    }; // Don't fetch if user isn't loaded/logged in

    setIsLoadingPrompts(true);
    setPageError('');
    try {
      // Assuming DRF ViewSet with default pagination might return data in response.data.results
      // Or just response.data if not paginated or custom pagination
      const response = await apiClient.get('/prompts/');
      setPrompts(response.data.results || response.data);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setPageError('Failed to fetch prompts.');
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [user]); // Re-run when user changes (e.g., after login)

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handlePromptCreated = (newPrompt) => {
    setPrompts(prevPrompts => [newPrompt, ...prevPrompts]); // Add to top of list
  };

  const handlePromptUpdated = (updatedPrompt) => {
    setPrompts(prevPrompts => prevPrompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
    setEditingPrompt(null); // Clear editing state
  };

  const handleDeletePrompt = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await apiClient.delete(`/prompts/${promptId}/`);
        setPrompts(prevPrompts => prevPrompts.filter(p => p.id !== promptId));
      } catch (err) {
        console.error("Error deleting prompt:", err);
        setPageError('Failed to delete prompt.');
      }
    }
  };

  const handleCopyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Prompt copied to clipboard!'); // Replace with a nicer toast notification later
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy prompt.');
    }
  };


  if (isLoadingPrompts && !user) { // Check if auth is still loading too
    return <p className="text-center mt-8">Loading user data...</p>;
  }
  if (!user) {
      return <p className="text-center mt-8">Please log in to see your prompts.</p>;
  }


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">My Prompts</h2>

      {editingPrompt ? (
        <PromptForm
          existingPromptData={editingPrompt}
          onPromptUpdated={handlePromptUpdated}
          key={editingPrompt.id} // Add key to re-mount form when editingPrompt changes
        />
      ) : (
        <PromptForm onPromptCreated={handlePromptCreated} />
      )}


      {isLoadingPrompts && <p className="text-center">Loading prompts...</p>}
      {pageError && <p className="text-red-500 text-sm text-center">{pageError}</p>}

      {!isLoadingPrompts && prompts.length === 0 && (
        <p className="text-center text-gray-500">You haven't created any prompts yet.</p>
      )}

      {!isLoadingPrompts && prompts.length > 0 && (
        <ul className="space-y-4">
          {prompts.map(prompt => (
            <li key={prompt.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-indigo-700">{prompt.title}</h3>
              <pre className="text-gray-700 whitespace-pre-wrap mt-2 mb-3 bg-gray-50 p-3 rounded text-sm">{prompt.prompt_text}</pre>
              {/* Add tags and public status display later */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleCopyToClipboard(prompt.prompt_text)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded"
                >
                  Copy
                </button>
                <button
                  onClick={() => setEditingPrompt(prompt)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-1 px-3 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyPromptsPage;