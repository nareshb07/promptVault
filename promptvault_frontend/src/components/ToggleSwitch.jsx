// src/components/ToggleSwitch.jsx
import React from 'react';

const ToggleSwitch = ({ isOn, handleToggle, label }) => {
  return (
    <div className="flex items-center">
      <span className="mr-3 text-sm font-medium text-gray-300">{label}</span> {/* Adjusted for dark theme */}
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

export default ToggleSwitch;