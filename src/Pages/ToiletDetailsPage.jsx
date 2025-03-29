import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { db, doc, getDoc } from "../../firebase";
import Navbar from "../components/Navbar";
import RatingSystem from "../components/RatingSystem";

const ToiletDetailsPage = () => {
    const { id } = useParams();
    const [toilet, setToilet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchToiletDetails();
    }, [id]);

    const fetchToiletDetails = async () => {
        try {
            const toiletRef = doc(db, "toilets", id);
            const toiletSnap = await getDoc(toiletRef);

            if (toiletSnap.exists()) {
                setToilet({ id: toiletSnap.id, ...toiletSnap.data() });
            } else {
                setError("Toilet not found");
            }
        } catch (error) {
            console.error("Error fetching toilet details:", error);
            setError("Failed to load toilet details");
        } finally {
            setLoading(false);
        }
    };

    const getAllImages = (toilet) => {
        if (!toilet) return [];
        if (toilet.images) {
            return [
                toilet.images.image1,
                toilet.images.image2,
                toilet.images.image3,
            ].filter(Boolean);
        }
        return [toilet.image || toilet.thumbnail].filter(Boolean);
    };

    const images = toilet ? getAllImages(toilet) : [];

    const goToNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToPrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const selectImage = (index) => {
        setCurrentImageIndex(index);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex justify-center items-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="max-w-4xl mx-auto p-6 text-center">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <div className="flex items-center justify-center">
                            <svg
                                className="h-6 w-6 text-red-500 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="md:flex">
                        {/* Image Gallery */}
                        <div className="md:w-2/3">
                            {images.length > 0 ? (
                                <div className="relative">
                                    <div className="relative h-60 md:h-80">
                                        <img
                                            src={images[currentImageIndex]}
                                            alt={`Toilet at ${toilet.location}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={goToPrevImage}
                                                    className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r hover:bg-opacity-70"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={goToNextImage}
                                                    className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l hover:bg-opacity-70"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                                            {currentImageIndex + 1} / {images.length}
                                        </div>
                                    </div>
                                    {images.length > 1 && (
                                        <div className="flex gap-2 p-2 bg-gray-100 overflow-x-auto">
                                            {images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className={`cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'} rounded`}
                                                    onClick={() => selectImage(index)}
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        className="h-16 w-16 object-cover rounded"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-60 bg-gray-200 flex items-center justify-center">
                                    <p className="text-gray-500">No images available</p>
                                </div>
                            )}
                        </div>
                        {/* Toilet Information */}
                        <div className="md:w-1/3 p-6 flex flex-col justify-between">
                            <div>
                                <h1 className="text-2xl font-bold mb-4">{toilet.location}</h1>
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold mb-1">Location Details</h3>
                                    <div className="flex items-center text-gray-700">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{toilet.location}</span>
                                    </div>
                                </div>
                                {(toilet.totalRatings && toilet.totalRatings > 0) ? (
                                    // If there is at least 1 rating
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-1">Rating</h3>
                                        <div className="flex items-center">
                                            {/* Star icons based on averageRating */}
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className={`h-5 w-5 ${toilet.averageRating >= star ? "text-yellow-500" : "text-gray-300"
                                                            }`}
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span className="ml-2 text-gray-600 text-sm">
                                                ({toilet.totalRatings})
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    // If totalRatings is 0 or undefined
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold mb-1">Rating</h3>
                                        <p className="text-gray-500">No ratings available</p>
                                    </div>
                                )}

                            </div>
                            <Link
                                to="/"
                                className="mt-4 inline-block text-center text-blue-600 hover:underline"
                            >
                                Back to List
                            </Link>
                        </div>
                    </div>
                </div>
                <RatingSystem toiletId={id} />
            </div>
        </>
    );
};

export default ToiletDetailsPage;
