import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import AddHomeSlideModal from "./AddHomeSlideModal";

const HomeBannersList = () => {
  const [open, setOpen] = useState(false);
  const [banners, setBanners] = useState([
    {
      id: 1,
      src: "https://serviceapi.spicezgold.com/download/1751685144346_NewProject(11).jpg",
      alt: "Banner 1",
    },
    {
      id: 2,
      src: "https://serviceapi.spicezgold.com/download/1751685130717_NewProject(8).jpg",
      alt: "Banner 2",
    },
    {
      id: 3,
      src: "https://serviceapi.spicezgold.com/download/1748955932914_NewProject(1).jpg",
      alt: "Banner 3",
    },
  ]);

  const handleAddBanners = (newImages) => {
    const newBanners = newImages.map((image, index) => ({
      id: Date.now() + index,
      src: image.url,
      alt: `Uploaded Banner ${banners.length + index + 1}`,
      file: image.file,
    }));

    setBanners((prev) => [...prev, ...newBanners]);
  };

  const handleDeleteBanner = (bannerId) => {
    setBanners((prev) => {
      const bannerToDelete = prev.find((banner) => banner.id === bannerId);
      if (bannerToDelete && bannerToDelete.src.startsWith("blob:")) {
        URL.revokeObjectURL(bannerToDelete.src);
      }
      return prev.filter((banner) => banner.id !== bannerId);
    });
  };

  return (
    <div className="w-full pl-4 pr-2 py-5 min-w-0">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          Home Slider Banners ({banners.length})
        </h2>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow flex items-center transition-colors"
          type="button"
        >
          Add Home Slide
        </button>
      </div>

      {/* Banners Table/List Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {banners.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">No banners found.</p>
            <p className="text-gray-400 text-sm">
              Click "Add Home Slide" to upload your first banner.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {banners.map((banner, index) => (
              <div
                key={banner.id || index}
                className="flex flex-col md:flex-row md:items-center md:justify-between py-4 px-4 hover:bg-gray-50 transition-colors"
              >
                {/* Banner info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2">
                  <span className="text-sm md:text-base text-gray-500 font-medium min-w-[60px] shrink-0">
                    #{index + 1}
                  </span>
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    className="w-full sm:w-48 md:w-72 h-24 object-cover rounded-lg border shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>

                {/* Action Icons */}
                <div className="flex items-center gap-6 mt-3 md:mt-0 ml-0 md:ml-4 mr-0 md:mr-10">
                  <FaEdit
                    className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors"
                    title="Edit banner"
                    size={18}
                  />
                  <FaTrash
                    className="text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                    title="Delete banner"
                    size={18}
                    onClick={() => handleDeleteBanner(banner.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - Pass onAddBanners callback */}
      <AddHomeSlideModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onAddBanners={handleAddBanners}
      />
    </div>
  );
};

export default HomeBannersList;
