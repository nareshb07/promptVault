import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import apiClient from '../services/api';

import PromptCard from '../components/PromptCard';
import Pagination from '../components/Pagination';
import DeleteModal from '../components/DeleteModal'; // Modal already imported

import PromptForm from '../components/PromptForm';
import { FiPlus } from 'react-icons/fi'; // Example: Plus icon from Feather Icons
import EditModal from '../components/EditModal';

const MyPromptsPage = () => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [promptIdToDelete, setPromptIdToDelete] = useState(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const fetchPrompts = useCallback(async (page = 1) => {
    if (!user) {
      setIsLoading(false);
      setPrompts([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.get(`/prompts/?page=${page}`);
      setPrompts(response.data.results || []);
      const totalPages = Math.ceil(response.data.count / 5);
      setTotalPages(totalPages);
    } catch (err) {
      console.error("Error fetching prompts:", err);
      setError('Failed to fetch prompts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPrompts(currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchPrompts, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePromptCreated = (newPrompt) => {
    setPrompts(prev => [newPrompt, ...prev]);
    setCurrentPage(1); // Reset to first page when new prompt is created
  };

  const handlePromptUpdated = (updatedPrompt) => {
    setPrompts(prevPrompts =>
      prevPrompts.map(prompt =>
        prompt.id === updatedPrompt.id ? updatedPrompt : prompt
      )
    );
    setEditingPrompt(null); // Close modal/form
  };
  const handleRequestDeletePrompt = (promptId) => {
    setPromptIdToDelete(promptId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePrompt = async () => {
    try {
      await apiClient.delete(`/prompts/${promptIdToDelete}/`);
      setPrompts(prev => {
        const updatedPrompts = prev.filter(p => p.id !== promptIdToDelete);
        if (updatedPrompts.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
        return updatedPrompts;
      });
    } catch (err) {
      console.error("Error deleting prompt:", err);
      setError('Failed to delete prompt.');
    } finally {
      setIsDeleteModalOpen(false);
      setPromptIdToDelete(null);
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

  const filteredPrompts = prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center p-6 bg-gray-800 rounded-xl max-w-md mx-auto border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">🔒 Access Restricted</h2>
          <p className="text-gray-300 mb-6">Please log in to view and manage your prompts.</p>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            My Prompts
          </h1>
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <svg className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {filteredPrompts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No matching prompts found' : 'No prompts yet. Create one below.'}
              </div>
            ) : (
              <div className="grid gap-6 mb-8">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={setEditingPrompt}
                    onDelete={() => handleRequestDeletePrompt(prompt.id)}
                    onCopy={handleCopyToClipboard}
                  />
                ))}
              </div>
            )}

              {
              totalPages > 1 && 
              (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
          </>
        )}

          <div className="fixed bottom-6 right-40 z-50">
            <button
              onClick={() => setIsFormVisible(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transform transition-transform hover:scale-105 focus:outline-none"
              aria-label="Create new prompt"
            >
              <FiPlus className="w-5 h-5" />
              {/* <span className="font-medium">Add New Prompt</span> */}
            </button>

          </div>
        

          <EditModal isOpen={isFormVisible} onClose={() => setIsFormVisible(false)}>
              <div className="max-h-[80vh] overflow-y-auto pr-2">
                <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-2">
                  {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
                </h2>
                <PromptForm
                  onPromptCreated={(newPrompt) => {
                    handlePromptCreated(newPrompt);
                    setIsFormVisible(false);
                  }}
                  existingPromptData={editingPrompt}
                  onPromptUpdated={(updatedPrompt) => {
                    handlePromptUpdated(updatedPrompt);
                    setIsFormVisible(false);
                  }}
                />
              </div>
            </EditModal>


        <EditModal isOpen={!!editingPrompt} onClose={() => setEditingPrompt(null)}>
          {editingPrompt && (
            <PromptForm
            existingPromptData={editingPrompt}
              onPromptUpdated={handlePromptUpdated}
              onCancel={() => setEditingPrompt(null)}
            />
          )}
        </EditModal>  

          

{/* {isFormVisible && (
  editingPrompt ? (
    <PromptForm
      promptToEdit={editingPrompt}
      onPromptUpdated={handlePromptUpdated}
      onCancel={() => setEditingPrompt(null)}
      key={editingPrompt.id}
    />
  ) : (
    <PromptForm
      onPromptCreated={handlePromptCreated}
    />
  )
)} */}
      </div>

      {/* Modal for delete confirmation */}
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Are you sure?</h2>
          <p className="text-gray-400 mb-6">This action will permanently delete the prompt.</p>
          <div className="flex justify-center gap-4">
          <button
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              onClick={confirmDeletePrompt}
            >
              Delete
            </button>
            
          </div>
        </div>
      </DeleteModal>
    </div>
  );
};

export default MyPromptsPage;
