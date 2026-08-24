import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-lg">

        {/* 404 Image */}
        <img
          src="https://commons.wikimedia.org/wiki/Special:Redirect/file/404_Not_Found.png"
          alt="404 - Resource Not Found"
          className="w-80 mx-auto mb-8"
        />

        {/* Error Code */}
        <h1 className="text-7xl font-extrabold text-gray-800">
          404
        </h1>

        <h2 className="text-2xl font-bold text-gray-700 mt-4">
          Resource Not Found
        </h2>

        <p className="text-gray-500 mt-3">
          Sorry! The page you are looking for does not exist.
        </p>

        {/* Home Button */}
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Go Back Home
        </Link>

      </div>
    </div>
  );
};

export default NotFoundPage;  