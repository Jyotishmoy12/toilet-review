import { useState, useEffect } from "react";
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "../../firebase";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import Navbar from "../components/Navbar";
import AdminReviews from "../components/AdminReviews";

const AdminDashboard = () => {
  const [location, setLocation] = useState("");
  const [images, setImages] = useState({
    image1: null, // Thumbnail
    image2: null,
    image3: null
  });
  const [toilets, setToilets] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [currentToiletId, setCurrentToiletId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Get the base URL for QR codes (localhost in development, real domain in production)
  const getBaseUrl = () => {
    const base = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? `${window.location.protocol}//${window.location.host}`
      : "https://toilet-review-eta.vercel.app";
    console.log("Base URL:", base);
    return base;
  };
  
  
  useEffect(() => {
    fetchToilets();
  }, []);

  // Fetch toilets from Firestore
  const fetchToilets = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "toilets"));
      const toiletList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setToilets(toiletList);
    } catch (error) {
      console.error("Error fetching toilets:", error);
      alert("Failed to load toilets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Cloudinary
  const handleImageUpload = async (e, imageKey) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(imageKey);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      setImages({
        ...images,
        [imageKey]: response.data.secure_url
      });
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage("");
    }
  };

  // Add or update toilet in Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location || !images.image1) {
      alert("Please enter location and at least the first image (thumbnail).");
      return;
    }
  
    setLoading(true);
    try {
      // Prepare toilet data without the qrCode field initially
      const toiletData = { 
        location, 
        thumbnail: images.image1,
        images: {
          image1: images.image1,
          image2: images.image2 || "",
          image3: images.image3 || ""
        }
      };
  
      if (editMode && currentToiletId) {
        // Update existing toilet
        const toiletRef = doc(db, "toilets", currentToiletId);
        await updateDoc(toiletRef, toiletData);
        
        setToilets(toilets.map(toilet => 
          toilet.id === currentToiletId ? { ...toilet, ...toiletData } : toilet
        ));
        
        alert("Toilet updated successfully!");
      } else {
        // Add new toilet
        const docRef = await addDoc(collection(db, "toilets"), toiletData);
        
        // Generate the QR Code link using the Firestore document id
        const qrCodeLink = `${getBaseUrl()}/toilet/${docRef.id}`;
        
        // Update the newly created document with the qrCode field
        await updateDoc(doc(db, "toilets", docRef.id), { qrCode: qrCodeLink });
        
        // Add the new toilet with the qrCode to local state
        setToilets([...toilets, { id: docRef.id, ...toiletData, qrCode: qrCodeLink }]);
        
        alert("Toilet added successfully!");
      }
      
      resetForm();
      resetFileInputs();
      
    } catch (error) {
      console.error("Error saving toilet:", error);
      alert("Failed to save toilet. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  // Reset file input fields
  const resetFileInputs = () => {
    // Get all file inputs and reset them
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      input.value = "";
    });
  };

  // Delete toilet from Firestore
  const handleDelete = async (toiletId) => {
    if (!confirm("Are you sure you want to delete this toilet?")) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, "toilets", toiletId));
      setToilets(toilets.filter(toilet => toilet.id !== toiletId));
      alert("Toilet deleted successfully!");
    } catch (error) {
      console.error("Error deleting toilet:", error);
      alert("Failed to delete toilet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Set up edit mode
  const handleEdit = (toilet) => {
    setLocation(toilet.location);
    
    // Handle different data structures (for backward compatibility)
    if (toilet.images) {
      setImages({
        image1: toilet.images.image1 || toilet.thumbnail || toilet.image,
        image2: toilet.images.image2 || "",
        image3: toilet.images.image3 || ""
      });
    } else {
      setImages({
        image1: toilet.image || toilet.thumbnail,
        image2: "",
        image3: ""
      });
    }
    
    setCurrentToiletId(toilet.id);
    setEditMode(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset file inputs for fresh selection
    resetFileInputs();
  };

  // Reset form fields
  const resetForm = () => {
    setLocation("");
    setImages({
      image1: null,
      image2: null,
      image3: null
    });
    setCurrentToiletId(null);
    setEditMode(false);
  };

  // Download QR Code
  const downloadQR = (toilet) => {
    const canvas = document.getElementById(`qr-${toilet.id}`);
    if (!canvas) {
      console.error("QR canvas not found");
      return;
    }
    
    try {
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `qr-code-${toilet.location.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Failed to download QR code. Please try again.");
    }
  };

  // Filter toilets based on search query
  const filteredToilets = toilets.filter(toilet => 
    toilet.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to get the display image
  const getDisplayImage = (toilet) => {
    // Check for new data structure first
    if (toilet.images && toilet.images.image1) {
      return toilet.images.image1;
    }
    // Fall back to older data structures
    return toilet.thumbnail || toilet.image;
  };

  // Helper function to get all images for a toilet
  const getAllImages = (toilet) => {
    if (toilet.images) {
      return [
        toilet.images.image1,
        toilet.images.image2,
        toilet.images.image3
      ].filter(Boolean);
    }
    // Handle legacy data
    return [toilet.image || toilet.thumbnail].filter(Boolean);
  };

  // Render an image upload field with a unique ID for resetting
  const renderImageUploadField = (imageKey, label, isRequired = false) => {
    const inputId = `upload-${imageKey}-${currentToiletId || 'new'}`;
    
    return (
      <div className="mb-4 border p-3 rounded">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-gray-700 text-sm font-bold">
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>
          {imageKey === 'image1' && (
            <span className="text-blue-600 text-xs font-medium bg-blue-100 px-2 py-1 rounded">
              Thumbnail
            </span>
          )}
        </div>
        
        <input 
          id={inputId}
          type="file" 
          onChange={(e) => handleImageUpload(e, imageKey)} 
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
          required={isRequired}
        />
        
        {uploadingImage === imageKey ? (
          <div className="mt-2 text-sm text-blue-600">Uploading...</div>
        ) : images[imageKey] ? (
          <div className="mt-2">
            <img 
              src={images[imageKey]} 
              alt={`Preview ${imageKey}`} 
              className="w-32 h-32 object-cover rounded" 
            />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
    <Navbar/>
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {editMode ? "Edit Toilet" : "Admin Dashboard"}
      </h2>

      {/* Form */}
      <form id="toilet-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Location: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter toilet location"
            required
          />
        </div>

        <div className="mb-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Upload up to 3 images. The first image will be used as the thumbnail.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {renderImageUploadField('image1', 'Image 1', true)}
            {renderImageUploadField('image2', 'Image 2')}
            {renderImageUploadField('image3', 'Image 3')}
          </div>
        </div>

        <div className="flex space-x-2">
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-200"
            disabled={loading}
          >
            {loading ? "Processing..." : editMode ? "Update Toilet" : "Add Toilet"}
          </button>
          
          {editMode && (
            <button 
              type="button" 
              onClick={() => {
                resetForm();
                resetFileInputs();
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Search & Toilets List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Toilets List</h3>
          <div className="w-1/3">
            <input
              type="text"
              placeholder="Search toilets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {loading && toilets.length === 0 ? (
          <div className="text-center py-6">Loading toilets...</div>
        ) : filteredToilets.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            {searchQuery ? "No toilets match your search." : "No toilets added yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredToilets.map((toilet) => (
              <div key={toilet.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                <h4 className="text-lg font-bold mb-2">{toilet.location}</h4>
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {getAllImages(toilet).map((imgUrl, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <img 
                            src={imgUrl} 
                            alt={`Toilet image ${index + 1}`} 
                            className="w-24 h-24 object-cover rounded" 
                          />
                          {index === 0 && (
                            <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-bl rounded-tr">
                              Thumbnail
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                  <QRCodeCanvas 
  id={`qr-${toilet.id}`} 
  value={`${getBaseUrl()}/toilet/${toilet.id}`} 
  size={120}
  level="H"
  includeMargin={true}
/>

                    <div className="text-xs text-gray-500 mt-1">
                      {window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
                        ? "localhost version"
                        : "production version"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => downloadQR(toilet)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download QR
                  </button>
                  <button
                    onClick={() => handleEdit(toilet)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(toilet.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <AdminReviews/>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;