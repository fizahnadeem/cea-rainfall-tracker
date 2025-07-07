import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import RainfallTable from './components/RainfallTable';
import RegisterForm from './components/RegisterForm';
import ApiDocs from './components/ApiDocs';
import './App.css';
import { Book } from 'lucide-react'; // or any other icon

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true');

  useEffect(() => {
    // Check if user is authenticated
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('isAdmin', isAdmin);
    } else {
      localStorage.removeItem('apiKey');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('isAdmin');
    }
  }, [apiKey, userEmail, isAdmin]);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // Ignore errors
    }
    setApiKey('');
    setUserEmail('');
    setIsAdmin(false);
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Header 
          apiKey={apiKey} 
          userEmail={userEmail} 
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                apiKey ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <HomePage />
                )
              } 
            />
            <Route 
              path="/login" 
              element={
                apiKey ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <LoginForm 
                    onLoginSuccess={(userData) => {
                      setUserEmail(userData.email);
                      setApiKey(userData.token);
                      setIsAdmin(userData.isAdmin);
                    }}
                  />
                )
              } 
            />

            <Route 
              path="/register" 
              element={
                <RegisterForm />
              } 
            />

            <Route 
              path="/dashboard" 
              element={
                userEmail ? (
                  <Dashboard 
                    apiKey={apiKey}
                    userEmail={userEmail}
                    isAdmin={isAdmin}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/rainfall" 
              element={
                userEmail ? (
                  <RainfallTable 
                    apiKey={apiKey}
                    isAdmin={isAdmin}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/admin" 
              element={
                userEmail && isAdmin ? (
                  <AdminPanel 
                    userEmail={userEmail}
                    isAdmin={isAdmin}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/api-docs" 
              element={<ApiDocs />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 