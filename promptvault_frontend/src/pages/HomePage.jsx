// src/pages/HomePage.js

import React from 'react';
import TrendingPrompts from '../components/TrendingPrompts';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10">
      <div className="container mx-auto px-4">
        <TrendingPrompts />
      </div>
    </div>
  );
};

export default HomePage;