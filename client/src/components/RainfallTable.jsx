import React, { useState, useEffect, useCallback } from 'react';
import {
   CloudRain,
   Search,
   Filter,
   RefreshCw,
   Calendar,
   MapPin,
   TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../api';
import RainfallModal from './RainfallModal';

const RainfallTable = ({ apiKey, isAdmin }) => {
   const [rainfallData, setRainfallData] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedArea, setSelectedArea] = useState('');
   const [selectedDate, setSelectedDate] = useState('');
   const [areas, setAreas] = useState([]);
   const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
   const [modalState, setModalState] = useState({
      isOpen: false,
      record: null
   });

   useEffect(() => {
      loadData();
      loadAreas();
   }, []);


   const loadData = async () => {
      try {
         setIsLoading(true);
         const response = await apiService.getAllRainfall();
         if (response.success) {
            setRainfallData(response.data);
         }
      } catch (error) {
         console.error('Error loading rainfall data:', error);
         toast.error('Failed to load rainfall data');
      } finally {
         setIsLoading(false);
      }
   };

   const loadAreas = async () => {
      try {
         const response = await apiService.getAreas();
         if (response.success) {
            setAreas(response.data);
         }
      } catch (error) {
         console.error('Error loading areas:', error);
      }
   };

   const filterData = useCallback(() => {
      let filtered = [...rainfallData];

      // Search filter
      if (searchTerm) {
         filtered = filtered.filter(item =>
            item.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.date.includes(searchTerm)
         );
      }

      // Area filter
      if (selectedArea) {
         filtered = filtered.filter(item => item.area === selectedArea);
      }

      // Date filter
      if (selectedDate) {
         filtered = filtered.filter(item =>
            item.date.split('T')[0] === selectedDate
         );
      }

      // Sorting
      filtered.sort((a, b) => {
         let aValue = a[sortConfig.key];
         let bValue = b[sortConfig.key];

         if (sortConfig.key === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
         }

         if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
         }
         if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
         }
         return 0;
      });

      setFilteredData(filtered);
   }, [rainfallData, searchTerm, selectedArea, selectedDate, sortConfig]);

   const handleSort = (key) => {
      setSortConfig(prev => ({
         key,
         direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
      }));
   };

   const clearFilters = () => {
      setSearchTerm('');
      setSelectedArea('');
      setSelectedDate('');
   };

   const calculateTotal = (record) => {
      return (record.am1 + record.am2 + record.pm1 + record.pm2).toFixed(1);
   };

   const getRainfallLevel = (total) => {
      if (total < 1) return { level: 'Light', color: 'text-green-600', bg: 'bg-green-100' };
      if (total < 5) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      if (total < 10) return { level: 'Heavy', color: 'text-orange-600', bg: 'bg-orange-100' };
      return { level: 'Very Heavy', color: 'text-red-600', bg: 'bg-red-100' };
   };

   const openAddModal = () => {
      setModalState({ isOpen: true, record: null });
   };

   const openEditModal = (record) => {
      setModalState({ isOpen: true, record });
   };

   const closeModal = () => {
      setModalState({ isOpen: false, record: null });
   };

   const handleModalSuccess = () => {
      loadData(); // Refresh the data after successful operation
   };

   useEffect(() => {
      filterData();
   }, [filterData]);
   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h1 className="text-3xl font-bold text-gray-900">Rainfall Data</h1>
               <p className="text-gray-600">Monitor and analyze rainfall records from all stations</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
               <button
                  onClick={loadData}
                  disabled={isLoading}
                  className="btn-secondary flex items-center space-x-2"
               >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
               </button>
            </div>
         </div>

         {/* Filters */}
         <div className="card">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
               <div className="flex-1">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search by area or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                     />
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                     <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <select
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="input-field pl-10"
                     >
                        <option value="">All Areas</option>
                        {areas.map(area => (
                           <option key={area} value={area}>{area}</option>
                        ))}
                     </select>
                  </div>

                  <div className="relative">
                     <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                     <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="input-field pl-10"
                     />
                  </div>

                  <button
                     onClick={clearFilters}
                     className="btn-secondary flex items-center justify-center space-x-2"
                  >
                     <Filter className="h-4 w-4" />
                     <span>Clear</span>
                  </button>
               </div>
            </div>
         </div>

         {/* Results Summary */}
         <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
               Showing {filteredData.length} of {rainfallData.length} records
            </span>
            {filteredData.length > 0 && (
               <span>
                  Average rainfall: {(filteredData.reduce((sum, item) => sum + parseFloat(calculateTotal(item)), 0) / filteredData.length).toFixed(1)}mm
               </span>
            )}
         </div>

         {/* Admin Add Rainfall Button */}
         {isAdmin && (
            <div className="flex justify-end mb-4">
               <button className="btn-primary" onClick={openAddModal}>Add Rainfall Record</button>
            </div>
         )}

         {/* Data Table */}
         <div className="bg-white shadow overflow-hidden">
            {isLoading ? (
               <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner mr-3"></div>
                  <span className="text-gray-600">Loading rainfall data...</span>
               </div>
            ) : filteredData.length === 0 ? (
               <div className="text-center py-12">
                  <CloudRain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                  <p className="text-gray-600">Try adjusting your filters or refresh the data.</p>
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50">
                        <tr>
                           <th
                              onClick={() => handleSort('area')}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                           >
                              <div className="flex items-center space-x-1">
                                 <span>Area</span>
                                 {sortConfig.key === 'area' && (
                                    <TrendingUp className={`h-3 w-3 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                                 )}
                              </div>
                           </th>
                           <th
                              onClick={() => handleSort('date')}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                           >
                              <div className="flex items-center space-x-1">
                                 <span>Date</span>
                                 {sortConfig.key === 'date' && (
                                    <TrendingUp className={`h-3 w-3 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                                 )}
                              </div>
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              AM1 (mm)
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              AM2 (mm)
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              PM1 (mm)
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              PM2 (mm)
                           </th>
                           <th
                              onClick={() => handleSort('total')}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                           >
                              <div className="flex items-center space-x-1">
                                 <span>Total</span>
                                 {sortConfig.key === 'total' && (
                                    <TrendingUp className={`h-3 w-3 ${sortConfig.direction === 'asc' ? 'rotate-180' : ''}`} />
                                 )}
                              </div>
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Level
                           </th>
                           {isAdmin && (
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Actions
                              </th>
                           )}
                        </tr>
                     </thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((record, index) => {
                           const total = calculateTotal(record);
                           const rainfallLevel = getRainfallLevel(parseFloat(total));

                           return (
                              <tr key={record._id || index} className="hover:bg-gray-50">
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {record.area}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(record.date).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.am1}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.am2}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.pm1}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.pm2}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    {total}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rainfallLevel.bg} ${rainfallLevel.color}`}>
                                       {rainfallLevel.level}
                                    </span>
                                 </td>
                                 {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                       <div className="flex gap-2">
                                          <button className="btn-secondary" onClick={() => openEditModal(record)}>Edit</button>
                                       </div>
                                    </td>
                                 )}
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
         {/* Rainfall Modal */}
         <RainfallModal
            isOpen={modalState.isOpen}
            onClose={closeModal}
            record={modalState.record}
            onSuccess={handleModalSuccess}
         />
      </div>
   );
}

export default RainfallTable; 