import React, { useState } from 'react';
import { CloudRain, Mail, Shield, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../api';

const RegisterForm = ({ onRegister }) => {
   const [formData, setFormData] = useState({
      email: '',
      password: ''
   });
   const [isLoading, setIsLoading] = useState(false);
   const [success, setSuccess] = useState(false);

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.email.trim()) {
         toast.error('Please enter your email address');
         return;
      }
      if (!validateEmail(formData.email)) {
         toast.error('Please enter a valid email address');
         return;
      }
      if (!formData.password || formData.password.length < 6) {
         toast.error('Password must be at least 6 characters');
         return;
      }
      setIsLoading(true);
      try {
         const response = await apiService.registerUser(formData.email, formData.password);
         if (response.success) {
            setSuccess(true);
            toast.success('Registration successful! You can now log in.');
         } else {
            toast.error(response.message || 'Registration failed');
         }
      } catch (error) {
         const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
         toast.error(errorMessage);
      } finally {
         setIsLoading(false);
      }
   };

   if (success) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-md w-full space-y-8 text-center">
               <h2 className="mt-6 text-3xl font-bold text-gray-900">Registration Successful!</h2>
               <p className="mt-2 text-sm text-gray-600">You can now <a href="/login" className="text-primary-600 underline">log in</a> to your account.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
         <div className="max-w-md w-full space-y-8">
            <div className="text-center">
               <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <CloudRain className="h-8 w-8 text-primary-600" />
               </div>
               <h2 className="mt-6 text-3xl font-bold text-gray-900">Create Your Account</h2>
               <p className="mt-2 text-sm text-gray-600">
                  Register to access the government environmental agency's rainfall monitoring system
               </p>
            </div>
            <div className="card space-y-6">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                           id="email"
                           name="email"
                           type="email"
                           required
                           value={formData.email}
                           onChange={handleInputChange}
                           className="input-field pl-10"
                           placeholder="Enter your email address"
                        />
                     </div>
                  </div>
                  <div>
                     <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                     </label>
                     <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter a password (min 6 characters)"
                     />
                  </div>
                  <button
                     type="submit"
                     className="w-full btn-primary"
                     disabled={isLoading}
                  >
                     {isLoading ? 'Registering...' : 'Register'}
                  </button>
               </form>
               <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="text-primary-600 underline">Log in</a>
               </div>
            </div>
         </div>
      </div>
   );
};

export default RegisterForm; 