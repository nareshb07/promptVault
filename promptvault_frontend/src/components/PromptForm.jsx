import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';
import apiClient from '../services/api';

const getRandomColor = () => {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const PromptForm = ({ promptToEdit = null, existingPromptData = null, onPromptCreated, onPromptUpdated }) => {
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const isEditing = Boolean(existingPromptData);

  // ✅ Reusable fetchTags function
  const fetchTags = async () => {
    try {
      const response = await apiClient.get('/tags/');
      setAvailableTags(response.data.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: getRandomColor()
      })));
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  useEffect(() => {
    fetchTags(); // Initial fetch
  }, []);

  useEffect(() => {
    if (existingPromptData) {
      setTitle(existingPromptData.title || '');
      setPromptText(existingPromptData.prompt_text || '');
      setSelectedTags(
        (existingPromptData.tags || []).map(tag => ({
          id: typeof tag === 'object' ? tag.id : null,
          name: typeof tag === 'object' ? tag.name : tag,
          color: getRandomColor()
        }))
      );
      setIsPublic(existingPromptData.is_public || false);
    }
  }, [existingPromptData]);

  const resetForm = () => {
    setTitle('');
    setPromptText('');
    setSelectedTags([]);
    setIsPublic(false);
    setNewTagName('');
    setShowTagInput(false);
    setFormError('');
  };

  const handleTagClick = (tag) => {
    setSelectedTags((prevSelected) => {
      const isSelected = prevSelected.some(t => t.name === tag.name);
      if (isSelected) {
        const newSelected = prevSelected.filter(t => t.name !== tag.name);
        setAvailableTags(prev => [...prev, tag]);
        return newSelected;
      } else {
        setAvailableTags(prev => prev.filter(t => t.name !== tag.name));
        return [...prevSelected, tag];
      }
    });
  };

  const handleAddNewTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const response = await apiClient.post('/tags/', { name: newTagName });
      const newTag = {
        id: response.data.id,
        name: response.data.name,
        color: getRandomColor()
      };
      setSelectedTags(prev => [...prev, newTag]);
      setNewTagName('');
      setShowTagInput(false);

      // ✅ Refresh availableTags to include new one
      await fetchTags();

    } catch (err) {
      console.error("Failed to create tag:", err);
      setFormError('Failed to add new tag');
    }
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
      tag_names: selectedTags.map(tag => tag.name),
      is_public: isPublic,
    };

    try {
      let response;
      if (isEditing) {
        response = await apiClient.put(`/prompts/${existingPromptData.id}/`, promptData);
        onPromptUpdated?.(response.data); // Pass updated prompt back
      } else {
        response = await apiClient.post('/prompts/', promptData);
        onPromptCreated?.(response.data); // Pass new prompt back
      }
    } catch (err) {
      console.error("Error saving prompt:", err);
      setFormError(err.response?.data?.message || 'Failed to save prompt');
    } finally {
      setIsSubmitting(false);
    }

    resetForm(); // ✅ Always reset after submit
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto my-6 space-y-4 text-sm">
      
      {/* Title */}
      <div>
        <label htmlFor="title" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Prompt Title"
          className="w-full px-3 py-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500 dark:text-white"
        />
      </div>

      {/* Prompt Text */}
      <div>
        <label htmlFor="promptText" className="block font-medium text-gray-700 dark:text-gray-300 mb-1">Prompt Text *</label>
        <textarea
          id="promptText"
          rows="5"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Enter your prompt here..."
          className="w-full px-3 py-2 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-indigo-500 dark:text-white"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
        
        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedTags.map(tag => (
              <span
                key={tag.name}
                className={`${tag.color} text-white px-2.5 py-0.5 rounded-full text-xs cursor-pointer hover:opacity-80`}
                onClick={() => handleTagClick(tag)}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Available Tags */}
        {availableTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {availableTags.map(tag => (
              <span
                key={tag.name}
                className="cursor-pointer text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-2.5 py-0.5 rounded-full text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleTagClick(tag)}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Add New Tag */}
        {showTagInput ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              placeholder="New tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 px-2 py-1 bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddNewTag}
              className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowTagInput(false)}
              className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowTagInput(true)}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + Add new tag
          </button>
        )}
      </div>

      {/* Public/Private Toggle */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
        <span className="text-gray-700 dark:text-gray-300 text-sm">Visibility:</span>
        <ToggleSwitch 
          isOn={isPublic} 
          handleToggle={() => setIsPublic(!isPublic)} 
          label={<span className="text-sm">{isPublic ? "Public" : "Private"}</span>} 
        />
      </div>

      {/* Submit Button */}
      <div className="pt-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Prompt' : 'Create Prompt'}
        </button>
      </div>

      {/* Error Message */}
      {formError && (
        <p className="text-red-500 text-xs">{formError}</p>
      )}
    </form>
  );
};

export default PromptForm;