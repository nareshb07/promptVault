import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../AuthContext';
import CreatableSelect from 'react-select/creatable';

// Toggle Switch Component
const ToggleSwitch = ({ isOn, handleToggle, label }) => {
  return (
    <div className="flex items-center">
      <span className="mr-3 text-sm font-medium text-gray-300">{label}</span>
      <button
        type="button"
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isOn ? 'bg-indigo-600' : 'bg-gray-600'}`}
        onClick={handleToggle}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );
};

// Prompt Form Component
const PromptForm = ({ onPromptCreated, existingPromptData = null, onPromptUpdated }) => {
  const [title, setTitle] = useState(existingPromptData?.title || '');
  const [promptText, setPromptText] = useState(existingPromptData?.prompt_text || '');
  const [selectedTags, setSelectedTags] = useState([]); 
  const [tagSuggestions, setTagSuggestions] = useState([]); // To store fetched tag 
  const [isPublic, setIsPublic] = useState(existingPromptData?.is_public || false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(existingPromptData);

  useEffect(() => {
    const fetchTagsForSuggestions = async () => {
      try {
        const response = await apiClient.get('/tags/'); // Your API endpoint for listing all tags
        setTagSuggestions(response.data.map(tag => ({ value: tag.name, label: tag.name })));
      } catch (error) {
        console.error("Failed to fetch tag suggestions:", error);
        // Not critical if this fails, just means no suggestions
      }
    };
    fetchTagsForSuggestions();
  }, []);

  useEffect(() => {
    if (existingPromptData) {
      setTitle(existingPromptData.title);
      setPromptText(existingPromptData.prompt_text);
      setSelectedTags(
        existingPromptData.tags?.map(tag => ({ 
          value: typeof tag === 'object' ? tag.name : tag, // Handle if tags are already objects or just names
          label: typeof tag === 'object' ? tag.name : tag 
        })) || []
      );
      setIsPublic(existingPromptData.is_public || false);
    } else {
      setTitle('');
      setPromptText('');
      setSelectedTags([])
      setIsPublic(false);
    }
  }, [existingPromptData]);

  const handleTagChange = (currentSelectedOptions) => { // <<<<<< 5. HANDLER FOR REACT-SELECT
    setSelectedTags(currentSelectedOptions || []); // currentSelectedOptions can be null
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !promptText.trim()) {
      setFormError('Title and Prompt Text are required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const promptData = {
      title,
      prompt_text: promptText,
      tag_names:  selectedTags.map(tag => tag.value), 
      is_public: isPublic,
    };

    try {
      let response;
      if (isEditing) {
        response = await apiClient.put(`/prompts/${existingPromptData.id}/`, promptData);
        if (onPromptUpdated) onPromptUpdated(response.data);
      } else {
        response = await apiClient.post('/prompts/', promptData);
        if (onPromptCreated) onPromptCreated(response.data);
      }

      if (!isEditing) {
        setTitle('');
        setPromptText('');
        setSelectedTags([]); // Reset selectedTags state
        setIsPublic(false);
      }
    } catch (err) {
      console.error("Error saving prompt:", err.response?.data || err.message);
      setFormError(`Failed to save prompt: ${JSON.stringify(err.response?.data) || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#374151', // bg-gray-700
      borderColor: state.isFocused ? '#4f46e5' : '#4B5563', // border-indigo-500 on focus, else border-gray-600
      boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none', // Ring on focus
      '&:hover': {
        borderColor: '#6B7280', // border-gray-500
      },
      color: 'white',
      borderRadius: '0.375rem', // rounded-md
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#374151', // bg-gray-700
      color: 'white',
      borderRadius: '0.375rem', // rounded-md
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#4B5563' : '#374151', // bg-indigo-600 selected, bg-gray-600 focused
      color: 'white',
      '&:active': {
        backgroundColor: '#4338ca', // bg-indigo-700
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#4f46e5', // bg-indigo-600 for tag pills
      borderRadius: '0.25rem', // rounded-sm
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
      fontSize: '0.875rem', // text-sm
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#e5e7eb', // text-gray-200
      '&:hover': {
        backgroundColor: '#4338ca', // bg-indigo-700
        color: 'white',
      },
    }),
    input: (provided) => ({
      ...provided,
      color: 'white', // Text color of the input field itself
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#9CA3AF', // text-gray-400 (placeholder color)
    }),
    singleValue: (provided) => ({ // Though we use multi, good to have
        ...provided,
        color: 'white',
    }),
  }; 

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-white">
        {isEditing ? "✏️ Edit Prompt" : "✨ Create New Prompt"}
      </h3>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title</label>
        <input
          type="text"
          id="title"
          placeholder="Prompt Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="promptText" className="block text-sm font-medium text-gray-300 mb-1">Prompt Text</label>
        <textarea
          id="promptText"
          placeholder="Enter your prompt here..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          required
          rows="4"
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

