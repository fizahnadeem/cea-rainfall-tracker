import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../api';

const RainfallModal = ({ isOpen, onClose, record = null, onSuccess }) => {
   const [formData, setFormData] = useState({
      area: '',
      date: '',
      am1: '',
      am2: '',
      pm1: '',
      pm2: ''
   });
   const [isLoading, setIsLoading] = useState(false);
   const [areas, setAreas] = useState([]);

   const isEditMode = !!record;

   useEffect(() => {
      if (isOpen) {
         loadAreas();
         if (record) {
            // Edit mode - populate form with existing data
            setFormData({
               area: record.area,
               date: new Date(record.date).toISOString().split('T')[0],
               am1: record.am1.toString(),
               am2: record.am2.toString(),
               pm1: record.pm1.toString(),
               pm2: record.pm2.toString()
            });
         } else {
            // Add mode - reset form
            setFormData({
               area: '',
               date: new Date().toISOString().split('T')[0],
               am1: '',
               am2: '',
               pm1: '',
               pm2: ''
            });
         }
      }
   }, [isOpen, record]);

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

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const validateForm = () => {
      if (!formData.area || !formData.date) {
         toast.error('Area and date are required');
         return false;
      }

      const rainfallValues = [formData.am1, formData.am2, formData.pm1, formData.pm2];
      for (let value of rainfallValues) {
         if (value === '' || isNaN(value) || parseFloat(value) < 0) {
            toast.error('All rainfall values must be valid non-negative numbers');
            return false;
         }
      }

      return true;
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;

      setIsLoading(true);
      try {
         const rainfallData = {
            area: formData.area,
            date: formData.date,
            am1: parseFloat(formData.am1),
            am2: parseFloat(formData.am2),
            pm1: parseFloat(formData.pm1),
            pm2: parseFloat(formData.pm2)
         };

         let response;
         if (isEditMode) {
            response = await apiService.updateRainfall(record._id, rainfallData);
         } else {
            response = await apiService.createRainfall(rainfallData);
         }

         if (response.success) {
            toast.success(response.message);
            onSuccess();
            onClose();
         } else {
            toast.error(response.message || 'Operation failed');
         }
      } catch (error) {
         console.error('Error saving rainfall record:', error);
         toast.error(error.response?.data?.message || 'Error saving rainfall record');
      } finally {
         setIsLoading(false);
      }
   };

   const handleDelete = async () => {
      if (!window.confirm('Are you sure you want to delete this rainfall record? This action cannot be undone.')) {
         return;
      }

      setIsLoading(true);
      try {
         const response = await apiService.deleteRainfall(record._id);
         if (response.success) {
            toast.success(response.message);
            onSuccess();
            onClose();
         } else {
            toast.error(response.message || 'Delete failed');
         }
      } catch (error) {
         console.error('Error deleting rainfall record:', error);
         toast.error(error.response?.data?.message || 'Error deleting rainfall record');
      } finally {
         setIsLoading(false);
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
               <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? 'Edit Rainfall Record' : 'Add Rainfall Record'}
               </h2>
               <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                  <X className="h-6 w-6" />
               </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
               {/* Area */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Area *
                  </label>
                  <select
                     name="area"
                     value={formData.area}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     required
                  >
                     <option value="">Select an area</option>
                     {areas.map(area => (
                        <option key={area} value={area}>{area}</option>
                     ))}
                  </select>
               </div>

               {/* Date */}
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Date *
                  </label>
                  <input
                     type="date"
                     name="date"
                     value={formData.date}
                     onChange={handleInputChange}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     required
                  />
               </div>

               {/* Rainfall Values */}
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        AM1 (mm)
                     </label>
                     <input
                        type="number"
                        name="am1"
                        value={formData.am1}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        AM2 (mm)
                     </label>
                     <input
                        type="number"
                        name="am2"
                        value={formData.am2}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        PM1 (mm)
                     </label>
                     <input
                        type="number"
                        name="pm1"
                        value={formData.pm1}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                        PM2 (mm)
                     </label>
                     <input
                        type="number"
                        name="pm2"
                        value={formData.pm2}
                        onChange={handleInputChange}
                        step="0.1"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                     />
                  </div>
               </div>

               {/* Total Preview */}
               <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                     Total: <span className="font-semibold">
                        {((parseFloat(formData.am1) || 0) + (parseFloat(formData.am2) || 0) + (parseFloat(formData.pm1) || 0) + (parseFloat(formData.pm2) || 0)).toFixed(1)}mm
                     </span>
                  </p>
               </div>

               {/* Action Buttons */}
               <div className="flex items-center justify-between pt-4">
                  <div className="flex space-x-3">
                     <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary flex items-center space-x-2"
                     >
                        {isLoading ? (
                           <div className="loading-spinner h-4 w-4"></div>
                        ) : (
                           <Save className="h-4 w-4" />
                        )}
                        <span>{isEditMode ? 'Update' : 'Save'}</span>
                     </button>
                     
                     {isEditMode && (
                        <button
                           type="button"
                           onClick={handleDelete}
                           disabled={isLoading}
                           className="btn-danger flex items-center space-x-2"
                        >
                           <span>Delete</span>
                        </button>
                     )}
                  </div>
                  
                  <button
                     type="button"
                     onClick={onClose}
                     disabled={isLoading}
                     className="btn-secondary"
                  >
                     Cancel
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default RainfallModal; 