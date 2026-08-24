// components/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Summer Sale!
              <span className="block text-yellow-300">Up to 70% Off</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-6">
              Discover amazing deals on premium products. Limited time offer - shop now!
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors transform hover:scale-105">
                Shop Now
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div>
                <p className="text-2xl font-bold">10K+</p>
                <p className="text-sm text-blue-100">Products</p>
              </div>
              <div>
                <p className="text-2xl font-bold">50K+</p>
                <p className="text-sm text-blue-100">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.8★</p>
                <p className="text-sm text-blue-100">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Image/Illustration */}
          <div className="hidden md:block relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-transparent rounded-full opacity-20"></div>
            <img 
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&h=400&fit=crop"
              alt="Shopping"
              className="rounded-lg shadow-2xl"
            />
            {/* Floating Badge */}
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-xl p-4 animate-bounce">
              <p className="text-sm font-semibold text-gray-800">🔥 Hot Deal</p>
              <p className="text-xs text-gray-500">Limited Stock</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;