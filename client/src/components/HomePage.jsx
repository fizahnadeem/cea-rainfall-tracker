import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CEA Rainfall Tracker
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Government Environmental Agency Rainfall Data Management System
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Sign In to Access System
          </Link>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Contact your administrator for account creation
          </p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Secure API key-based authentication for government environmental data access
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 