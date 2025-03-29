import React, { useState } from 'react';
import AdminReviews from '../components/AdminReviews';
import ToiletAdd from '../components/ToiletAdd';
import Navbar from '../components/Navbar';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('toiletAdd');

  return (
    <>
    <Navbar />
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex border-b mb-4">
        <button
          className={`flex-1 p-2 text-center ${activeTab === 'toiletAdd' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('toiletAdd')}
        >
          Add Toilet
        </button>
        <button
          className={`flex-1 p-2 text-center ${activeTab === 'adminReviews' ? 'border-b-2 border-blue-500 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('adminReviews')}
        >
          Admin Reviews
        </button>
      </div>

      <div>
        {activeTab === 'toiletAdd' && <ToiletAdd />}
        {activeTab === 'adminReviews' && <AdminReviews />}
      </div>
    </div>
    </>
  );
};

export default Admin;