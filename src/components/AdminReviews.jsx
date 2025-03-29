import { useEffect, useState } from "react";
import { db, collection, getDocs, query, orderBy, deleteDoc, doc } from "../../firebase";
import { useAuth } from "../context/AuthContext";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the current user
  const adminEmail = "subedi@gmail.com";

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const ratingsRef = collection(db, "ratings");
        const q = query(ratingsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const reviewsData = querySnapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        setReviews(reviewsData);
      } catch (e) {
        console.error("Error fetching reviews:", e);
        setError("Error fetching reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteDoc(doc(db, "ratings", reviewId));
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
    } catch (e) {
      console.error("Error deleting review:", e);
      setError("Error deleting review.");
    }
  };

  if (loading) {
    return <div className="p-4 text-center"><p>Loading reviews...</p></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500"><p>{error}</p></div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">All Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center">No reviews available.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 shadow-md hover:shadow-lg transition duration-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-semibold">{review.userName} ({review.userEmail})</p>
                  <p className="text-sm text-gray-500">{review.createdAt?.toDate ? review.createdAt.toDate().toLocaleString() : "Unknown date"}</p>
                </div>
                {user?.email === adminEmail && (
                  <button 
                    onClick={() => handleDelete(review.id)}
                    className="text-red-500 text-sm hover:underline hover:text-red-700 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${review.rating >= star ? "text-yellow-500" : "text-gray-300"}`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              {review.comment && <p className="text-gray-700 mt-2">{review.comment}</p>}
              <p className="text-sm text-gray-500 mt-1">Toilet ID: <span className="font-mono text-blue-600">{review.toiletId}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
