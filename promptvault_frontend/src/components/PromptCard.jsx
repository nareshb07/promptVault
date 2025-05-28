import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PromptCard = ({ prompt, onEdit, onDelete, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy(prompt.prompt_text);
    toast.info("📋 Copied to clipboard", { autoClose: 1000 });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(prompt);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(prompt.id);
  };

  return (
    <div className="opacity-0 animate-fadeInUp"
         style={{ animation: 'fadeInUp 0.5s ease-out forwards' }}>
      <div className="bg-slate-900/30 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-md hover:border-gray-600 transition-all group">
        {/* Header */}
        <div className="flex justify-between items-center bg-slate-800 rounded-t-2xl px-4 py-3">
          <h3 className="text-lg font-semibold text-white">{prompt.title}</h3>
          <div className="flex space-x-2">
            {/* Edit Button */}
            <button
              onClick={handleEdit}
              className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-full transition"
              aria-label="Edit prompt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-800 rounded-full transition"
              aria-label="Copy prompt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-full transition"
              aria-label="Delete prompt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-2 pb-1">
            {prompt.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-indigo-900/50 text-indigo-300 border border-indigo-700 rounded-full"
              >
                #{typeof tag === 'object' ? tag.name : tag}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="px-4 pt-2 pb-4">
          <p className="text-sm text-gray-300 font-mono italic whitespace-pre-line line-clamp-4 sm:line-clamp-none">
            {isExpanded
              ? prompt.prompt_text
              : prompt.prompt_text.length > 150
                ? `${prompt.prompt_text.slice(0, 150)}...`
                : prompt.prompt_text}
          </p>
          {prompt.prompt_text.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 underline"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptCard;

// Optional: Define animation in global CSS or use Tailwind plugin

