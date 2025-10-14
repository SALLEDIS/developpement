import React from 'react';
import { Bell, Search, Calendar, Menu } from 'lucide-react';
import Input from '../ui/Input';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 mr-3"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div>
            <h1 className="text-lg lg:text-2xl font-semibold text-gray-900">{title}</h1>
            <div className="hidden sm:flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-4 w-4 mr-1" />
              {currentDate}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search - Hidden on mobile */}
          <div className="hidden md:block w-64 lg:w-80">
            <Input
              placeholder="Rechercher..."
              icon={Search}
              iconPosition="left"
              size="sm"
            />
          </div>
          
          {/* Search button for mobile */}
          <button className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 lg:h-6 w-5 lg:w-6" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;