<div>
        <label htmlFor="tags-creatable-select" className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
        <CreatableSelect
          id="tags-creatable-select" // Ensure unique ID if 'tags' is used elsewhere
          isMulti // Allow multiple tags
          options={tagSuggestions} // Suggestions from existing tags
          value={selectedTags}
          onChange={handleTagChange}
          placeholder="Type to search or create new tags..."
          className="mt-1 text-white" // Basic class, specific styling via 'styles' prop
          styles={customSelectStyles} // Apply custom dark theme styles
          formatCreateLabel={inputValue => `Create "${inputValue}"`} // Customize "Create new" text
          // You can also add onCreateOption to handle new tag creation immediately if needed,
          // but CreatableSelect handles adding it to selectedTags by default.
        />
      </div>
      {/* <<<<<< END TAGS INPUT REPLACEMENT */}

      <ToggleSwitch isOn={isPublic} handleToggle={() => setIsPublic(!isPublic)} label={isPublic ? "Public" : "Private"} />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
          isSubmitting
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isEditing ? 'Updating...' : 'Creating...'}
          </span>
        ) : isEditing ? 'Update Prompt' : 'Create Prompt'}
      </button>

      {formError && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
          {formError}
        </div>
      )}
    </form>
  );
};

// Prompt Card Component
const PromptCard = ({ prompt, onEdit, onDelete, onCopy }) => {
  return (
    <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 hover:border-indigo-500 transition-all shadow-lg">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-white mb-2">{prompt.title}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${prompt.is_public ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-300'}`}>
          {prompt.is_public ? 'Public' : 'Private'}
        </span>
      </div>

      <pre className="text-gray-300 whitespace-pre-wrap my-3 bg-gray-900/50 p-3 rounded-lg text-sm font-mono border border-gray-700">
        {prompt.prompt_text}
      </pre>

      {prompt.tags && prompt.tags.length > 0 && (
        <div className="mt-2 mb-3 flex flex-wrap gap-2">
          {prompt.tags.map(tag => (
            <span key={tag.id} className="inline-block bg-gray-700 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-indigo-900/50 transition-colors">
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={() => onCopy(prompt.prompt_text)}
          className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy
        </button>
        <button
          onClick={() => onEdit(prompt)}
          className="flex items-center gap-1 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </button>
        <button
          onClick={() => onDelete(prompt.id)}
          className="flex items-center gap-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

// Main MyPromptsPage Component
const MyPromptsPage = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [pageError, setPageError] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(null);

  const fetchPrompts = useCallback(async () => {
    if (!user) {
      setIsLoadingPrompts(false);
      setPrompts([]);
      return;
    }

    setIsLoadingPrompts(true);
    setPageError('');

    try {
      const response = await apiClient.get('/prompts/');
      setPrompts(response.data.results || response.data);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setPageError('Failed to fetch prompts. Please try again later.');
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handlePromptCreated = (newPrompt) => {
    setPrompts(prevPrompts => [newPrompt, ...prevPrompts]);
  };

  const handlePromptUpdated = (updatedPrompt) => {
    setPrompts(prevPrompts =>
      prevPrompts.map(p => (p.id === updatedPrompt.id ? updatedPrompt : p))
    );
    setEditingPrompt(null);
  };

  const handleDeletePrompt = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
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
      alert('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text:', err);
      alert('Failed to copy prompt.');
    }
  };

  if (isLoadingPrompts && !user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-full"></div>
          <span>Loading user data...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-xl max-w-md mx-auto border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">🔒 Access Restricted</h2>
          <p className="text-gray-300 mb-6">Please log in to view and manage your prompts.</p>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-6">
          My Prompts
        </h1>

        {/* Show Prompt List First */}
        {isLoadingPrompts && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {pageError && (
          <div className="p-4 mb-6 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
            {pageError}
          </div>
        )}

        {!isLoadingPrompts && prompts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No prompts yet. Create one below.</p>
          </div>
        )}

        {!isLoadingPrompts && prompts.length > 0 && (
          <div className="grid gap-6 mb-8">
            {prompts.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={setEditingPrompt}
                onDelete={handleDeletePrompt}
                onCopy={handleCopyToClipboard}
              />
            ))}
          </div>
        )}

        {/* Place Form Below the List */}
        {editingPrompt ? (
          <PromptForm
            existingPromptData={editingPrompt}
            onPromptUpdated={handlePromptUpdated}
            key={editingPrompt.id}
          />
        ) : (
          <PromptForm onPromptCreated={handlePromptCreated} />
        )}
      </div>
    </div>
  );
};

export default MyPromptsPage;