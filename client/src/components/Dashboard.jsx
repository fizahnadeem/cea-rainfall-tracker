import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
   Copy,
   Check,
   ExternalLink,
   BarChart3,
   Database,
   Shield,
   Users,
   Calendar,
   MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../api';

const Dashboard = ({ apiKey, userEmail, isAdmin }) => {
   const [stats, setStats] = useState(null);
   const [copied, setCopied] = useState({});
   const [isLoading, setIsLoading] = useState(true);
   const [userApiKey, setUserApiKey] = useState(apiKey || '');
   const [apiKeyLoading, setApiKeyLoading] = useState(false);

   useEffect(() => {
      loadStats();
      // Fetch API key if not admin and no apiKey
      if (!isAdmin && !apiKey && userEmail) {
         fetchApiKey();
      }
   }, []);

   const loadStats = async () => {
      try {
         const response = await apiService.getStats();
         if (response.success) {
            setStats(response.data);
         }
      } catch (error) {
         console.error('Error loading stats:', error);
      } finally {
         setIsLoading(false);
      }
   };

   const copyToClipboard = async (text, key) => {
      try {
         await navigator.clipboard.writeText(text);
         setCopied(prev => ({ ...prev, [key]: true }));
         toast.success('Copied to clipboard!');
         setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
      } catch (error) {
         toast.error('Failed to copy to clipboard');
      }
   };

   const fetchApiKey = async () => {
      setApiKeyLoading(true);
      try {
         const response = await apiService.requestApiAccess();
         if (response.success) {
            setUserApiKey(response.apiKey);
         }
      } catch (error) {
         toast.error('Failed to get API key');
      } finally {
         setApiKeyLoading(false);
      }
   };

   const adminRequests = [
      {
         name: 'Add Rainfall Record',
         method: 'POST',
         url: '/admin/rainfall',
         description: 'Add a new rainfall entry (Admin only)',
         body: {
            area: 'Erean',
            date: '2023-10-03',
            am1: 2.5,
            am2: 3.1,
            pm1: 1.8,
            pm2: 2.2
         }
      },
      {
         name: 'Update Rainfall Record',
         method: 'PUT',
         url: '/admin/rainfall/:id',
         description: 'Update an existing rainfall record (Admin only)'
      },
      {
         name: 'Delete Rainfall Record',
         method: 'DELETE',
         url: '/admin/rainfall/:id',
         description: 'Delete a rainfall record (Admin only)'
      }
   ];

   return (
      <div className="space-y-8">
         {/* Welcome Section */}
         <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
               Welcome to CEA Rainfall Tracker
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               Access comprehensive rainfall monitoring data from government environmental stations.
               Use your API key to integrate with our secure REST API.
            </p>
         </div>

         {/* Stats Cards */}
         {!isLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="card">
                  <div className="flex items-center">
                     <div className="p-2 bg-blue-100 rounded-lg">
                        <Database className="h-6 w-6 text-blue-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Records</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
                     </div>
                  </div>
               </div>

               <div className="card">
                  <div className="flex items-center">
                     <div className="p-2 bg-green-100 rounded-lg">
                        <MapPin className="h-6 w-6 text-green-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Monitoring Areas</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalAreas}</p>
                     </div>
                  </div>
               </div>

               <div className="card">
                  <div className="flex items-center">
                     <div className="p-2 bg-purple-100 rounded-lg">
                        <Calendar className="h-6 w-6 text-purple-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Date Range</p>
                        <p className="text-sm font-bold text-gray-900">
                           {stats.dateRange.earliestDate ?
                              new Date(stats.dateRange.earliestDate).toLocaleDateString() : 'N/A'
                           } - {stats.dateRange.latestDate ?
                              new Date(stats.dateRange.latestDate).toLocaleDateString() : 'N/A'
                           }
                        </p>
                     </div>
                  </div>
               </div>

               <div className="card">
                  <div className="flex items-center">
                     <div className="p-2 bg-orange-100 rounded-lg">
                        <Users className="h-6 w-6 text-orange-600" />
                     </div>
                     <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Your Role</p>
                        <p className="text-sm font-bold text-gray-900">
                           {isAdmin ? 'Admin User' : 'Standard User'}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* API Key Section - Only show if user has API key or is admin */}
         {(userApiKey || isAdmin) && (
            <div className="card">
               <div className="flex items-center justify-between mb-6">
                  <div>
                     <h2 className="text-2xl font-bold text-gray-900">Your API Key</h2>
                     <p className="text-gray-600">Use this key to authenticate your API requests</p>
                  </div>
                  <div className="flex items-center space-x-2">
                     <Shield className="h-5 w-5 text-primary-600" />
                     <span className="text-sm font-medium text-primary-600">
                        {isAdmin ? 'Admin Access' : 'Standard Access'}
                     </span>
                  </div>
               </div>

               <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                     <code className="text-sm font-mono text-gray-800 break-all">
                        {apiKeyLoading ? 'Loading...' : (userApiKey || 'Admin API Key (Contact Administrator)')}
                     </code>
                     {userApiKey && !apiKeyLoading && (
                        <button
                           onClick={() => copyToClipboard(userApiKey, 'apiKey')}
                           className="ml-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        >
                           {copied.apiKey ? (
                              <Check className="h-4 w-4 text-green-600" />
                           ) : (
                              <Copy className="h-4 w-4" />
                           )}
                        </button>
                     )}
                  </div>
               </div>

               <div className="mt-4 text-sm text-gray-600">
                  <p>• Include this key in the <code className="bg-gray-100 px-1 rounded">x-api-key</code> header</p>
                  <p>• Keep this key secure and don't share it publicly</p>
                  <p>• Contact support if you need to regenerate your key</p>
               </div>
            </div>
         )}



         {/* Quick Actions */}
         <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
            <Link
               to="/rainfall"
            >
               <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                     <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                     <h3 className="text-lg font-semibold text-gray-900">View Rainfall Data</h3>
                     <p className="text-gray-600">Browse and analyze rainfall records</p>
                  </div>
               </div>
            </Link>
         </div>
      </div>
   );
};

export default Dashboard; 