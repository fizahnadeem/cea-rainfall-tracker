import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CloudRain, User, LogOut, Menu, X, Shield, KeyRound, FilePlus2 } from 'lucide-react';

const Header = ({ apiKey, userEmail, isAdmin, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Navigation tabs
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: CloudRain },
    { name: 'Rainfall Data', href: '/rainfall', icon: CloudRain },
  ];

  // Remove the API Key tab from navigation.

  // Add Admin Panel tab if user is admin
  if (isAdmin) {
    navigation.push({ name: 'Admin Panel', href: '/admin', icon: Shield });
  }

  // Add API Docs tab for all users
  navigation.push({ name: 'API Docs', href: '/api-docs' });

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-lg flex-shrink-0">
              <CloudRain className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center leading-tight min-w-0">
              <span className="text-lg font-bold text-gray-900 whitespace-nowrap truncate">CEA Rainfall Tracker</span>
              <span className="text-xs text-gray-500 whitespace-nowrap truncate">Government Environmental Agency</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {userEmail && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {userEmail ? (
              <>
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{userEmail}</span>
                    {isAdmin && (
                      <Shield className="w-4 h-4 text-primary-600" title="Admin User" />
                    )}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="hidden md:flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-500">Welcome to CEA Rainfall Tracker</div>
            )}

            {/* Mobile menu button */}
            {userEmail && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && userEmail && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {/* Mobile User Info */}
              <div className="px-3 py-2 border-t border-gray-200 mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{userEmail}</span>
                  {isAdmin && (
                    <Shield className="w-4 h-4 text-primary-600" title="Admin User" />
                  )}
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 