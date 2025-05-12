import React from 'react';



const PromptCard = ({ prompt, onEdit, onDelete, onCopy }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    onCopy(prompt.prompt_text);
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
    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md pb-5">
      {/* Header */}
      <div className="flex justify-between items-center  bg-gray-300 dark:bg-gray-700 rounded-t-lg px-3 py-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{prompt.title}</h3>
        <div className="flex space-x-2">
          {/* Edit Button */}
         
          <button
            onClick={handleEdit}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
            className="text-red-500 hover:text-red-700"
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
  <div className="flex flex-wrap gap-1.5 px-3 pt-1">
    {prompt.tags.slice(0, 5).map((tag, index) => (
      <span
        key={index}
        className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full"
      >
        {typeof tag === 'object' ? tag.name : tag}
      </span>
    ))}
  </div>
)}

      {/* Content */}
      <div className="text-gray-700 ps-5 dark:text-gray-300 text-sm leading-relaxed">
        {prompt.prompt_text}
      </div>
    </div>
  );
};

export default PromptCard;