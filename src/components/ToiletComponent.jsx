import { useState, useEffect } from "react";
import { db, collection, getDocs } from "../../firebase";
import { Link } from "react-router-dom";


const ToiletComponent = () => {
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchToilets();
  }, []);

  // Fetch toilets from Firestore
  const fetchToilets = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "toilets"));
      const toiletList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setToilets(toiletList);
    } catch (error) {
      console.error("Error fetching toilets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get the thumbnail image
  const getThumbnail = (toilet) => {
    // Check for new data structure first
    if (toilet.images && toilet.images.image1) {
      return toilet.images.image1;
    }
    // Fall back to older data structures
    return toilet.thumbnail || toilet.image;
  };

  // Filter toilets based on search query
  const filteredToilets = toilets.filter(toilet => 
    toilet.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
     
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Find a Toilet</h1>
          <div className="w-1/3">
            <input
              type="text"
              placeholder="Search toilets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredToilets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No toilets found</h3>
            <p className="mt-1 text-gray-500">
              {searchQuery ? "Try a different search term." : "No toilets have been added yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredToilets.map((toilet) => (
              <Link 
                to={`/toilet/${toilet.id}`} 
                key={toilet.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48">
                  <img 
                    src={getThumbnail(toilet)} 
                    alt={toilet.location}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-toilet.jpg"; // Fallback image
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-bold text-lg mb-1 text-gray-800">{toilet.location}</h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {toilet.location}
                  </div>
                  <button className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition duration-200">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ToiletComponent;