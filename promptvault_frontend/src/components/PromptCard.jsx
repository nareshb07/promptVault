// src/components/PromptCard.jsx
import React from 'react';

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
          {/* SVG for Copy */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
          Copy
        </button>
        <button
          onClick={() => onEdit(prompt)}
          className="flex items-center gap-1 bg-indigo-900/50 hover:bg-indigo-800 text-indigo-200 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
        >
          {/* SVG for Edit */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Edit
        </button>
        <button
          onClick={() => onDelete(prompt.id)}
          className="flex items-center gap-1 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
        >
          {/* SVG for Delete */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default PromptCard;