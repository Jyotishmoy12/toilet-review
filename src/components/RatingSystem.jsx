import { useState, useEffect } from "react";
import { db, doc, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, getAuth, onAuthStateChanged } from "../../firebase";
import { useNavigate } from "react-router-dom";

const RatingSystem = ({ toiletId }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [userRatingId, setUserRatingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isHoveringRating, setIsHoveringRating] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setCurrentUser(user);
      if (user) {
        checkUserRating(user.uid);
      } else {
        setHasRated(false);
        setUserRating(0);
        setUserComment("");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch all ratings for this toilet
  useEffect(() => {
    fetchRatings();
  }, [toiletId]);

  const fetchRatings = async () => {
    try {
      const ratingsRef = collection(db, "ratings");
      const q = query(ratingsRef, where("toiletId", "==", toiletId));
      const querySnapshot = await getDocs(q);
      
      const fetchedRatings = [];
      querySnapshot.forEach((doc) => {
        fetchedRatings.push({ id: doc.id, ...doc.data() });
      });
      
      setRatings(fetchedRatings);
      calculateAverageRating(fetchedRatings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      setError("Failed to load ratings");
    }
  };

  // Check if the current user has already rated this toilet
  const checkUserRating = async (userId) => {
    try {
      const ratingsRef = collection(db, "ratings");
      const q = query(
        ratingsRef, 
        where("toiletId", "==", toiletId), 
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userRatingDoc = querySnapshot.docs[0];
        const userRatingData = userRatingDoc.data();
        setHasRated(true);
        setUserRating(userRatingData.rating);
        setUserComment(userRatingData.comment || "");
        setUserRatingId(userRatingDoc.id);
      }
    } catch (error) {
      console.error("Error checking user rating:", error);
    }
  };

  // Calculate the average rating and update the toilet document
  const calculateAverageRating = async (ratingsArray) => {
    if (ratingsArray.length === 0) {
      setAverageRating(0);
      
      // Update the toilet document with 0 rating
      try {
        const toiletRef = doc(db, "toilets", toiletId);
        await updateDoc(toiletRef, {
          averageRating: 0,
          totalRatings: 0,
          lastRatingUpdate: serverTimestamp()
        });
      } catch (error) {
        console.error("Error updating toilet with zero ratings:", error);
      }
      
      return;
    }
    
    const sum = ratingsArray.reduce((total, rating) => total + rating.rating, 0);
    const avg = (sum / ratingsArray.length).toFixed(1);
    setAverageRating(avg);
    
    // Update the toilet document with the new average
    try {
      const toiletRef = doc(db, "toilets", toiletId);
      await updateDoc(toiletRef, {
        averageRating: parseFloat(avg),
        totalRatings: ratingsArray.length,
        lastRatingUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating toilet ratings:", error);
    }
  };

  // Submit a new rating or update existing rating
  const submitRating = async () => {
    if (!isAuthenticated) {
      navigate("/account", { state: { from: `/toilet/${toiletId}` } });
      return;
    }
    
    if (userRating === 0) {
      setError("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (hasRated) {
        // Update existing rating
        const ratingRef = doc(db, "ratings", userRatingId);
        await updateDoc(ratingRef, {
          rating: userRating,
          comment: userComment,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new rating
        await addDoc(collection(db, "ratings"), {
          toiletId,
          userId: currentUser.uid,
          userName: currentUser.displayName || "Anonymous",
          userEmail: currentUser.email,
          rating: userRating,
          comment: userComment,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Refresh ratings
      fetchRatings();
      setIsEditing(false);
      
      if (!hasRated) {
        setHasRated(true);
        checkUserRating(currentUser.uid);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setError("Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a rating
  const deleteRating = async () => {
    if (!userRatingId) return;
    
    if (confirm("Are you sure you want to delete your rating?")) {
      setIsSubmitting(true);
      try {
        await deleteDoc(doc(db, "ratings", userRatingId));
        setHasRated(false);
        setUserRating(0);
        setUserComment("");
        setUserRatingId(null);
        fetchRatings();
      } catch (error) {
        console.error("Error deleting rating:", error);
        setError("Failed to delete rating");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Ratings & Reviews</h2>
      
      {/* Average Rating */}
      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          <span className="text-3xl font-bold text-yellow-500 mr-2">{averageRating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg 
                key={star}
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-6 w-6 ${parseFloat(averageRating) >= star ? 'text-yellow-500' : 'text-gray-300'}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <span className="text-gray-600">({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})</span>
      </div>
      
      {/* User's Rating Form */}
      {isAuthenticated ? (
        hasRated && !isEditing ? (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Your Rating</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Edit
                </button>
                <button 
                  onClick={deleteRating}
                  className="text-red-500 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 ${userRating >= star ? 'text-yellow-500' : 'text-gray-300'}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {userComment && <p className="text-gray-700">{userComment}</p>}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-2">{hasRated ? 'Edit Your Rating' : 'Rate This Toilet'}</h3>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star}
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-8 w-8 cursor-pointer ${
                    isHoveringRating >= star 
                      ? 'text-yellow-500' 
                      : userRating >= star 
                        ? 'text-yellow-500' 
                        : 'text-gray-300'
                  }`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                  onMouseEnter={() => setIsHoveringRating(star)}
                  onMouseLeave={() => setIsHoveringRating(0)}
                  onClick={() => setUserRating(star)}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Share your experience (optional)"
              className="w-full p-2 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            {error && (
              <div className="text-red-500 mb-3 text-sm">{error}</div>
            )}
            <div className="flex justify-between">
              <button
                onClick={submitRating}
                disabled={isSubmitting || userRating === 0}
                className={`px-4 py-2 rounded-md ${
                  isSubmitting || userRating === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isSubmitting ? 'Submitting...' : hasRated ? 'Update Rating' : 'Submit Rating'}
              </button>
              {isEditing && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    checkUserRating(currentUser.uid);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-center">
          <p className="mb-3">Sign in to leave a review</p>
          <button
            onClick={() => navigate("/account", { state: { from: `/toilet/${toiletId}` } })}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Sign In
          </button>
        </div>
      )}
      
      {/* All Reviews */}
      <div>
        <h3 className="font-medium mb-3">All Reviews ({ratings.length})</h3>
        
        {ratings.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to leave a review!</p>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <div className="flex mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg 
                          key={star}
                          xmlns="http://www.w3.org/2000/svg" 
                          className={`h-5 w-5 ${rating.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`} 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="font-medium">{rating.userName}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {rating.createdAt?.toDate 
                      ? rating.createdAt.toDate().toLocaleDateString() 
                      : new Date().toLocaleDateString()}
                  </div>
                </div>
                {rating.comment && (
                  <p className="mt-2 text-gray-700">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingSystem;