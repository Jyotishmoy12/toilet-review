import React from 'react';
import { MapPin, Star, Scan, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-gray-100 text-center px-6 py-16">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-100 rounded-full opacity-60 translate-x-1/3 translate-y-1/4"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center">
        {/* Left content */}
        <div className="md:w-3/5 md:text-left md:pr-8">
          <div className="inline-block bg-blue-100 text-blue-800 rounded-full px-4 py-1 text-sm font-medium mb-4">
            #1 Public Toilet Finder App
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight mb-4">
            Find & Review Public Toilets <span className="text-blue-600">Easily</span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mb-8">
            Scan QR codes, add reviews, and help make public restrooms cleaner for everyone.
            Never get caught in an emergency again.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-md flex items-center justify-center cursor-pointer" onClick={() => navigate('/toilets')}>
              <Search size={20} className="mr-2" />
              Find Toilets
            </button>
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition shadow-md flex items-center justify-center cursor-pointer" onClick={() => navigate('/toilets')}>
              <Star size={20} className="mr-2" />
              Add a Review
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-8 text-gray-700">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-blue-600">5,000+</span>
                <p className="text-gray-600">Toilets Reviewed</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-3">
                <Users size={20} className="text-green-600" />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold text-green-600">10,000+</span>
                <p className="text-gray-600">Happy Users</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right content - illustration */}
        <div className="md:w-2/5 mt-12 md:mt-0">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
            <div className="relative bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
              <div className="bg-gray-800 px-4 py-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="text-gray-400 text-xs flex-1 text-center">Toilet Finder App</div>
              </div>
              <div className="p-4">
                <div className="bg-gray-100 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-medium">Civil Engineering</div>
                    <div className="flex text-yellow-500">
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} fill="currentColor" />
                      <Star size={16} className="text-gray-300" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center mb-1">
                    <MapPin size={12} className="mr-1" /> 1km away
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Accessible</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Clean</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-lg flex items-center">
                    <MapPin size={14} className="mr-1" /> Directions
                  </button>
                  <button className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-lg flex items-center">
                    <Scan size={14} className="mr-1" /> Scan QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature highlights */}
      <div className="relative z-10 mt-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Find Nearby</h3>
            <p className="text-gray-600">Quickly locate clean restrooms around you with accurate directions.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Star size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Leave Reviews</h3>
            <p className="text-gray-600">Share your experience and help others find clean facilities.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Scan size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Scan QR Codes</h3>
            <p className="text-gray-600">Quickly access information and leave reviews with a simple scan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;