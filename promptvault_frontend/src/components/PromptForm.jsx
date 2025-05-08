// src/components/PromptForm.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api'; // Adjust path if needed
import CreatableSelect from 'react-select/creatable'; // We'll use this soon
import ToggleSwitch from './ToggleSwitch'; // Import the new component

const PromptForm = ({ onPromptCreated, existingPromptData = null, onPromptUpdated }) => {
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); 
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(existingPromptData);

  // Fetch tags for suggestions (copied from previous PromptForm logic)
  useEffect(() => {
    const fetchTagsForSuggestions = async () => {
      try {
        const response = await apiClient.get('/tags/');
        setTagSuggestions(response.data.map(tag => ({ value: tag.name, label: tag.name })));
      } catch (error) {
        console.error("Failed to fetch tag suggestions:", error);
      }
    };
    fetchTagsForSuggestions();
  }, []);

  // Populate form if editing (copied from previous PromptForm logic)
  useEffect(() => {
    if (existingPromptData) {
      setTitle(existingPromptData.title || '');
      setPromptText(existingPromptData.prompt_text || '');
      setSelectedTags(
        existingPromptData.tags?.map(tag => ({ 
          value: typeof tag === 'object' ? tag.name : tag,
          label: typeof tag === 'object' ? tag.name : tag 
        })) || []
      );
      setIsPublic(existingPromptData.is_public || false);
    } else {
      setTitle('');
      setPromptText('');
      setSelectedTags([]);
      setIsPublic(false);
    }
  }, [existingPromptData]);

  const handleTagChange = (currentSelectedOptions) => {
    setSelectedTags(currentSelectedOptions || []);
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
      tag_names: selectedTags.map(tag => tag.value), 
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
        setSelectedTags([]);
        setIsPublic(false);
      }
    } catch (err) {
      console.error("Error saving prompt:", err.response?.data || err.message);
      setFormError(`Failed to save prompt: ${JSON.stringify(err.response?.data) || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Custom styles for react-select (copied from previous version)
  const customSelectStyles = { /* ... your dark theme styles for react-select ... */ 
    control: (provided, state) => ({ /* ... */ }),
    // ... all other style functions
  };


  // JSX for the form (copied from previous version, now using CreatableSelect)
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
          id="tags-creatable-select"
          isMulti
          options={tagSuggestions}
          value={selectedTags}
          onChange={handleTagChange}
          placeholder="Type to search or create new tags..."
          className="mt-1 text-white"
          styles={customSelectStyles}
          formatCreateLabel={inputValue => `Create "${inputValue}"`}
        />
      </div>

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
        {/* ... submit button content ... */}
        {isSubmitting ? 'Saving...' : (isEditing ? 'Update Prompt' : 'Create Prompt')}
      </button>

      {formError && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-md text-red-200 text-sm">
          {formError}
        </div>
      )}
    </form>
  );
};

export default PromptForm;