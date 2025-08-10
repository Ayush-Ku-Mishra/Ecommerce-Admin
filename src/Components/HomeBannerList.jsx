import React, { useState } from 'react';
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin6Line } from "react-icons/ri";

const HomeBannerList = () => {
  const [banners, setBanners] = useState([
    {
      id: 1,
      image: 'https://serviceapi.spicezgold.com/download/1753859360822_1737020916820_New_Project_52.jpg',
      alt: 'Fashion banner'
    },
    {
      id: 2,
      image: 'https://serviceapi.spicezgold.com/download/1741663408792_1737020756772_New_Project_1.png',
      alt: 'Backpack banner'
    },
    {
      id: 3,
      image: 'https://serviceapi.spicezgold.com/download/1741664496923_1737020250515_New_Project_47.jpg',
      alt: 'Phone banner'
    }
  ]);

  const handleEdit = (id) => {
    console.log('Edit banner:', id);
    // Add edit functionality here
  };

  const handleDelete = (id) => {
    setBanners(banners.filter(banner => banner.id !== id));
  };

  const handleAddBanner = () => {
    console.log('Add new banner');
    // Add new banner functionality here
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Banners List</h1>
          <button
            onClick={handleAddBanner}
            className="bg-blue-600 hover:bg-blue-700 text-xs md:text-sm text-white px-3 md:px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            ADD BANNER
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-100 px-6 py-4 font-medium text-gray-700 text-sm uppercase tracking-wide">
            <div>IMAGE</div>
            <div className="text-right">Action</div>
          </div>

          {/* Banner Items */}
          <div className="divide-y divide-gray-200">
            {banners.map((banner) => (
              <div key={banner.id} className="grid grid-cols-2 px-5 py-4 items-center hover:bg-gray-50 transition-colors duration-150">
                {/* Image Column */}
                <div className="flex items-center">
                  <div className="md:w-48 md:h-32 w-32 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={banner.image}
                      alt={banner.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Action Column */}
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleEdit(banner.id)}
                    className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    title="Edit banner"
                  >
                    <CiEdit size={19} />
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Delete banner"
                  >
                    <RiDeleteBin6Line size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {banners.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="text-lg font-medium mb-2">No banners found</div>
              <div className="text-sm">Click "ADD BANNER" to create your first banner.</div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        {banners.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {banners.length} banner{banners.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBannerList;