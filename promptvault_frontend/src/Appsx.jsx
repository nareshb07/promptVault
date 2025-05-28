import React from "react";
import InputFormModal from "./components/InputFormModal";
import { useState } from "react";
import PromptForm from "./components/PromptForm";
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handlePromptCreated = (newPrompt) => {
    console.log("✅ New prompt created:", newPrompt);
    closeModal();
  };

  const handlePromptUpdated = (updatedPrompt) => {
    console.log("📝 Prompt updated:", updatedPrompt);
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Test Prompt Form Modal</h1>
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition"
      >
        Open Prompt Form Modal
      </button>

      <InputFormModal isOpen={isModalOpen} onClose={closeModal}>
        <PromptForm
          onPromptCreated={handlePromptCreated}
          onPromptUpdated={handlePromptUpdated}
          existingPromptData={null} // or pass an object to edit
        />
      </InputFormModal>
    </div>
  );
}

export default App;
