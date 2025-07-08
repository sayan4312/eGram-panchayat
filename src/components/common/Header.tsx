import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, User, LogOut, X, Settings as SettingsIcon, FileText as FileTextIcon, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'staff':
        return '/staff';
      default:
        return '/dashboard';
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return [
          { label: t('Dashboard'), path: '/admin', icon: SettingsIcon }
        ];
      case 'staff':
        return [
          { label: t('Dashboard'), path: '/staff', icon: SettingsIcon },
          { label: 'Application Review', path: '/staff/applications', icon: FileTextIcon },
          { label: 'Document Review', path: '/staff/review', icon: FileTextIcon }
        ];
      default:
        return [
          { label: t('Dashboard'), path: '/dashboard', icon: SettingsIcon },
          { label: t('Services'), path: '/apply', icon: FileTextIcon },
          { label: t('Applications'), path: '/applications', icon: FileTextIcon },
          { label: t('Upload'), path: '/upload', icon: FileTextIcon }
        ];
    }
  };
  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white shadow-lg border-b-4 border-primary-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">GP</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">{t('header.title')}</h1>
              <p className="text-xs text-gray-600">{t('header.subtitle')}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-2 bg-white rounded-lg shadow-sm px-2 py-1">
              {navigationItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-6 w-6 text-gray-600" />
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user.name}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                          <p className="text-xs text-primary-600 capitalize">{user.role}</p>
                        </div>
                        
                        {user.role === 'admin' && (
                            <Link
                              to="/admin"
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              onClick={() => setIsProfileMenuOpen(false)}
                            >
                            <SettingsIcon className="h-4 w-4" />
                              <span>{t('header.settings')}</span>
                            </Link>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{t('header.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {t('header.register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 bg-white rounded-lg shadow-sm">
            {user ? (
              <div className="space-y-2">
                {navigationItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      location.pathname.startsWith(item.path)
                        ? 'bg-primary-100 text-primary-700 shadow'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={user.role === 'admin'
                      ? (e) => {
                          e.preventDefault();
                          // This block is no longer needed as AdminTabContext is removed
                          // if (adminTabContext && adminTabMap[item.path]) {
                          //   adminTabContext.setActiveTab(adminTabMap[item.path]);
                          //   setIsMenuOpen(false);
                          // }
                        }
                      : () => setIsMenuOpen(false)
                    }
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  {t('header.logout')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.login')}
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;