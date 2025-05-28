// src/components/PromptList.jsx
import React from 'react';
import PromptCard from './PromptCard'; // Import the new component

const PromptList = ({ prompts, isLoading, error, onEdit, onDelete, onCopy }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mb-6 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
        {error}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No prompts yet. You can create one using the form below.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 mb-8">
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
};

export default PromptList;